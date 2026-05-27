import emailjs from '@emailjs/browser';

const SERVICE_ID  = 'service_08om1ek';
const TEMPLATE_ID = 'template_51auqda';
const PUBLIC_KEY  = '5dDiPYhXsqSIuJ80X';

/**
 * Sends a leave status notification email to the employee.
 * Called after approve or reject actions in AdminLeaves.
 *
 * @param {object} params
 * @param {string} params.employeeName   - Full name of the employee
 * @param {string} params.employeeEmail  - Employee's email address
 * @param {string} params.status         - 'approved' or 'rejected'
 * @param {string} params.leaveType      - e.g. 'Sick Leave', 'Vacation Leave'
 * @param {string} params.startDate      - Leave start date
 * @param {string} params.endDate        - Leave end date
 * @param {string} params.reason         - Reason for leave
 */
export const sendLeaveStatusEmail = async ({
  employeeName,
  employeeEmail,
  status,
  leaveType,
  startDate,
  endDate,
  reason,
}) => {
  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        employee_name:  employeeName,
        employee_email: employeeEmail,
        to_name:        employeeName,    // ← add this
        to_email:       employeeEmail,   // ← add this
        status:         status.charAt(0).toUpperCase() + status.slice(1),
        leave_type:     leaveType  || 'Leave',
        start_date:     startDate  || '—',
        end_date:       endDate    || '—',
        reason:         reason     || 'No reason provided',
        approved:       status === 'approved' ? 'Yes' : '',
        rejected:       status === 'rejected' ? 'Yes' : '',
      },
      { publicKey: PUBLIC_KEY }
    );
    console.log(`✅ Email sent to ${employeeEmail} — Leave ${status}`);
    return true;
  } catch (err) {
    console.log('❌ EmailJS error:', JSON.stringify(err));
    return false;
  }
};
