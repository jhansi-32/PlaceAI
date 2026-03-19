const express = require('express');
const { getDB, run, get, all } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// POST /api/sessions — start a new session
router.post('/', async (req, res) => {
  try {
    const { mode, topic } = req.body;
    if (!mode || !topic) return res.status(400).json({ error: 'mode and topic required' });

    await getDB();
    const result = await run('INSERT INTO sessions (user_id, mode, topic) VALUES (?, ?, ?)', [req.user.id, mode, topic]);
    res.status(201).json({ sessionId: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sessions — list all sessions for user
router.get('/', async (req, res) => {
  try {
    await getDB();
    const sessions = await all(
      `SELECT id, mode, topic, started_at, ended_at, msg_count, avg_score
       FROM sessions WHERE user_id = ?
       ORDER BY started_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sessions/:id — get session + messages
router.get('/:id', async (req, res) => {
  try {
    await getDB();
    const session = await get('SELECT * FROM sessions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const messages = await all('SELECT role, content, score, created_at FROM messages WHERE session_id = ? ORDER BY id ASC', [session.id]);
    res.json({ session, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/sessions/:id/messages — save a message
router.post('/:id/messages', async (req, res) => {
  try {
    const { role, content, score } = req.body;
    if (!role || !content) return res.status(400).json({ error: 'role and content required' });

    await getDB();
    const session = await get('SELECT id FROM sessions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    await run('INSERT INTO messages (session_id, role, content, score) VALUES (?, ?, ?, ?)', [session.id, role, content, score || null]);
    await run('UPDATE sessions SET msg_count = msg_count + 1 WHERE id = ?', [session.id]);

    if (score && role === 'assistant') {
      await run('INSERT INTO scores (session_id, user_id, mode, score) VALUES (?, ?, ?, ?)', [session.id, req.user.id, req.body.mode || 'INTERVIEW', score]);
      const avg = await get('SELECT AVG(score) as avg FROM scores WHERE session_id = ?', [session.id]);
      await run('UPDATE sessions SET avg_score = ? WHERE id = ?', [avg.avg, session.id]);
    }

    res.json({ saved: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/sessions/:id/end — close session
router.patch('/:id/end', async (req, res) => {
  try {
    await getDB();
    await run("UPDATE sessions SET ended_at = datetime('now') WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ ended: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/sessions/:id
router.delete('/:id', async (req, res) => {
  try {
    await getDB();
    await run('DELETE FROM sessions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
