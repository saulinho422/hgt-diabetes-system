const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/backup/create:
 *   post:
 *     summary: Criar backup dos dados do usuário
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 */
router.post('/create', auth, async (req, res) => {
  try {
    // Buscar todos os dados do usuário
    const [user, glucoseRecords, insulinRecords, settings, alerts] = await Promise.all([
      db('users')
        .select('id', 'name', 'email', 'diabetes_type', 'date_of_birth', 'diagnosis_date', 'target_glucose_min', 'target_glucose_max', 'created_at')
        .where({ id: req.userId })
        .first(),
      
      db('glucose_records')
        .select('*')
        .where({ user_id: req.userId })
        .orderBy('date'),
      
      db('insulin_records')
        .select('*')
        .where({ user_id: req.userId })
        .orderBy('date'),
      
      db('user_settings')
        .select('*')
        .where({ user_id: req.userId })
        .first(),
      
      db('alerts')
        .select('*')
        .where({ user_id: req.userId })
        .orderBy('created_at', 'desc')
    ]);

    // Criar objeto de backup
    const backupData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        userId: req.userId
      },
      user: user,
      glucoseRecords: glucoseRecords,
      insulinRecords: insulinRecords,
      settings: settings,
      alerts: alerts
    };

    // Criar diretório de backup se não existir
    const backupDir = path.join(__dirname, '../backups');
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }

    // Gerar nome do arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${req.userId}_${timestamp}.json`;
    const filePath = path.join(backupDir, filename);

    // Salvar arquivo
    await fs.writeFile(filePath, JSON.stringify(backupData, null, 2));

    // Registrar backup no banco
    const [backupRecord] = await db('backups')
      .insert({
        user_id: req.userId,
        filename,
        file_path: filePath,
        file_size: (await fs.stat(filePath)).size,
        status: 'completed'
      })
      .returning('*');

    res.json({
      message: 'Backup criado com sucesso',
      backup: {
        id: backupRecord.id,
        filename: backupRecord.filename,
        fileSize: backupRecord.file_size,
        createdAt: backupRecord.created_at
      }
    });

  } catch (error) {
    console.error('Erro ao criar backup:', error);
    
    // Registrar backup falhou
    try {
      await db('backups')
        .insert({
          user_id: req.userId,
          filename: `backup_failed_${Date.now()}`,
          status: 'failed'
        });
    } catch (dbError) {
      console.error('Erro ao registrar backup falhou:', dbError);
    }

    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/backup/list:
 *   get:
 *     summary: Listar backups do usuário
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 */
router.get('/list', auth, async (req, res) => {
  try {
    const backups = await db('backups')
      .select('id', 'filename', 'file_size', 'status', 'created_at')
      .where({ user_id: req.userId })
      .orderBy('created_at', 'desc')
      .limit(20);

    res.json({
      backups: backups.map(backup => ({
        id: backup.id,
        filename: backup.filename,
        fileSize: backup.file_size,
        status: backup.status,
        createdAt: backup.created_at
      }))
    });

  } catch (error) {
    console.error('Erro ao listar backups:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/backup/download/{id}:
 *   get:
 *     summary: Baixar backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 */
router.get('/download/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const backup = await db('backups')
      .where({ id, user_id: req.userId, status: 'completed' })
      .first();

    if (!backup) {
      return res.status(404).json({
        error: 'Backup não encontrado'
      });
    }

    // Verificar se o arquivo existe
    try {
      await fs.access(backup.file_path);
    } catch {
      return res.status(404).json({
        error: 'Arquivo de backup não encontrado'
      });
    }

    // Definir headers para download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${backup.filename}"`);

    // Enviar arquivo
    const fileContent = await fs.readFile(backup.file_path);
    res.send(fileContent);

  } catch (error) {
    console.error('Erro ao baixar backup:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/backup/restore:
 *   post:
 *     summary: Restaurar dados de backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 */
router.post('/restore', auth, [
  body('backupData')
    .isObject()
    .withMessage('Dados de backup inválidos')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { backupData } = req.body;

    // Validar estrutura do backup
    if (!backupData.exportInfo || !backupData.user || backupData.exportInfo.userId !== req.userId) {
      return res.status(400).json({
        error: 'Backup inválido ou não pertence a este usuário'
      });
    }

    // Iniciar transação
    await db.transaction(async (trx) => {
      // Limpar dados existentes (cuidado!)
      await trx('alerts').where({ user_id: req.userId }).del();
      await trx('insulin_records').where({ user_id: req.userId }).del();
      await trx('glucose_records').where({ user_id: req.userId }).del();
      await trx('user_settings').where({ user_id: req.userId }).del();

      // Restaurar registros de glicose
      if (backupData.glucoseRecords && backupData.glucoseRecords.length > 0) {
        const glucoseRecords = backupData.glucoseRecords.map(record => ({
          ...record,
          user_id: req.userId,
          id: undefined // Deixar o banco gerar novos IDs
        }));
        await trx('glucose_records').insert(glucoseRecords);
      }

      // Restaurar registros de insulina
      if (backupData.insulinRecords && backupData.insulinRecords.length > 0) {
        const insulinRecords = backupData.insulinRecords.map(record => ({
          ...record,
          user_id: req.userId,
          id: undefined
        }));
        await trx('insulin_records').insert(insulinRecords);
      }

      // Restaurar configurações
      if (backupData.settings) {
        await trx('user_settings').insert({
          ...backupData.settings,
          user_id: req.userId,
          id: undefined
        });
      }

      // Restaurar alertas (apenas os não lidos)
      if (backupData.alerts && backupData.alerts.length > 0) {
        const recentAlerts = backupData.alerts
          .filter(alert => !alert.read)
          .slice(0, 10) // Apenas os 10 mais recentes
          .map(alert => ({
            ...alert,
            user_id: req.userId,
            id: undefined
          }));
        
        if (recentAlerts.length > 0) {
          await trx('alerts').insert(recentAlerts);
        }
      }

      // Atualizar dados do usuário (exceto email e senha)
      const userUpdateData = {
        diabetes_type: backupData.user.diabetes_type,
        date_of_birth: backupData.user.date_of_birth,
        diagnosis_date: backupData.user.diagnosis_date,
        target_glucose_min: backupData.user.target_glucose_min,
        target_glucose_max: backupData.user.target_glucose_max,
        updated_at: trx.fn.now()
      };

      await trx('users')
        .where({ id: req.userId })
        .update(userUpdateData);
    });

    res.json({
      message: 'Dados restaurados com sucesso',
      restoredData: {
        glucoseRecords: backupData.glucoseRecords?.length || 0,
        insulinRecords: backupData.insulinRecords?.length || 0,
        settingsRestored: !!backupData.settings,
        alertsRestored: backupData.alerts?.filter(a => !a.read).length || 0
      }
    });

  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/backup/delete/{id}:
 *   delete:
 *     summary: Excluir backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const backup = await db('backups')
      .where({ id, user_id: req.userId })
      .first();

    if (!backup) {
      return res.status(404).json({
        error: 'Backup não encontrado'
      });
    }

    // Excluir arquivo físico
    if (backup.file_path) {
      try {
        await fs.unlink(backup.file_path);
      } catch (error) {
        console.error('Erro ao excluir arquivo de backup:', error);
      }
    }

    // Excluir registro do banco
    await db('backups')
      .where({ id, user_id: req.userId })
      .del();

    res.json({
      message: 'Backup excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir backup:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
