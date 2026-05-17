# HR Middleware — API Gateway

This Node.js service acts as the **integration layer** between the three HR systems:

| System | Role |
|--------|------|
| **System 1 — Laravel HRMS** | Core employee data, attendance, overtime |
| **System 2 — Leave Management** | Leave requests and approvals (within Laravel) |
| **System 3 — Payroll** | Salary computation and payslips (within Laravel) |
| **This middleware** | Unified API Gateway consumed by the mobile app |

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set LARAVEL_BASE_URL to your Laravel backend URL

# 3. Start development server
npm run dev

# 4. Start production server
npm start
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login — returns Sanctum token |
| POST | `/api/auth/logout` | Logout |
| GET  | `/api/auth/me` | Current user profile |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/:id` | Single employee |
| GET | `/api/employees/:id/summary` | **INTEGRATION** — Employee + leaves + payroll + attendance |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |

### Leave Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaves` | List all leave requests |
| GET | `/api/leaves/:id` | Single leave request |
| GET | `/api/leaves/types/list` | Available leave types |
| POST | `/api/leaves` | File a leave request |
| PATCH | `/api/leaves/:id/approve` | **INTEGRATION** — Approve leave + notify payroll |
| PATCH | `/api/leaves/:id/reject` | Reject leave request |

### Payroll
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payroll` | List all payroll records |
| GET | `/api/payroll/:id` | Single payroll record |
| GET | `/api/payroll/employee/:id/full` | **INTEGRATION** — Full payslip with leave deductions + overtime |
| POST | `/api/payroll` | Create payroll record |
| PUT | `/api/payroll/:id` | Update payroll record |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | List attendance records |
| GET | `/api/attendance/:id` | Single record |
| POST | `/api/attendance` | Log attendance |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Middleware health check |

---

## Key Integration Points

1. **`GET /api/employees/:id/summary`**
   Aggregates data from all 3 systems (HRMS + Leave + Payroll) in a single response using `Promise.allSettled` for resilience.

2. **`PATCH /api/leaves/:id/approve`**
   Approving a leave triggers a cross-system notification to the Payroll system, ensuring deductions are reflected in the next pay run.

3. **`GET /api/payroll/employee/:id/full`**
   Builds a complete payslip view by combining base salary (HRMS), approved leave deductions (Leave), overtime additions (HRMS), and tax records (Payroll).

---

## Architecture

```
[React Native Mobile App]
         │
         ▼  (HTTP / JSON)
[Node.js Middleware :4000]   ← YOU ARE HERE
         │
         ▼  (HTTP / Bearer Token)
[Laravel HRMS API :8000]
         │
         ▼
    [SQLite Database]
```
