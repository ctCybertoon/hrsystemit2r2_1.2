require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes        = require('./routes/auth');
const employeeRoutes    = require('./routes/employees');
const leaveRoutes       = require('./routes/leaves');
const payrollRoutes     = require('./routes/payroll');
const attendanceRoutes  = require('./routes/attendance');
const departmentRoutes  = require('./routes/departments');
const locationRoutes    = require('./routes/locations');
const overtimeRoutes    = require('./routes/overtime');
const userRoutes        = require('./routes/users');

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic rate limiting — 100 requests per 15 minutes per IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'HR Middleware API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    upstream: process.env.LARAVEL_BASE_URL,
  });
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/employees',  employeeRoutes);
app.use('/api/leaves',     leaveRoutes);
app.use('/api/payroll',    payrollRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/locations',  locationRoutes);
app.use('/api/overtime',   overtimeRoutes);
app.use('/api/users',      userRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found on HR Middleware' });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal middleware error', error: err.message });
});

// ── Start server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🚀 HR Middleware running on http://localhost:${PORT}`);
  console.log(`📡 Forwarding to Laravel: ${process.env.LARAVEL_BASE_URL}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
});
