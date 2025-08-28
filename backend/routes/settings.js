const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Obter configurações do usuário
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth, async (req, res) => {
  try {
    const settings = await db('user_settings')
      .where({ user_id: req.userId })
      .first();

    if (!settings) {
      // Criar configurações padrão se não existirem
      const defaultSettings = {
        user_id: req.userId,
        notification_settings: JSON.stringify({
          measurementReminders: true,
          highGlucoseAlerts: true,
          lowGlucoseAlerts: true,
          medicationReminders: true,
          weeklyReports: true
        }),
        privacy_settings: JSON.stringify({
          shareWithDoctor: false,
          anonymousAnalytics: true,
          dataExport: true
        }),
        data_settings: JSON.stringify({
          autoBackup: true,
          backupFrequency: 'daily',
          dataRetention: '2years'
        }),
        reminder_times: JSON.stringify({
          breakfast: '07:00',
          lunch: '12:00',
          dinner: '18:00',
          bedtime: '22:00'
        })
      };

      const [newSettings] = await db('user_settings')
        .insert(defaultSettings)
        .returning('*');

      return res.json({
        settings: {
          notificationSettings: JSON.parse(newSettings.notification_settings),
          privacySettings: JSON.parse(newSettings.privacy_settings),
          dataSettings: JSON.parse(newSettings.data_settings),
          reminderTimes: JSON.parse(newSettings.reminder_times)
        }
      });
    }

    res.json({
      settings: {
        notificationSettings: JSON.parse(settings.notification_settings),
        privacySettings: JSON.parse(settings.privacy_settings),
        dataSettings: JSON.parse(settings.data_settings),
        reminderTimes: JSON.parse(settings.reminder_times)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Atualizar configurações do usuário
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 */
router.put('/', auth, [
  body('notificationSettings').optional().isObject(),
  body('privacySettings').optional().isObject(),
  body('dataSettings').optional().isObject(),
  body('reminderTimes').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const {
      notificationSettings,
      privacySettings,
      dataSettings,
      reminderTimes
    } = req.body;

    // Buscar configurações existentes
    let settings = await db('user_settings')
      .where({ user_id: req.userId })
      .first();

    const updateData = { updated_at: db.fn.now() };
    
    if (notificationSettings) {
      updateData.notification_settings = JSON.stringify(notificationSettings);
    }
    if (privacySettings) {
      updateData.privacy_settings = JSON.stringify(privacySettings);
    }
    if (dataSettings) {
      updateData.data_settings = JSON.stringify(dataSettings);
    }
    if (reminderTimes) {
      updateData.reminder_times = JSON.stringify(reminderTimes);
    }

    if (settings) {
      // Atualizar configurações existentes
      await db('user_settings')
        .where({ user_id: req.userId })
        .update(updateData);
    } else {
      // Criar novas configurações
      await db('user_settings')
        .insert({
          user_id: req.userId,
          ...updateData
        });
    }

    // Buscar configurações atualizadas
    const updatedSettings = await db('user_settings')
      .where({ user_id: req.userId })
      .first();

    res.json({
      message: 'Configurações atualizadas com sucesso',
      settings: {
        notificationSettings: JSON.parse(updatedSettings.notification_settings),
        privacySettings: JSON.parse(updatedSettings.privacy_settings),
        dataSettings: JSON.parse(updatedSettings.data_settings),
        reminderTimes: JSON.parse(updatedSettings.reminder_times)
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/settings/alerts:
 *   get:
 *     summary: Obter alertas do usuário
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 */
router.get('/alerts', auth, async (req, res) => {
  try {
    const alerts = await db('alerts')
      .where({ user_id: req.userId })
      .orderBy('created_at', 'desc')
      .limit(50);

    res.json({
      alerts: alerts.map(alert => ({
        id: alert.id,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        glucoseValue: alert.glucose_value,
        read: alert.read,
        createdAt: alert.created_at
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/settings/alerts/{id}/read:
 *   put:
 *     summary: Marcar alerta como lido
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 */
router.put('/alerts/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await db('alerts')
      .where({ id, user_id: req.userId })
      .first();

    if (!alert) {
      return res.status(404).json({
        error: 'Alerta não encontrado'
      });
    }

    await db('alerts')
      .where({ id, user_id: req.userId })
      .update({ read: true });

    res.json({
      message: 'Alerta marcado como lido'
    });

  } catch (error) {
    console.error('Erro ao marcar alerta como lido:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/settings/alerts/mark-all-read:
 *   put:
 *     summary: Marcar todos os alertas como lidos
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 */
router.put('/alerts/mark-all-read', auth, async (req, res) => {
  try {
    await db('alerts')
      .where({ user_id: req.userId, read: false })
      .update({ read: true });

    res.json({
      message: 'Todos os alertas foram marcados como lidos'
    });

  } catch (error) {
    console.error('Erro ao marcar alertas como lidos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
