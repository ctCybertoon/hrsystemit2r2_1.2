const express = require('express');
const router = express.Router();
const laravelClient = require('../config/laravelClient');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { data } = await laravelClient.get('/departments', { forwardToken: res.locals.token });
    res.json(data);
  } catch (err) { res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { data } = await laravelClient.get(`/departments/${req.params.id}`, { forwardToken: res.locals.token });
    res.json(data);
  } catch (err) { res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed' }); }
});

router.post('/', async (req, res) => {
  try {
    const { data } = await laravelClient.post('/departments', req.body, { forwardToken: res.locals.token });
    res.status(201).json(data);
  } catch (err) { res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { data } = await laravelClient.put(`/departments/${req.params.id}`, req.body, { forwardToken: res.locals.token });
    res.json(data);
  } catch (err) { res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { data } = await laravelClient.delete(`/departments/${req.params.id}`, { forwardToken: res.locals.token });
    res.json(data);
  } catch (err) { res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed' }); }
});

module.exports = router;
