const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/glucose:
 *   post:
 *     summary: Registrar medição de glicose
 *     tags: [Glicose]
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
 *               - glucoseValue
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               period:
 *                 type: string
 *                 enum: [jejum, cafe_antes, cafe_depois, almoco_antes, almoco_depois, jantar_antes, jantar_depois, deitar]
 *               glucoseValue:
 *                 type: integer
 *                 minimum: 20
 *                 maximum: 600
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Registro criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', auth, [
  body('date')
    .isISO8601()
    .withMessage('Data inválida'),
  body('period')
    .isIn(['jejum', 'cafe_antes', 'cafe_depois', 'almoco_antes', 'almoco_depois', 'jantar_antes', 'jantar_depois', 'deitar'])
    .withMessage('Período inválido'),
  body('glucoseValue')
    .isInt({ min: 20, max: 600 })
    .withMessage('Valor de glicose deve estar entre 20 e 600 mg/dL'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Observações devem ter no máximo 500 caracteres')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { date, period, glucoseValue, notes } = req.body;

    // Verificar se já existe registro para essa data e período
    const existingRecord = await db('glucose_records')
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

    // Criar registro
    const [record] = await db('glucose_records')
      .insert({
        user_id: req.userId,
        date,
        period,
        glucose_value: glucoseValue,
        notes
      })
      .returning('*');

    // Verificar se precisa criar alertas
    const user = await db('users')
      .select('target_glucose_min', 'target_glucose_max')
      .where({ id: req.userId })
      .first();

    // Criar alerta se glicose fora da meta
    if (glucoseValue < user.target_glucose_min) {
      await db('alerts').insert({
        user_id: req.userId,
        type: 'low_glucose',
        title: 'Hipoglicemia Detectada',
        message: `Glicemia baixa registrada: ${glucoseValue} mg/dL`,
        glucose_value: glucoseValue
      });
    } else if (glucoseValue > user.target_glucose_max) {
      await db('alerts').insert({
        user_id: req.userId,
        type: 'high_glucose',
        title: 'Hiperglicemia Detectada',
        message: `Glicemia alta registrada: ${glucoseValue} mg/dL`,
        glucose_value: glucoseValue
      });
    }

    res.status(201).json({
      message: 'Registro criado com sucesso',
      record: {
        id: record.id,
        date: record.date,
        period: record.period,
        glucoseValue: record.glucose_value,
        notes: record.notes,
        createdAt: record.created_at
      }
    });

  } catch (error) {
    console.error('Erro ao criar registro de glicose:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/glucose:
 *   get:
 *     summary: Listar registros de glicose
 *     tags: [Glicose]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [jejum, cafe_antes, cafe_depois, almoco_antes, almoco_depois, jantar_antes, jantar_depois, deitar]
 *         description: Período específico
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de registros
 */
router.get('/', auth, [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data inicial inválida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data final inválida'),
  query('period')
    .optional()
    .isIn(['jejum', 'cafe_antes', 'cafe_depois', 'almoco_antes', 'almoco_depois', 'jantar_antes', 'jantar_depois', 'deitar'])
    .withMessage('Período inválido'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve estar entre 1 e 100')
], async (req, res) => {
  try {
    // Verificar erros de validação
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

    // Construir query
    let query = db('glucose_records')
      .where({ user_id: req.userId });

    if (startDate) {
      query = query.where('date', '>=', startDate);
    }

    if (endDate) {
      query = query.where('date', '<=', endDate);
    }

    if (period) {
      query = query.where('period', period);
    }

    // Buscar registros com paginação
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

    // Calcular estatísticas
    const stats = await db('glucose_records')
      .where({ user_id: req.userId })
      .where(function() {
        if (startDate) this.where('date', '>=', startDate);
        if (endDate) this.where('date', '<=', endDate);
        if (period) this.where('period', period);
      })
      .select(
        db.raw('AVG(glucose_value) as avg'),
        db.raw('MIN(glucose_value) as min'),
        db.raw('MAX(glucose_value) as max'),
        db.raw('COUNT(*) as count')
      )
      .first();

    res.json({
      records: records.map(record => ({
        id: record.id,
        date: record.date,
        period: record.period,
        glucoseValue: record.glucose_value,
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
        average: Math.round(parseFloat(stats.avg) || 0),
        minimum: parseInt(stats.min) || 0,
        maximum: parseInt(stats.max) || 0,
        count: parseInt(stats.count) || 0
      }
    });

  } catch (error) {
    console.error('Erro ao buscar registros de glicose:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/glucose/{id}:
 *   put:
 *     summary: Atualizar registro de glicose
 *     tags: [Glicose]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               glucoseValue:
 *                 type: integer
 *                 minimum: 20
 *                 maximum: 600
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Registro atualizado com sucesso
 *       404:
 *         description: Registro não encontrado
 */
router.put('/:id', auth, [
  body('glucoseValue')
    .optional()
    .isInt({ min: 20, max: 600 })
    .withMessage('Valor de glicose deve estar entre 20 e 600 mg/dL'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Observações devem ter no máximo 500 caracteres')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { glucoseValue, notes } = req.body;

    // Verificar se o registro existe e pertence ao usuário
    const existingRecord = await db('glucose_records')
      .where({ id, user_id: req.userId })
      .first();

    if (!existingRecord) {
      return res.status(404).json({
        error: 'Registro não encontrado'
      });
    }

    // Preparar dados para atualização
    const updateData = { updated_at: db.fn.now() };
    if (glucoseValue !== undefined) updateData.glucose_value = glucoseValue;
    if (notes !== undefined) updateData.notes = notes;

    // Atualizar registro
    const [updatedRecord] = await db('glucose_records')
      .where({ id, user_id: req.userId })
      .update(updateData)
      .returning('*');

    res.json({
      message: 'Registro atualizado com sucesso',
      record: {
        id: updatedRecord.id,
        date: updatedRecord.date,
        period: updatedRecord.period,
        glucoseValue: updatedRecord.glucose_value,
        notes: updatedRecord.notes,
        updatedAt: updatedRecord.updated_at
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar registro de glicose:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/glucose/{id}:
 *   delete:
 *     summary: Excluir registro de glicose
 *     tags: [Glicose]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Registro excluído com sucesso
 *       404:
 *         description: Registro não encontrado
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o registro existe e pertence ao usuário
    const existingRecord = await db('glucose_records')
      .where({ id, user_id: req.userId })
      .first();

    if (!existingRecord) {
      return res.status(404).json({
        error: 'Registro não encontrado'
      });
    }

    // Excluir registro
    await db('glucose_records')
      .where({ id, user_id: req.userId })
      .del();

    res.json({
      message: 'Registro excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir registro de glicose:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
