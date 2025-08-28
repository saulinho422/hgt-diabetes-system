const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/insulin:
 *   post:
 *     summary: Registrar dose de insulina
 *     tags: [Insulina]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - period
 *               - units
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               period:
 *                 type: string
 *                 enum: [cafe, almoco, jantar, deitar]
 *               insulinType:
 *                 type: string
 *                 enum: [rapid, long, mixed, other]
 *               units:
 *                 type: number
 *                 minimum: 0.1
 *                 maximum: 100
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Registro criado com sucesso
 */
router.post('/', auth, [
  body('date')
    .isISO8601()
    .withMessage('Data inválida'),
  body('period')
    .isIn(['cafe', 'almoco', 'jantar', 'deitar'])
    .withMessage('Período inválido'),
  body('insulinType')
    .optional()
    .isIn(['rapid', 'long', 'mixed', 'other'])
    .withMessage('Tipo de insulina inválido'),
  body('units')
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Unidades deve estar entre 0.1 e 100'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Observações devem ter no máximo 500 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { date, period, insulinType = 'rapid', units, notes } = req.body;

    // Verificar se já existe registro para essa data e período
    const existingRecord = await db('insulin_records')
      .where({
        user_id: req.userId,
        date,
        period
      })
      .first();

    if (existingRecord) {
      return res.status(409).json({
        error: 'Já existe um registro para esta data e período'
      });
    }

    const [record] = await db('insulin_records')
      .insert({
        user_id: req.userId,
        date,
        period,
        insulin_type: insulinType,
        units,
        notes
      })
      .returning('*');

    res.status(201).json({
      message: 'Registro criado com sucesso',
      record: {
        id: record.id,
        date: record.date,
        period: record.period,
        insulinType: record.insulin_type,
        units: parseFloat(record.units),
        notes: record.notes,
        createdAt: record.created_at
      }
    });

  } catch (error) {
    console.error('Erro ao criar registro de insulina:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/insulin:
 *   get:
 *     summary: Listar registros de insulina
 *     tags: [Insulina]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('period').optional().isIn(['cafe', 'almoco', 'jantar', 'deitar']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: errors.array()
      });
    }

    const {
      startDate,
      endDate,
      period,
      page = 1,
      limit = 30
    } = req.query;

    const offset = (page - 1) * limit;
    let query = db('insulin_records').where({ user_id: req.userId });

    if (startDate) query = query.where('date', '>=', startDate);
    if (endDate) query = query.where('date', '<=', endDate);
    if (period) query = query.where('period', period);

    const [records, totalCount] = await Promise.all([
      query
        .clone()
        .select('*')
        .orderBy('date', 'desc')
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),

      query
        .clone()
        .count('* as count')
        .first()
        .then(result => parseInt(result.count))
    ]);

    const stats = await db('insulin_records')
      .where({ user_id: req.userId })
      .where(function() {
        if (startDate) this.where('date', '>=', startDate);
        if (endDate) this.where('date', '<=', endDate);
        if (period) this.where('period', period);
      })
      .select(
        db.raw('AVG(units) as avg'),
        db.raw('MIN(units) as min'),
        db.raw('MAX(units) as max'),
        db.raw('SUM(units) as total'),
        db.raw('COUNT(*) as count')
      )
      .first();

    res.json({
      records: records.map(record => ({
        id: record.id,
        date: record.date,
        period: record.period,
        insulinType: record.insulin_type,
        units: parseFloat(record.units),
        notes: record.notes,
        createdAt: record.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: {
        average: parseFloat(stats.avg) || 0,
        minimum: parseFloat(stats.min) || 0,
        maximum: parseFloat(stats.max) || 0,
        total: parseFloat(stats.total) || 0,
        count: parseInt(stats.count) || 0
      }
    });

  } catch (error) {
    console.error('Erro ao buscar registros de insulina:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

router.put('/:id', auth, [
  body('units').optional().isFloat({ min: 0.1, max: 100 }),
  body('notes').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { units, notes } = req.body;

    const existingRecord = await db('insulin_records')
      .where({ id, user_id: req.userId })
      .first();

    if (!existingRecord) {
      return res.status(404).json({
        error: 'Registro não encontrado'
      });
    }

    const updateData = { updated_at: db.fn.now() };
    if (units !== undefined) updateData.units = units;
    if (notes !== undefined) updateData.notes = notes;

    const [updatedRecord] = await db('insulin_records')
      .where({ id, user_id: req.userId })
      .update(updateData)
      .returning('*');

    res.json({
      message: 'Registro atualizado com sucesso',
      record: {
        id: updatedRecord.id,
        date: updatedRecord.date,
        period: updatedRecord.period,
        insulinType: updatedRecord.insulin_type,
        units: parseFloat(updatedRecord.units),
        notes: updatedRecord.notes,
        updatedAt: updatedRecord.updated_at
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar registro de insulina:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const existingRecord = await db('insulin_records')
      .where({ id, user_id: req.userId })
      .first();

    if (!existingRecord) {
      return res.status(404).json({
        error: 'Registro não encontrado'
      });
    }

    await db('insulin_records')
      .where({ id, user_id: req.userId })
      .del();

    res.json({
      message: 'Registro excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir registro de insulina:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
