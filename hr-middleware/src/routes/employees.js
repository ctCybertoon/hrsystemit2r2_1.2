const express = require('express');
const router = express.Router();
const laravelClient = require('../config/laravelClient');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

/**
 * GET /employees
 * Returns the full list of employees from the HRMS.
 */
router.get('/', async (req, res) => {
  try {
    const { data } = await laravelClient.get('/employees', {
      forwardToken: res.locals.token,
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed to fetch employees' });
  }
});

/**
 * GET /employees/:id
 * Returns a single employee's profile.
 */
router.get('/:id', async (req, res) => {
  try {
    const { data } = await laravelClient.get(`/employees/${req.params.id}`, {
      forwardToken: res.locals.token,
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Employee not found' });
  }
});

/**
 * GET /employees/:id/summary
 * INTEGRATION ENDPOINT — Aggregates data across all 3 systems:
 *   - Employee profile (HRMS)
 *   - Leave balance & recent requests (Leave System)
 *   - Latest payslip (Payroll System)
 *   - Recent attendance (HRMS)
 *
 * This is the key integration point: one call to the middleware
 * returns a unified view of an employee from all systems.
 */
router.get('/:id/summary', async (req, res) => {
  const token = res.locals.token;
  const id = req.params.id;

  try {
    const [employeeRes, leavesRes, payrollRes, attendanceRes] = await Promise.allSettled([
      laravelClient.get(`/employees/${id}`, { forwardToken: token }),
      laravelClient.get(`/leave-appointments?employee_id=${id}`, { forwardToken: token }),
      laravelClient.get(`/payroll?employee_id=${id}`, { forwardToken: token }),
      laravelClient.get(`/attendance?employee_id=${id}`, { forwardToken: token }),
    ]);

    const employee = employeeRes.status === 'fulfilled' ? employeeRes.value.data : null;
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      employee,
      leaves: leavesRes.status === 'fulfilled' ? leavesRes.value.data : [],
      payroll: payrollRes.status === 'fulfilled' ? payrollRes.value.data : [],
      attendance: attendanceRes.status === 'fulfilled' ? attendanceRes.value.data : [],
      _meta: {
        generated_at: new Date().toISOString(),
        source: 'HR Middleware API Gateway',
        systems: ['HRMS', 'Leave Management', 'Payroll'],
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to aggregate employee summary' });
  }
});

/**
 * POST /employees
 * Creates a new employee in the HRMS.
 */
router.post('/', async (req, res) => {
  try {
    const { data } = await laravelClient.post('/employees', req.body, {
      forwardToken: res.locals.token,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed to create employee' });
  }
});

/**
 * PUT /employees/:id
 * Updates an employee record in the HRMS.
 */
router.put('/:id', async (req, res) => {
  try {
    const { data } = await laravelClient.put(`/employees/${req.params.id}`, req.body, {
      forwardToken: res.locals.token,
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Failed to update employee' });
  }
});

module.exports = router;
