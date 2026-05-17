const express = require('express');
const router = express.Router();
const laravelClient = require('../config/laravelClient');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

/** GET /attendance — list all attendance records */
router.get('/', async (req, res) => {
  try {
    const { data } = await laravelClient.get('/attendance', {
      forwardToken: res.locals.token,
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed to fetch attendance' });
  }
});

/** GET /attendance/:id — single attendance record */
router.get('/:id', async (req, res) => {
  try {
    const { data } = await laravelClient.get(`/attendance/${req.params.id}`, {
      forwardToken: res.locals.token,
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Attendance record not found' });
  }
});

/** POST /attendance — log an attendance record */
router.post('/', async (req, res) => {
  try {
    const { data } = await laravelClient.post('/attendance', req.body, {
      forwardToken: res.locals.token,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed to log attendance' });
  }
});

module.exports = router;
