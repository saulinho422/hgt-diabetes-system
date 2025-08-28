const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Atualizar perfil do usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               diabetesType:
 *                 type: string
 *                 enum: [type1, type2, gestational, other]
 *               diagnosisDate:
 *                 type: string
 *                 format: date
 *               targetGlucoseMin:
 *                 type: integer
 *                 minimum: 50
 *                 maximum: 100
 *               targetGlucoseMax:
 *                 type: integer
 *                 minimum: 120
 *                 maximum: 250
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.put('/profile', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome deve ter entre 2 e 255 caracteres'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Data de nascimento inválida'),
  body('diabetesType')
    .optional()
    .isIn(['type1', 'type2', 'gestational', 'other'])
    .withMessage('Tipo de diabetes inválido'),
  body('diagnosisDate')
    .optional()
    .isISO8601()
    .withMessage('Data de diagnóstico inválida'),
  body('targetGlucoseMin')
    .optional()
    .isInt({ min: 50, max: 100 })
    .withMessage('Meta mínima de glicose deve estar entre 50 e 100 mg/dL'),
  body('targetGlucoseMax')
    .optional()
    .isInt({ min: 120, max: 250 })
    .withMessage('Meta máxima de glicose deve estar entre 120 e 250 mg/dL')
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

    const {
      name,
      dateOfBirth,
      diabetesType,
      diagnosisDate,
      targetGlucoseMin,
      targetGlucoseMax
    } = req.body;

    // Preparar dados para atualização
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth;
    if (diabetesType !== undefined) updateData.diabetes_type = diabetesType;
    if (diagnosisDate !== undefined) updateData.diagnosis_date = diagnosisDate;
    if (targetGlucoseMin !== undefined) updateData.target_glucose_min = targetGlucoseMin;
    if (targetGlucoseMax !== undefined) updateData.target_glucose_max = targetGlucoseMax;
    
    updateData.updated_at = db.fn.now();

    // Atualizar usuário
    const [updatedUser] = await db('users')
      .where({ id: req.userId })
      .update(updateData)
      .returning(['id', 'name', 'email', 'diabetes_type', 'date_of_birth', 'diagnosis_date', 'target_glucose_min', 'target_glucose_max', 'updated_at']);

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        diabetesType: updatedUser.diabetes_type,
        dateOfBirth: updatedUser.date_of_birth,
        diagnosisDate: updatedUser.diagnosis_date,
        targetGlucoseMin: updatedUser.target_glucose_min,
        targetGlucoseMax: updatedUser.target_glucose_max,
        updatedAt: updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Alterar senha do usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Senha atual incorreta
 */
router.put('/change-password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
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

    const { currentPassword, newPassword } = req.body;

    // Buscar usuário com senha
    const user = await db('users')
      .select('password')
      .where({ id: req.userId })
      .first();

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Senha atual incorreta'
      });
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar senha
    await db('users')
      .where({ id: req.userId })
      .update({
        password: hashedNewPassword,
        updated_at: db.fn.now()
      });

    res.json({
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Obter estatísticas do usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas do usuário
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const [
      totalGlucoseRecords,
      totalInsulinRecords,
      recentGlucoseAvg,
      lastWeekGlucoseAvg
    ] = await Promise.all([
      // Total de registros de glicose
      db('glucose_records')
        .count('* as count')
        .where({ user_id: req.userId })
        .first()
        .then(result => parseInt(result.count)),

      // Total de registros de insulina
      db('insulin_records')
        .count('* as count')
        .where({ user_id: req.userId })
        .first()
        .then(result => parseInt(result.count)),

      // Média de glicose dos últimos 7 dias
      db('glucose_records')
        .avg('glucose_value as avg')
        .where({ user_id: req.userId })
        .where('date', '>=', db.raw("CURRENT_DATE - INTERVAL '7 days'"))
        .first()
        .then(result => parseFloat(result.avg) || 0),

      // Média de glicose da semana anterior (8-14 dias atrás)
      db('glucose_records')
        .avg('glucose_value as avg')
        .where({ user_id: req.userId })
        .where('date', '>=', db.raw("CURRENT_DATE - INTERVAL '14 days'"))
        .where('date', '<', db.raw("CURRENT_DATE - INTERVAL '7 days'"))
        .first()
        .then(result => parseFloat(result.avg) || 0)
    ]);

    // Calcular tendência
    const trend = recentGlucoseAvg > lastWeekGlucoseAvg ? 'up' : 
                  recentGlucoseAvg < lastWeekGlucoseAvg ? 'down' : 'stable';

    // Buscar alertas não lidos
    const unreadAlerts = await db('alerts')
      .count('* as count')
      .where({ user_id: req.userId, read: false })
      .first()
      .then(result => parseInt(result.count));

    res.json({
      stats: {
        totalGlucoseRecords,
        totalInsulinRecords,
        recentGlucoseAvg: Math.round(recentGlucoseAvg),
        trend,
        unreadAlerts
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/users/delete-account:
 *   delete:
 *     summary: Excluir conta do usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmation
 *             properties:
 *               password:
 *                 type: string
 *               confirmation:
 *                 type: string
 *                 enum: ['DELETE_MY_ACCOUNT']
 *     responses:
 *       200:
 *         description: Conta excluída com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Senha incorreta
 */
router.delete('/delete-account', auth, [
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  body('confirmation')
    .equals('DELETE_MY_ACCOUNT')
    .withMessage('Confirmação inválida')
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

    const { password } = req.body;

    // Buscar usuário com senha
    const user = await db('users')
      .select('password')
      .where({ id: req.userId })
      .first();

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Senha incorreta'
      });
    }

    // Excluir conta (soft delete)
    await db('users')
      .where({ id: req.userId })
      .update({
        active: false,
        updated_at: db.fn.now()
      });

    res.json({
      message: 'Conta excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
