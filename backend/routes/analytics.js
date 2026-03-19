const express = require('express');
const { getDB, get, all } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/analytics/dashboard — full analytics for logged-in user
router.get('/dashboard', async (req, res) => {
  try {
    await getDB();
    const uid = req.user.id;

    // Total sessions per mode
    const modeCounts = await all('SELECT mode, COUNT(*) as count FROM sessions WHERE user_id = ? GROUP BY mode', [uid]);

    // Total messages
    const totalMessages = await get(
      `SELECT COUNT(*) as total FROM messages m
       JOIN sessions s ON m.session_id = s.id WHERE s.user_id = ?`,
      [uid]
    );

    // Average score per mode (interview)
    const avgScores = await all(
      'SELECT mode, ROUND(AVG(score), 1) as avg, COUNT(*) as attempts FROM scores WHERE user_id = ? GROUP BY mode',
      [uid]
    );

    // Score trend — last 10 interview scores
    const scoreTrend = await all('SELECT score, created_at FROM scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [uid]);

    // Recent sessions
    const recentSessions = await all(
      'SELECT id, mode, topic, started_at, msg_count, avg_score FROM sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT 5',
      [uid]
    );

    // Total practice time (rough: sessions * 5 min estimate per session)
    const sessionCount = await get('SELECT COUNT(*) as c FROM sessions WHERE user_id = ?', [uid]);

    // Streak: distinct days with sessions
    const activeDays = await get('SELECT COUNT(DISTINCT date(started_at)) as days FROM sessions WHERE user_id = ?', [uid]);

    res.json({
      modeCounts,
      totalMessages: totalMessages?.total || 0,
      avgScores,
      scoreTrend: scoreTrend.reverse(),
      recentSessions,
      totalSessions: sessionCount?.c || 0,
      activeDays: activeDays?.days || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
