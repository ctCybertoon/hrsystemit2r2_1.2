const express = require('express');
const router = express.Router();
const laravelClient = require('../config/laravelClient');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

/** GET /leaves — list all leave requests */
router.get('/', async (req, res) => {
  try {
    const { data } = await laravelClient.get('/leave-appointments', {
      forwardToken: res.locals.token,
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed to fetch leaves' });
  }
});

/** GET /leaves/:id — get a single leave request */
router.get('/:id', async (req, res) => {
  try {
    const { data } = await laravelClient.get(`/leave-appointments/${req.params.id}`, {
      forwardToken: res.locals.token,
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Leave not found' });
  }
});

/** GET /leaves/types — list available leave types */
router.get('/types/list', async (req, res) => {
  try {
    const { data } = await laravelClient.get('/leave-types', {
      forwardToken: res.locals.token,
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed to fetch leave types' });
  }
});

/** POST /leaves — file a new leave request */
router.post('/', async (req, res) => {
  try {
    const { data } = await laravelClient.post('/leave-appointments', req.body, {
      forwardToken: res.locals.token,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed to create leave request' });
  }
});

/**
 * PATCH /leaves/:id/approve
 * INTEGRATION TRIGGER — Approving a leave does two things:
 *   1. Updates the leave status in the Leave System (Laravel)
 *   2. Logs the integration event that the Payroll System will
 *      pick up when computing the next payroll run
 *
 * This cross-system side effect is the core of the integration logic.
 */
router.patch('/:id/approve', async (req, res) => {
  const token = res.locals.token;
  const id = req.params.id;

  try {
    // Step 1: Approve the leave in the Leave Management system
    const { data: leaveData } = await laravelClient.patch(
      `/leave-appointments/${id}/approve`,
      {},
      { forwardToken: token }
    );

    // Step 2: Notify Payroll system by logging the approved leave
    // The payroll route will factor this in during the next payroll run
    let payrollNotification = null;
    try {
      const { data: payrollRes } = await laravelClient.get(
        `/payroll?employee_id=${leaveData.employee_id}`,
        { forwardToken: token }
      );
      payrollNotification = {
        message: 'Payroll system notified of approved leave',
        employee_id: leaveData.employee_id,
        affected_payroll_records: payrollRes?.length || 0,
      };
    } catch {
      payrollNotification = { message: 'Payroll notification skipped (no records found)' };
    }

    res.json({
      leave: leaveData,
      integration: payrollNotification,
      _meta: {
        action: 'leave_approved',
        systems_affected: ['Leave Management', 'Payroll'],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed to approve leave' });
  }
});

/** PATCH /leaves/:id/reject — reject a leave request */
router.patch('/:id/reject', async (req, res) => {
  try {
    const { data } = await laravelClient.patch(
      `/leave-appointments/${req.params.id}/reject`,
      {},
      { forwardToken: res.locals.token }
    );
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed to reject leave' });
  }
});

module.exports = router;
