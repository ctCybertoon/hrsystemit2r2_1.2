const express = require('express');
const router = express.Router();
const laravelClient = require('../config/laravelClient');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

/** GET /payroll — list all payroll records */
router.get('/', async (req, res) => {
  try {
    const { data } = await laravelClient.get('/payroll', {
      forwardToken: res.locals.token,
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed to fetch payroll' });
  }
});

/** GET /payroll/:id — get a single payroll record */
router.get('/:id', async (req, res) => {
  try {
    const { data } = await laravelClient.get(`/payroll/${req.params.id}`, {
      forwardToken: res.locals.token,
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Payroll record not found' });
  }
});

/**
 * GET /payroll/employee/:employeeId/full
 * INTEGRATION ENDPOINT — Builds a complete payroll view by pulling from
 * multiple systems in parallel:
 *   - Employee base salary and info (HRMS)
 *   - Payroll records (Payroll System)
 *   - Approved leaves that affect pay (Leave System)
 *   - Overtime records that affect pay (HRMS)
 *   - Tax information (Payroll System)
 *
 * This aggregated view is what the mobile app shows as the payslip screen.
 */
router.get('/employee/:employeeId/full', async (req, res) => {
  const token = res.locals.token;
  const empId = req.params.employeeId;

  try {
    const [employeeRes, payrollRes, leavesRes, overtimeRes, taxRes] = await Promise.allSettled([
      laravelClient.get(`/employees/${empId}`, { forwardToken: token }),
      laravelClient.get(`/payroll?employee_id=${empId}`, { forwardToken: token }),
      laravelClient.get(`/leave-appointments?employee_id=${empId}`, { forwardToken: token }),
      laravelClient.get(`/overtime?employee_id=${empId}`, { forwardToken: token }),
      laravelClient.get(`/tax?employee_id=${empId}`, { forwardToken: token }),
    ]);

    const employee = employeeRes.status === 'fulfilled' ? employeeRes.value.data : null;
    const payroll  = payrollRes.status  === 'fulfilled' ? payrollRes.value.data  : [];
    const leaves   = leavesRes.status   === 'fulfilled' ? leavesRes.value.data   : [];
    const overtime = overtimeRes.status === 'fulfilled' ? overtimeRes.value.data : [];
    const tax      = taxRes.status      === 'fulfilled' ? taxRes.value.data      : [];

    // Filter only approved leaves (these affect deductions)
    const approvedLeaves = Array.isArray(leaves)
      ? leaves.filter(l => l.status === 'approved')
      : [];

    res.json({
      employee,
      payroll,
      deductions: {
        approved_leaves: approvedLeaves,
        tax,
      },
      additions: {
        overtime,
      },
      _meta: {
        generated_at: new Date().toISOString(),
        source: 'HR Middleware API Gateway',
        systems: ['HRMS', 'Leave Management', 'Payroll'],
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to build full payroll view' });
  }
});

/** POST /payroll — create a payroll record */
router.post('/', async (req, res) => {
  try {
    const { data } = await laravelClient.post('/payroll', req.body, {
      forwardToken: res.locals.token,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed to create payroll record' });
  }
});

/** PUT /payroll/:id — update a payroll record */
router.put('/:id', async (req, res) => {
  try {
    const { data } = await laravelClient.put(`/payroll/${req.params.id}`, req.body, {
      forwardToken: res.locals.token,
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed to update payroll' });
  }
});

module.exports = router;
