const express = require('express');
const router = express.Router();
const laravelClient = require('../config/laravelClient');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /auth/login
 * Forwards credentials to Laravel and returns the Sanctum token.
 * The mobile app stores this token and sends it on every subsequent request.
 */
router.post('/login', async (req, res) => {
  try {
    const { data } = await laravelClient.post('/login', req.body);
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { message: 'Login failed' });
  }
});

/**
 * POST /auth/logout
 * Invalidates the Sanctum token on the Laravel side.
 */
router.post('/logout', requireAuth, async (req, res) => {
  try {
    const { data } = await laravelClient.post('/logout', {}, {
      forwardToken: res.locals.token,
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Logout failed' });
  }
});

/**
 * GET /auth/me
 * Returns the currently authenticated user's profile.
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { data } = await laravelClient.get('/me', {
      forwardToken: res.locals.token,
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed to fetch user' });
  }
});

module.exports = router;
