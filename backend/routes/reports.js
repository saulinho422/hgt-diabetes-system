const express = require('express');
const { query, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Obter dados para dashboard
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 */
router.get('/dashboard', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Estatísticas gerais
    const [
      totalRecords,
      avgGlucoseWeek,
      avgGlucoseMonth,
      totalInsulinWeek,
      unreadAlerts
    ] = await Promise.all([
      // Total de registros
      db('glucose_records')
        .count('* as count')
        .where({ user_id: req.userId })
        .first()
        .then(r => parseInt(r.count)),

      // Média de glicose última semana
      db('glucose_records')
        .avg('glucose_value as avg')
        .where({ user_id: req.userId })
        .where('date', '>=', lastWeek)
        .first()
        .then(r => Math.round(parseFloat(r.avg) || 0)),

      // Média de glicose último mês
      db('glucose_records')
        .avg('glucose_value as avg')
        .where({ user_id: req.userId })
        .where('date', '>=', lastMonth)
        .first()
        .then(r => Math.round(parseFloat(r.avg) || 0)),

      // Total de insulina última semana
      db('insulin_records')
        .sum('units as total')
        .where({ user_id: req.userId })
        .where('date', '>=', lastWeek)
        .first()
        .then(r => parseFloat(r.total) || 0),

      // Alertas não lidos
      db('alerts')
        .count('* as count')
        .where({ user_id: req.userId, read: false })
        .first()
        .then(r => parseInt(r.count))
    ]);

    // Dados para gráficos
    const glucoseChart = await db('glucose_records')
      .select('date', 'period', 'glucose_value')
      .where({ user_id: req.userId })
      .where('date', '>=', lastWeek)
      .orderBy('date')
      .orderBy('period');

    const insulinChart = await db('insulin_records')
      .select('date', 'period', 'units')
      .where({ user_id: req.userId })
      .where('date', '>=', lastWeek)
      .orderBy('date')
      .orderBy('period');

    // Registros recentes
    const recentRecords = await db('glucose_records')
      .select('date', 'period', 'glucose_value', 'created_at')
      .where({ user_id: req.userId })
      .orderBy('created_at', 'desc')
      .limit(10);

    res.json({
      stats: {
        totalRecords,
        avgGlucoseWeek,
        avgGlucoseMonth,
        totalInsulinWeek,
        unreadAlerts
      },
      charts: {
        glucose: glucoseChart.map(record => ({
          date: record.date,
          period: record.period,
          value: record.glucose_value
        })),
        insulin: insulinChart.map(record => ({
          date: record.date,
          period: record.period,
          units: parseFloat(record.units)
        }))
      },
      recentRecords: recentRecords.map(record => ({
        date: record.date,
        period: record.period,
        glucoseValue: record.glucose_value,
        createdAt: record.created_at
      }))
    });

  } catch (error) {
    console.error('Erro ao gerar dashboard:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/reports/glucose-analysis:
 *   get:
 *     summary: Análise detalhada de glicose
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 */
router.get('/glucose-analysis', auth, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: errors.array()
      });
    }

    const { startDate, endDate } = req.query;
    const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const defaultEndDate = new Date().toISOString().split('T')[0];

    const start = startDate || defaultStartDate;
    const end = endDate || defaultEndDate;

    // Buscar metas do usuário
    const user = await db('users')
      .select('target_glucose_min', 'target_glucose_max')
      .where({ id: req.userId })
      .first();

    // Análise por período
    const analysisByPeriod = await db('glucose_records')
      .select('period')
      .avg('glucose_value as avg')
      .min('glucose_value as min')
      .max('glucose_value as max')
      .count('* as count')
      .where({ user_id: req.userId })
      .whereBetween('date', [start, end])
      .groupBy('period');

    // Time in range
    const timeInRange = await db('glucose_records')
      .select(
        db.raw(`
          COUNT(CASE WHEN glucose_value BETWEEN ? AND ? THEN 1 END) as in_range,
          COUNT(CASE WHEN glucose_value < ? THEN 1 END) as below_range,
          COUNT(CASE WHEN glucose_value > ? THEN 1 END) as above_range,
          COUNT(*) as total
        `, [user.target_glucose_min, user.target_glucose_max, user.target_glucose_min, user.target_glucose_max])
      )
      .where({ user_id: req.userId })
      .whereBetween('date', [start, end])
      .first();

    // Tendências semanais
    const weeklyTrends = await db('glucose_records')
      .select(
        db.raw("DATE_TRUNC('week', date) as week"),
        db.raw('AVG(glucose_value) as avg_glucose'),
        db.raw('COUNT(*) as measurements')
      )
      .where({ user_id: req.userId })
      .whereBetween('date', [start, end])
      .groupBy(db.raw("DATE_TRUNC('week', date)"))
      .orderBy('week');

    // Padrões por dia da semana
    const dayPatterns = await db('glucose_records')
      .select(
        db.raw("EXTRACT(DOW FROM date) as day_of_week"),
        db.raw('AVG(glucose_value) as avg_glucose'),
        db.raw('COUNT(*) as count')
      )
      .where({ user_id: req.userId })
      .whereBetween('date', [start, end])
      .groupBy(db.raw("EXTRACT(DOW FROM date)"))
      .orderBy('day_of_week');

    res.json({
      period: { start, end },
      targets: {
        min: user.target_glucose_min,
        max: user.target_glucose_max
      },
      analysisByPeriod: analysisByPeriod.map(item => ({
        period: item.period,
        average: Math.round(parseFloat(item.avg)),
        minimum: parseInt(item.min),
        maximum: parseInt(item.max),
        count: parseInt(item.count)
      })),
      timeInRange: {
        inRange: parseInt(timeInRange.in_range),
        belowRange: parseInt(timeInRange.below_range),
        aboveRange: parseInt(timeInRange.above_range),
        total: parseInt(timeInRange.total),
        inRangePercentage: Math.round((parseInt(timeInRange.in_range) / parseInt(timeInRange.total)) * 100)
      },
      weeklyTrends: weeklyTrends.map(item => ({
        week: item.week,
        averageGlucose: Math.round(parseFloat(item.avg_glucose)),
        measurements: parseInt(item.measurements)
      })),
      dayPatterns: dayPatterns.map(item => ({
        dayOfWeek: parseInt(item.day_of_week),
        averageGlucose: Math.round(parseFloat(item.avg_glucose)),
        count: parseInt(item.count)
      }))
    });

  } catch (error) {
    console.error('Erro ao gerar análise de glicose:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/reports/insulin-effectiveness:
 *   get:
 *     summary: Análise de efetividade da insulina
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 */
router.get('/insulin-effectiveness', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const defaultEndDate = new Date().toISOString().split('T')[0];

    const start = startDate || defaultStartDate;
    const end = endDate || defaultEndDate;

    // Correlação insulina vs glicose por período
    const correlation = await db.raw(`
      WITH insulin_glucose AS (
        SELECT 
          i.date,
          i.period,
          i.units as insulin_units,
          COALESCE(g_before.glucose_value, 0) as glucose_before,
          COALESCE(g_after.glucose_value, 0) as glucose_after
        FROM insulin_records i
        LEFT JOIN glucose_records g_before ON 
          i.user_id = g_before.user_id AND 
          i.date = g_before.date AND
          (
            (i.period = 'cafe' AND g_before.period = 'cafe_antes') OR
            (i.period = 'almoco' AND g_before.period = 'almoco_antes') OR
            (i.period = 'jantar' AND g_before.period = 'jantar_antes')
          )
        LEFT JOIN glucose_records g_after ON 
          i.user_id = g_after.user_id AND 
          i.date = g_after.date AND
          (
            (i.period = 'cafe' AND g_after.period = 'cafe_depois') OR
            (i.period = 'almoco' AND g_after.period = 'almoco_depois') OR
            (i.period = 'jantar' AND g_after.period = 'jantar_depois')
          )
        WHERE 
          i.user_id = ? AND
          i.date BETWEEN ? AND ?
      )
      SELECT 
        period,
        AVG(insulin_units) as avg_insulin,
        AVG(glucose_before) as avg_glucose_before,
        AVG(glucose_after) as avg_glucose_after,
        AVG(glucose_after - glucose_before) as avg_glucose_change,
        COUNT(*) as count
      FROM insulin_glucose
      WHERE glucose_before > 0 AND glucose_after > 0
      GROUP BY period
    `, [req.userId, start, end]);

    // Efetividade por dose
    const doseEffectiveness = await db.raw(`
      WITH dose_ranges AS (
        SELECT 
          CASE 
            WHEN units <= 5 THEN '0-5'
            WHEN units <= 10 THEN '6-10'
            WHEN units <= 15 THEN '11-15'
            ELSE '16+'
          END as dose_range,
          units,
          (
            SELECT AVG(glucose_value)
            FROM glucose_records g
            WHERE g.user_id = i.user_id
            AND g.date = i.date
            AND (
              (i.period = 'cafe' AND g.period = 'cafe_depois') OR
              (i.period = 'almoco' AND g.period = 'almoco_depois') OR
              (i.period = 'jantar' AND g.period = 'jantar_depois')
            )
          ) as post_meal_glucose
        FROM insulin_records i
        WHERE 
          i.user_id = ? AND
          i.date BETWEEN ? AND ?
      )
      SELECT 
        dose_range,
        AVG(post_meal_glucose) as avg_post_glucose,
        COUNT(*) as count
      FROM dose_ranges
      WHERE post_meal_glucose IS NOT NULL
      GROUP BY dose_range
      ORDER BY dose_range
    `, [req.userId, start, end]);

    res.json({
      period: { start, end },
      correlationByPeriod: correlation.rows.map(row => ({
        period: row.period,
        averageInsulin: parseFloat(row.avg_insulin),
        averageGlucoseBefore: Math.round(parseFloat(row.avg_glucose_before)),
        averageGlucoseAfter: Math.round(parseFloat(row.avg_glucose_after)),
        averageGlucoseChange: Math.round(parseFloat(row.avg_glucose_change)),
        count: parseInt(row.count)
      })),
      doseEffectiveness: doseEffectiveness.rows.map(row => ({
        doseRange: row.dose_range,
        averagePostGlucose: Math.round(parseFloat(row.avg_post_glucose)),
        count: parseInt(row.count)
      }))
    });

  } catch (error) {
    console.error('Erro ao gerar análise de efetividade da insulina:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/reports/export:
 *   get:
 *     summary: Exportar dados em CSV
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 */
router.get('/export', auth, async (req, res) => {
  try {
    const { startDate, endDate, type = 'all' } = req.query;
    
    let csvData = '';
    
    if (type === 'glucose' || type === 'all') {
      const glucoseRecords = await db('glucose_records')
        .select('date', 'period', 'glucose_value', 'notes', 'created_at')
        .where({ user_id: req.userId })
        .where(function() {
          if (startDate) this.where('date', '>=', startDate);
          if (endDate) this.where('date', '<=', endDate);
        })
        .orderBy('date')
        .orderBy('period');

      csvData += 'Data,Período,Glicose (mg/dL),Observações,Criado em\n';
      glucoseRecords.forEach(record => {
        csvData += `${record.date},${record.period},${record.glucose_value},"${record.notes || ''}",${record.created_at}\n`;
      });
    }

    if (type === 'insulin' || type === 'all') {
      if (csvData) csvData += '\n';
      
      const insulinRecords = await db('insulin_records')
        .select('date', 'period', 'insulin_type', 'units', 'notes', 'created_at')
        .where({ user_id: req.userId })
        .where(function() {
          if (startDate) this.where('date', '>=', startDate);
          if (endDate) this.where('date', '<=', endDate);
        })
        .orderBy('date')
        .orderBy('period');

      csvData += 'Data,Período,Tipo de Insulina,Unidades,Observações,Criado em\n';
      insulinRecords.forEach(record => {
        csvData += `${record.date},${record.period},${record.insulin_type},${record.units},"${record.notes || ''}",${record.created_at}\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="hgt_export_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvData);

  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
