const express = require('express');
const router = express.Router();
const laravelClient = require('../config/laravelClient');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { data } = await laravelClient.get('/users', { forwardToken: res.locals.token });
    res.json(data);
  } catch (err) { res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { data } = await laravelClient.delete(`/users/${req.params.id}`, { forwardToken: res.locals.token });
    res.json(data);
  } catch (err) { res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed' }); }
});

module.exports = router;
