import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl, Alert, Modal,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { sendLeaveStatusEmail } from '../services/emailService';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const Header = ({ title, sub, onAdd, addLabel, onLogout }) => (
  <View style={s.header}>
    <View>
      {sub ? <Text style={s.headerSub}>{sub}</Text> : null}
      <Text style={s.headerTitle}>{title}</Text>
    </View>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {onAdd && <TouchableOpacity style={s.addBtn} onPress={onAdd}><Text style={s.addBtnText}>{addLabel || '+ Add'}</Text></TouchableOpacity>}
      {onLogout && <TouchableOpacity style={s.logoutBtn} onPress={onLogout}><Text style={s.logoutText}>Sign Out</Text></TouchableOpacity>}
    </View>
  </View>
);

const Badge = ({ status, map }) => {
  const cfg = map[status] || { bg: '#f3f4f6', color: '#6b7280' };
  return <View style={[s.badge, { backgroundColor: cfg.bg }]}><Text style={[s.badgeText, { color: cfg.color }]}>{status?.toUpperCase()}</Text></View>;
};

const Field = ({ label, value, onChangeText, placeholder, keyboardType, multiline, secureTextEntry, editable = true }) => (
  <View style={s.fieldGroup}>
    <Text style={s.fieldLabel}>{label}</Text>
    <TextInput
      style={[s.fieldInput, multiline && { height: 80 }, !editable && { backgroundColor: '#f0fdf4', color: '#16a34a' }]}
      value={String(value ?? '')} onChangeText={onChangeText} placeholder={placeholder}
      placeholderTextColor="#9ca3af" keyboardType={keyboardType || 'default'}
      multiline={multiline} secureTextEntry={secureTextEntry} editable={editable}
    />
  </View>
);

const PickerField = ({ label, value, options, onSelect }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => String(o.value) === String(value));
  return (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TouchableOpacity style={s.pickerBtn} onPress={() => setOpen(true)}>
        <Text style={selected ? s.pickerSelected : s.pickerPlaceholder}>{selected ? selected.label : `Select ${label}`}</Text>
        <Text style={{ color: '#9ca3af' }}>▼</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity style={s.pickerOverlay} onPress={() => setOpen(false)}>
          <View style={s.pickerSheet}>
            <Text style={s.pickerTitle}>Select {label}</Text>
            <ScrollView>
              {options.map(o => (
                <TouchableOpacity key={o.value} style={[s.pickerOption, String(value) === String(o.value) && s.pickerOptionActive]}
                  onPress={() => { onSelect(o.value); setOpen(false); }}>
                  <Text style={[s.pickerOptionText, String(value) === String(o.value) && { color: '#3d5a2e', fontWeight: '700' }]}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const FormModal = ({ visible, title, onClose, onSubmit, children, error }) => (
  <Modal visible={visible} animationType="slide" transparent>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.modalOverlay}>
        <View style={s.modalCard}>
          <Text style={s.modalTitle}>{title}</Text>
          {error ? <View style={s.errorBanner}><Text style={s.errorText}>{error}</Text></View> : null}
          <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <TouchableOpacity style={s.submitBtn} onPress={onSubmit}><Text style={s.submitText}>Save</Text></TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose}><Text style={s.cancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const confirmDelete = (label, onConfirm) =>
  Alert.alert('Delete', `Delete this ${label}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);

// 1. Overview
function AdminOverview() {
  const { logout } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = async () => {
    try {
      const [emp, dept, leave, pay] = await Promise.allSettled([
        client.get('/employees'), client.get('/departments'), client.get('/leaves'), client.get('/payroll'),
      ]);
      setStats({
        employees: emp.status === 'fulfilled' ? emp.value.data.length : 0,
        departments: dept.status === 'fulfilled' ? dept.value.data.length : 0,
        pendingLeaves: leave.status === 'fulfilled' ? leave.value.data.filter(l => l.status === 'pending').length : 0,
        payrolls: pay.status === 'fulfilled' ? pay.value.data.length : 0,
      });
    } catch (e) { console.log(e); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { fetch(); }, []);
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;
  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} colors={['#3d5a2e']} />}>
      <Header title="Dashboard Overview" sub="Admin Portal" onLogout={logout} />
      <Text style={s.subtitle}>Welcome back, Admin. Here's your current snapshot.</Text>
      <View style={s.grid}>
        {[
          { label: 'TOTAL EMPLOYEES', value: stats.employees, color: '#3d5a2e' },
          { label: 'DEPARTMENTS', value: stats.departments, color: '#8fa373' },
          { label: 'PENDING LEAVES', value: stats.pendingLeaves, color: '#b5974a' },
          { label: 'PAYROLL RECORDS', value: stats.payrolls, color: '#4a5538' },
        ].map(c => (
          <View key={c.label} style={[s.statCard, { borderTopColor: c.color }]}>
            <Text style={s.statNum}>{c.value}</Text>
            <Text style={s.statLabel}>{c.label}</Text>
          </View>
        ))}
      </View>
      <View style={s.metaBadge}><Text style={s.metaText}>⚡ Live · HRMS + Leave Management + Payroll</Text></View>
    </ScrollView>
  );
}

// 2. Employees
const EMPTY_EMP = { first_name: '', last_name: '', email: '', phone: '', position: '', salary: '', hire_date: '', status: 'active', department_id: '', location_id: '', user_id: '' };
function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_EMP);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const fetchAll = async () => {
    try {
      const [emp, dept, loc] = await Promise.all([client.get('/employees'), client.get('/departments'), client.get('/locations')]);
      setEmployees(emp.data); setDepartments(dept.data); setLocations(loc.data);
    } catch (e) { console.log(e); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { fetchAll(); }, []);
  const openAdd = () => { setForm(EMPTY_EMP); setEditId(null); setError(''); setModal(true); };
  const openEdit = (e) => {
    setForm({ first_name: e.first_name, last_name: e.last_name, email: e.email, phone: e.phone || '', position: e.position, salary: String(e.salary), hire_date: e.hire_date, status: e.status, department_id: String(e.department_id), location_id: String(e.location_id), user_id: String(e.user_id) });
    setEditId(e.id); setError(''); setModal(true);
  };
  const handleSubmit = async () => {
    setError('');
    try {
      if (editId) await client.put(`/employees/${editId}`, form);
      else await client.post('/employees', form);
      setModal(false); fetchAll();
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong'); }
  };
  const handleDelete = (id) => confirmDelete('employee', async () => { await client.delete(`/employees/${id}`); fetchAll(); });
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;
  const deptOptions = departments.map(d => ({ label: d.name, value: String(d.id) }));
  const locOptions = locations.map(l => ({ label: l.name, value: String(l.id) }));
  const statusOpts = [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }];
  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <Header title="Employees" onAdd={openAdd} addLabel="+ Add Employee" />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} colors={['#3d5a2e']} />}>
        {employees.length === 0 ? <Text style={s.empty}>No employees yet.</Text> : employees.map(e => (
          <View key={e.id} style={s.card}>
            <View style={s.avatarSmall}><Text style={s.avatarSmallText}>{e.first_name?.[0]}{e.last_name?.[0]}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{e.first_name} {e.last_name}</Text>
              <Text style={s.cardSub}>💼 {e.position} · {e.department?.name}</Text>
              <Text style={s.cardSub}>📧 {e.email}</Text>
              <Text style={s.cardSub}>💰 ₱{Number(e.salary).toLocaleString()}/mo</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Badge status={e.status} map={{ active: { bg: '#dcfce7', color: '#16a34a' }, inactive: { bg: '#fee2e2', color: '#dc2626' } }} />
              <TouchableOpacity onPress={() => openEdit(e)}><Text style={s.editLink}>Edit</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(e.id)}><Text style={s.deleteLink}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <FormModal visible={modal} title={editId ? 'Edit Employee' : 'Add Employee'} onClose={() => setModal(false)} onSubmit={handleSubmit} error={error}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="First Name" value={form.first_name} onChangeText={v => setForm({ ...form, first_name: v })} /></View>
          <View style={{ flex: 1 }}><Field label="Last Name" value={form.last_name} onChangeText={v => setForm({ ...form, last_name: v })} /></View>
        </View>
        <Field label="Email" value={form.email} onChangeText={v => setForm({ ...form, email: v })} keyboardType="email-address" />
        <Field label="Phone" value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} keyboardType="phone-pad" />
        <Field label="Position" value={form.position} onChangeText={v => setForm({ ...form, position: v })} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="Salary" value={form.salary} onChangeText={v => setForm({ ...form, salary: v })} keyboardType="numeric" /></View>
          <View style={{ flex: 1 }}><Field label="Hire Date" value={form.hire_date} onChangeText={v => setForm({ ...form, hire_date: v })} placeholder="YYYY-MM-DD" /></View>
        </View>
        <PickerField label="Department" value={form.department_id} options={deptOptions} onSelect={v => setForm({ ...form, department_id: v })} />
        <PickerField label="Location" value={form.location_id} options={locOptions} onSelect={v => setForm({ ...form, location_id: v })} />
        <PickerField label="Status" value={form.status} options={statusOpts} onSelect={v => setForm({ ...form, status: v })} />
        <Field label="User ID" value={form.user_id} onChangeText={v => setForm({ ...form, user_id: v })} keyboardType="numeric" />
      </FormModal>
    </View>
  );
}

// 3. Leave Requests
function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ employee_id: '', leave_type_id: '', start_date: '', end_date: '', reason: '' });
  const [error, setError] = useState('');
  const fetchAll = async () => {
    try {
      const [l, e, lt] = await Promise.all([client.get('/leaves'), client.get('/employees'), client.get('/leaves/types/list')]);
      setLeaves(l.data); setEmployees(e.data); setLeaveTypes(lt.data);
    } catch (e) { console.log(e); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { fetchAll(); }, []);
  const handleSubmit = async () => {
    setError('');
    try { await client.post('/leaves', form); setModal(false); fetchAll(); }
    catch (e) { setError(e.response?.data?.message || 'Something went wrong'); }
  };
  const approve = async (id) => {
    try {
      const { data } = await client.patch(`/leaves/${id}/approve`);
      fetchAll();

      // Send email notification to employee
      const leave = leaves.find(l => l.id === id);
      if (leave?.employee?.email) {
        const emailSent = await sendLeaveStatusEmail({
          employeeName:  `${leave.employee.first_name} ${leave.employee.last_name}`,
          employeeEmail: leave.employee.email,
          status:        'approved',
          leaveType:     leave.leave_type?.name,
          startDate:     leave.start_date,
          endDate:       leave.end_date,
          reason:        leave.reason,
        });
        Alert.alert(
          '✅ Leave Approved',
          emailSent
            ? 'Leave approved and email notification sent to employee.'
            : 'Leave approved. Email notification could not be sent.',
        );
      } else {
        Alert.alert('✅ Leave Approved', 'Payroll system notified.');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to approve leave.');
    }
  };

  const reject = async (id) => {
    try {
      await client.patch(`/leaves/${id}/reject`);
      fetchAll();

      // Send email notification to employee
      const leave = leaves.find(l => l.id === id);
      if (leave?.employee?.email) {
        const emailSent = await sendLeaveStatusEmail({
          employeeName:  `${leave.employee.first_name} ${leave.employee.last_name}`,
          employeeEmail: leave.employee.email,
          status:        'rejected',
          leaveType:     leave.leave_type?.name,
          startDate:     leave.start_date,
          endDate:       leave.end_date,
          reason:        leave.reason,
        });
        Alert.alert(
          '❌ Leave Rejected',
          emailSent
            ? 'Leave rejected and email notification sent to employee.'
            : 'Leave rejected. Email notification could not be sent.',
        );
      } else {
        Alert.alert('❌ Leave Rejected', 'Leave has been rejected.');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to reject leave.');
    }
  };
  const handleDelete = (id) => confirmDelete('leave request', async () => { await client.delete(`/leave-appointments/${id}`); fetchAll(); });
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;
  const STATUS_MAP = { pending: { bg: '#fef3c7', color: '#d97706' }, approved: { bg: '#dcfce7', color: '#16a34a' }, rejected: { bg: '#fee2e2', color: '#dc2626' } };
  const empOptions = employees.map(e => ({ label: `${e.first_name} ${e.last_name}`, value: String(e.id) }));
  const typeOptions = leaveTypes.map(t => ({ label: t.name, value: String(t.id) }));
  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <Header title="Leave Requests" onAdd={() => { setForm({ employee_id: '', leave_type_id: '', start_date: '', end_date: '', reason: '' }); setError(''); setModal(true); }} addLabel="+ New Request" />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} colors={['#3d5a2e']} />}>
        {leaves.length === 0 ? <Text style={s.empty}>No leave requests yet.</Text> : leaves.map(l => (
          <View key={l.id} style={[s.card, { flexDirection: 'column' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={s.cardTitle}>{l.employee?.first_name} {l.employee?.last_name}</Text>
              <Badge status={l.status} map={STATUS_MAP} />
            </View>
            <Text style={s.cardSub}>📋 {l.leave_type?.name}</Text>
            <Text style={s.cardSub}>📅 {l.start_date} → {l.end_date}</Text>
            <Text style={s.cardSub}>💬 {l.reason || '—'}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'center' }}>
              {l.status === 'pending' && (
                <>
                  <TouchableOpacity style={s.approveBtn} onPress={() => approve(l.id)}><Text style={s.approveBtnText}>✓ Approve</Text></TouchableOpacity>
                  <TouchableOpacity style={s.rejectBtn} onPress={() => reject(l.id)}><Text style={s.rejectBtnText}>✗ Reject</Text></TouchableOpacity>
                </>
              )}
              <TouchableOpacity onPress={() => handleDelete(l.id)}><Text style={s.deleteLink}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <FormModal visible={modal} title="New Leave Request" onClose={() => setModal(false)} onSubmit={handleSubmit} error={error}>
        <PickerField label="Employee" value={form.employee_id} options={empOptions} onSelect={v => setForm({ ...form, employee_id: v })} />
        <PickerField label="Leave Type" value={form.leave_type_id} options={typeOptions} onSelect={v => setForm({ ...form, leave_type_id: v })} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="Start Date" value={form.start_date} onChangeText={v => setForm({ ...form, start_date: v })} placeholder="YYYY-MM-DD" /></View>
          <View style={{ flex: 1 }}><Field label="End Date" value={form.end_date} onChangeText={v => setForm({ ...form, end_date: v })} placeholder="YYYY-MM-DD" /></View>
        </View>
        <Field label="Reason" value={form.reason} onChangeText={v => setForm({ ...form, reason: v })} multiline placeholder="Optional reason..." />
      </FormModal>
    </View>
  );
}

// 4. Attendance
const EMPTY_ATT = { employee_id: '', date: '', time_in: '', time_out: '', status: 'present' };
function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_ATT);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const fetchAll = async () => {
    try {
      const [att, emp] = await Promise.all([client.get('/attendance'), client.get('/employees')]);
      setRecords(att.data); setEmployees(emp.data);
    } catch (e) { console.log(e); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { fetchAll(); }, []);
  const openAdd = () => { setForm(EMPTY_ATT); setEditId(null); setError(''); setModal(true); };
  const openEdit = (r) => { setForm({ employee_id: String(r.employee_id), date: r.date, time_in: r.time_in || '', time_out: r.time_out || '', status: r.status }); setEditId(r.id); setError(''); setModal(true); };
  const handleSubmit = async () => {
    setError('');
    try {
      if (editId) await client.put(`/attendance/${editId}`, form);
      else await client.post('/attendance', form);
      setModal(false); fetchAll();
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong'); }
  };
  const handleDelete = (id) => confirmDelete('record', async () => { await client.delete(`/attendance/${id}`); fetchAll(); });
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;
  const empOptions = employees.map(e => ({ label: `${e.first_name} ${e.last_name}`, value: String(e.id) }));
  const statusOptions = ['present', 'absent', 'late'].map(v => ({ label: v.charAt(0).toUpperCase() + v.slice(1), value: v }));
  const STATUS_MAP = { present: { bg: '#dcfce7', color: '#16a34a' }, absent: { bg: '#fee2e2', color: '#dc2626' }, late: { bg: '#fef3c7', color: '#d97706' } };
  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <Header title="Attendance" onAdd={openAdd} addLabel="+ Add Record" />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} colors={['#3d5a2e']} />}>
        {records.length === 0 ? <Text style={s.empty}>No records yet.</Text> : records.map(r => (
          <View key={r.id} style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{r.employee?.first_name} {r.employee?.last_name}</Text>
              <Text style={s.cardSub}>📅 {r.date}</Text>
              <Text style={s.cardSub}>🕗 {r.time_in || '—'} → {r.time_out || '—'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Badge status={r.status} map={STATUS_MAP} />
              <TouchableOpacity onPress={() => openEdit(r)}><Text style={s.editLink}>Edit</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(r.id)}><Text style={s.deleteLink}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <FormModal visible={modal} title={editId ? 'Edit Record' : 'Add Attendance'} onClose={() => setModal(false)} onSubmit={handleSubmit} error={error}>
        <PickerField label="Employee" value={form.employee_id} options={empOptions} onSelect={v => setForm({ ...form, employee_id: v })} />
        <Field label="Date (YYYY-MM-DD)" value={form.date} onChangeText={v => setForm({ ...form, date: v })} placeholder="2026-06-01" />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="Time In" value={form.time_in} onChangeText={v => setForm({ ...form, time_in: v })} placeholder="08:00:00" /></View>
          <View style={{ flex: 1 }}><Field label="Time Out" value={form.time_out} onChangeText={v => setForm({ ...form, time_out: v })} placeholder="17:00:00" /></View>
        </View>
        <PickerField label="Status" value={form.status} options={statusOptions} onSelect={v => setForm({ ...form, status: v })} />
      </FormModal>
    </View>
  );
}

// 5. Payroll
const EMPTY_PAY = { employee_id: '', basic_pay: '', overtime_pay: '0', deductions: '0', net_pay: '0', pay_date: '' };
function AdminPayroll() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_PAY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const fetchAll = async () => {
    try {
      const [pay, emp] = await Promise.all([client.get('/payroll'), client.get('/employees')]);
      setRecords(pay.data); setEmployees(emp.data);
    } catch (e) { console.log(e); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { fetchAll(); }, []);
  const openAdd = () => { setForm(EMPTY_PAY); setEditId(null); setError(''); setModal(true); };
  const openEdit = (r) => {
    setForm({ employee_id: String(r.employee_id), basic_pay: String(r.basic_pay), overtime_pay: String(r.overtime_pay), deductions: String(r.deductions), net_pay: String(r.net_pay), pay_date: r.pay_date });
    setEditId(r.id); setError(''); setModal(true);
  };
  const updateForm = (field, val) => {
    const updated = { ...form, [field]: val };
    const net = (parseFloat(updated.basic_pay) || 0) + (parseFloat(updated.overtime_pay) || 0) - (parseFloat(updated.deductions) || 0);
    updated.net_pay = net.toFixed(2);
    setForm(updated);
  };
  const handleSubmit = async () => {
    setError('');
    try {
      if (editId) await client.put(`/payroll/${editId}`, form);
      else await client.post('/payroll', form);
      setModal(false); fetchAll();
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong'); }
  };
  const handleDelete = (id) => confirmDelete('payroll record', async () => { await client.delete(`/payroll/${id}`); fetchAll(); });
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;
  const empOptions = employees.map(e => ({ label: `${e.first_name} ${e.last_name}`, value: String(e.id) }));
  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <Header title="Payroll" onAdd={openAdd} addLabel="+ Add Payroll" />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} colors={['#3d5a2e']} />}>
        {records.length === 0 ? <Text style={s.empty}>No payroll records yet.</Text> : records.map(r => (
          <View key={r.id} style={[s.card, { flexDirection: 'column' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={s.cardTitle}>{r.employee?.first_name} {r.employee?.last_name}</Text>
              <Text style={s.cardSub}>📅 {r.pay_date}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={s.cardSub}>Basic: ₱{Number(r.basic_pay).toLocaleString()}</Text>
              <Text style={s.cardSub}>OT: ₱{Number(r.overtime_pay).toLocaleString()}</Text>
              <Text style={[s.cardSub, { color: '#dc2626' }]}>−₱{Number(r.deductions).toLocaleString()}</Text>
            </View>
            <View style={s.netPayRow}>
              <Text style={s.netPayLabel}>NET PAY</Text>
              <Text style={s.netPayValue}>₱{Number(r.net_pay).toLocaleString()}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity onPress={() => openEdit(r)}><Text style={s.editLink}>Edit</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(r.id)}><Text style={s.deleteLink}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <FormModal visible={modal} title={editId ? 'Edit Payroll' : 'Add Payroll'} onClose={() => setModal(false)} onSubmit={handleSubmit} error={error}>
        <PickerField label="Employee" value={form.employee_id} options={empOptions} onSelect={v => setForm({ ...form, employee_id: v })} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="Basic Pay" value={form.basic_pay} onChangeText={v => updateForm('basic_pay', v)} keyboardType="numeric" placeholder="0.00" /></View>
          <View style={{ flex: 1 }}><Field label="Overtime Pay" value={form.overtime_pay} onChangeText={v => updateForm('overtime_pay', v)} keyboardType="numeric" placeholder="0.00" /></View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="Deductions" value={form.deductions} onChangeText={v => updateForm('deductions', v)} keyboardType="numeric" placeholder="0.00" /></View>
          <View style={{ flex: 1 }}><Field label="Net Pay (auto)" value={form.net_pay} editable={false} /></View>
        </View>
        <Field label="Pay Date (YYYY-MM-DD)" value={form.pay_date} onChangeText={v => setForm({ ...form, pay_date: v })} placeholder="2026-06-30" />
      </FormModal>
    </View>
  );
}

// 6. Departments
function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const fetchAll = async () => {
    try { const { data } = await client.get('/departments'); setDepartments(data); }
    catch (e) { console.log(e); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { fetchAll(); }, []);
  const openAdd = () => { setForm({ name: '', description: '' }); setEditId(null); setError(''); setModal(true); };
  const openEdit = (d) => { setForm({ name: d.name, description: d.description || '' }); setEditId(d.id); setError(''); setModal(true); };
  const handleSubmit = async () => {
    setError('');
    try {
      if (editId) await client.put(`/departments/${editId}`, form);
      else await client.post('/departments', form);
      setModal(false); fetchAll();
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong'); }
  };
  const handleDelete = (id) => confirmDelete('department', async () => { await client.delete(`/departments/${id}`); fetchAll(); });
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;
  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <Header title="Departments" onAdd={openAdd} addLabel="+ Add Department" />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} colors={['#3d5a2e']} />}>
        {departments.length === 0 ? <Text style={s.empty}>No departments yet.</Text> : departments.map((d, i) => (
          <View key={d.id} style={s.card}>
            <View style={s.numBadge}><Text style={s.numBadgeText}>{i + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{d.name}</Text>
              <Text style={s.cardSub}>{d.description || '—'}</Text>
            </View>
            <View style={{ gap: 6 }}>
              <TouchableOpacity onPress={() => openEdit(d)}><Text style={s.editLink}>Edit</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(d.id)}><Text style={s.deleteLink}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <FormModal visible={modal} title={editId ? 'Edit Department' : 'Add Department'} onClose={() => setModal(false)} onSubmit={handleSubmit} error={error}>
        <Field label="Department Name" value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="e.g. Human Resources" />
        <Field label="Description" value={form.description} onChangeText={v => setForm({ ...form, description: v })} multiline />
      </FormModal>
    </View>
  );
}

// 7. Locations
function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', country: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const fetchAll = async () => {
    try { const { data } = await client.get('/locations'); setLocations(data); }
    catch (e) { console.log(e); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { fetchAll(); }, []);
  const openAdd = () => { setForm({ name: '', address: '', city: '', country: '' }); setEditId(null); setError(''); setModal(true); };
  const openEdit = (l) => { setForm({ name: l.name, address: l.address || '', city: l.city || '', country: l.country || '' }); setEditId(l.id); setError(''); setModal(true); };
  const handleSubmit = async () => {
    setError('');
    try {
      if (editId) await client.put(`/locations/${editId}`, form);
      else await client.post('/locations', form);
      setModal(false); fetchAll();
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong'); }
  };
  const handleDelete = (id) => confirmDelete('location', async () => { await client.delete(`/locations/${id}`); fetchAll(); });
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;
  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <Header title="Locations" onAdd={openAdd} addLabel="+ Add Location" />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} colors={['#3d5a2e']} />}>
        {locations.length === 0 ? <Text style={s.empty}>No locations yet.</Text> : locations.map((l, i) => (
          <View key={l.id} style={s.card}>
            <View style={s.numBadge}><Text style={s.numBadgeText}>{i + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{l.name}</Text>
              <Text style={s.cardSub}>📍 {l.address || '—'}</Text>
              <Text style={s.cardSub}>🌏 {l.city}, {l.country}</Text>
            </View>
            <View style={{ gap: 6 }}>
              <TouchableOpacity onPress={() => openEdit(l)}><Text style={s.editLink}>Edit</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(l.id)}><Text style={s.deleteLink}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <FormModal visible={modal} title={editId ? 'Edit Location' : 'Add Location'} onClose={() => setModal(false)} onSubmit={handleSubmit} error={error}>
        <Field label="Location Name" value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="e.g. Main Office" />
        <Field label="Address" value={form.address} onChangeText={v => setForm({ ...form, address: v })} placeholder="123 Main St" />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="City" value={form.city} onChangeText={v => setForm({ ...form, city: v })} placeholder="Davao City" /></View>
          <View style={{ flex: 1 }}><Field label="Country" value={form.country} onChangeText={v => setForm({ ...form, country: v })} placeholder="Philippines" /></View>
        </View>
      </FormModal>
    </View>
  );
}

// 8. Overtime
const EMPTY_OT = { employee_id: '', date: '', hours: '', status: 'pending' };
function AdminOvertime() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_OT);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const fetchAll = async () => {
    try {
      const [ot, emp] = await Promise.all([client.get('/overtime'), client.get('/employees')]);
      setRecords(ot.data); setEmployees(emp.data);
    } catch (e) { console.log(e); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { fetchAll(); }, []);
  const openAdd = () => { setForm(EMPTY_OT); setEditId(null); setError(''); setModal(true); };
  const openEdit = (r) => { setForm({ employee_id: String(r.employee_id), date: r.date, hours: String(r.hours), status: r.status }); setEditId(r.id); setError(''); setModal(true); };
  const handleSubmit = async () => {
    setError('');
    try {
      if (editId) await client.put(`/overtime/${editId}`, form);
      else await client.post('/overtime', form);
      setModal(false); fetchAll();
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong'); }
  };
  const handleDelete = (id) => confirmDelete('record', async () => { await client.delete(`/overtime/${id}`); fetchAll(); });
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;
  const empOptions = employees.map(e => ({ label: `${e.first_name} ${e.last_name}`, value: String(e.id) }));
  const statusOptions = ['pending', 'approved', 'rejected'].map(v => ({ label: v.charAt(0).toUpperCase() + v.slice(1), value: v }));
  const STATUS_MAP = { pending: { bg: '#fef3c7', color: '#d97706' }, approved: { bg: '#dcfce7', color: '#16a34a' }, rejected: { bg: '#fee2e2', color: '#dc2626' } };
  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <Header title="Overtime" onAdd={openAdd} addLabel="+ Add Record" />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} colors={['#3d5a2e']} />}>
        {records.length === 0 ? <Text style={s.empty}>No overtime records yet.</Text> : records.map(r => (
          <View key={r.id} style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{r.employee?.first_name} {r.employee?.last_name}</Text>
              <Text style={s.cardSub}>📅 {r.date} · ⏱ {r.hours} hrs</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Badge status={r.status} map={STATUS_MAP} />
              <TouchableOpacity onPress={() => openEdit(r)}><Text style={s.editLink}>Edit</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(r.id)}><Text style={s.deleteLink}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <FormModal visible={modal} title={editId ? 'Edit Overtime' : 'Add Overtime'} onClose={() => setModal(false)} onSubmit={handleSubmit} error={error}>
        <PickerField label="Employee" value={form.employee_id} options={empOptions} onSelect={v => setForm({ ...form, employee_id: v })} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="Date (YYYY-MM-DD)" value={form.date} onChangeText={v => setForm({ ...form, date: v })} placeholder="2026-06-01" /></View>
          <View style={{ flex: 1 }}><Field label="Hours" value={form.hours} onChangeText={v => setForm({ ...form, hours: v })} keyboardType="numeric" placeholder="2.5" /></View>
        </View>
        <PickerField label="Status" value={form.status} options={statusOptions} onSelect={v => setForm({ ...form, status: v })} />
      </FormModal>
    </View>
  );
}

// 9. Users
function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'employee' });
  const [error, setError] = useState('');
  const fetchAll = async () => {
    try { const { data } = await client.get('/users'); setUsers(data); }
    catch (e) { console.log(e); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { fetchAll(); }, []);
  const handleSubmit = async () => {
    setError('');
    try { await client.post('/auth/register', form); setModal(false); setForm({ username: '', email: '', password: '', role: 'employee' }); fetchAll(); }
    catch (e) { setError(e.response?.data?.message || 'Something went wrong'); }
  };
  const handleDelete = (id) => confirmDelete('user', async () => { await client.delete(`/users/${id}`); fetchAll(); });
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;
  const roleOpts = [{ label: 'Employee', value: 'employee' }, { label: 'Admin', value: 'admin' }];
  const ROLE_MAP = { admin: { bg: '#dbeafe', color: '#1d4ed8' }, employee: { bg: '#dcfce7', color: '#16a34a' } };
  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <Header title="Users" onAdd={() => { setModal(true); setError(''); }} addLabel="+ Add User" />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} colors={['#3d5a2e']} />}>
        {users.length === 0 ? <Text style={s.empty}>No users yet.</Text> : users.map((u, i) => (
          <View key={u.id} style={s.card}>
            <View style={s.numBadge}><Text style={s.numBadgeText}>{i + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{u.username}</Text>
              <Text style={s.cardSub}>📧 {u.email}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Badge status={u.role} map={ROLE_MAP} />
              <TouchableOpacity onPress={() => handleDelete(u.id)}><Text style={s.deleteLink}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <FormModal visible={modal} title="Add New User" onClose={() => setModal(false)} onSubmit={handleSubmit} error={error}>
        <Field label="Username" value={form.username} onChangeText={v => setForm({ ...form, username: v })} placeholder="e.g. johndoe" />
        <Field label="Email" value={form.email} onChangeText={v => setForm({ ...form, email: v })} keyboardType="email-address" placeholder="john@hr.com" />
        <Field label="Password" value={form.password} onChangeText={v => setForm({ ...form, password: v })} secureTextEntry placeholder="Min 6 characters" />
        <PickerField label="Role" value={form.role} options={roleOpts} onSelect={v => setForm({ ...form, role: v })} />
      </FormModal>
    </View>
  );
}

// More screen
function MoreList({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <View style={s.header}><Text style={s.headerTitle}>More</Text></View>
      {[
        { label: '🏢  Departments', screen: 'Departments' },
        { label: '📍  Locations',   screen: 'Locations' },
        { label: '⏱  Overtime',    screen: 'Overtime' },
        { label: '👥  Users',       screen: 'Users' },
      ].map(item => (
        <TouchableOpacity key={item.screen} style={s.moreItem} onPress={() => navigation.navigate(item.screen)}>
          <Text style={s.moreItemText}>{item.label}</Text>
          <Text style={{ color: '#9ca3af', fontSize: 18 }}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function MoreScreen() {
  const S2 = createNativeStackNavigator();
  return (
    <S2.Navigator screenOptions={{ headerShown: false }}>
      <S2.Screen name="MoreList"    component={MoreList} />
      <S2.Screen name="Departments" component={AdminDepartments} />
      <S2.Screen name="Locations"   component={AdminLocations} />
      <S2.Screen name="Overtime"    component={AdminOvertime} />
      <S2.Screen name="Users"       component={AdminUsers} />
    </S2.Navigator>
  );
}

const TAB_ICONS = { Overview: '🏠', Employees: '👥', Leaves: '📅', Attendance: '📋', Payroll: '💰', More: '⋯' };

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{TAB_ICONS[route.name]}</Text>,
        tabBarActiveTintColor: '#3d5a2e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 8, paddingTop: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Overview"   component={AdminOverview} />
      <Tab.Screen name="Employees"  component={AdminEmployees} />
      <Tab.Screen name="Leaves"     component={AdminLeaves} />
      <Tab.Screen name="Attendance" component={AdminAttendance} />
      <Tab.Screen name="Payroll"    component={AdminPayroll} />
      <Tab.Screen name="More"       component={MoreScreen} />
    </Tab.Navigator>
  );
}

const s = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#f3f4f6' },
  center:            { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:            { backgroundColor: '#3d5a2e', padding: 20, paddingTop: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle:       { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSub:         { color: '#a7f3d0', fontSize: 13, marginBottom: 2 },
  subtitle:          { color: '#6b7280', fontSize: 13, marginHorizontal: 16, marginTop: 12 },
  addBtn:            { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText:        { color: '#fff', fontSize: 13, fontWeight: '600' },
  logoutBtn:         { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  logoutText:        { color: '#fff', fontSize: 12 },
  grid:              { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  statCard:          { backgroundColor: '#fff', borderRadius: 12, margin: 8, padding: 16, width: '44%', borderTopWidth: 3, elevation: 2 },
  statNum:           { fontSize: 32, fontWeight: 'bold', color: '#1f2937' },
  statLabel:         { fontSize: 11, color: '#6b7280', marginTop: 4 },
  metaBadge:         { margin: 16, backgroundColor: '#ecfdf5', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#6ee7b7' },
  metaText:          { color: '#065f46', fontSize: 12, textAlign: 'center' },
  card:              { backgroundColor: '#fff', borderRadius: 12, margin: 12, marginBottom: 0, padding: 16, elevation: 2, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  avatarSmall:       { width: 42, height: 42, borderRadius: 21, backgroundColor: '#3d5a2e', justifyContent: 'center', alignItems: 'center' },
  avatarSmallText:   { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  numBadge:          { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  numBadgeText:      { fontSize: 12, color: '#9ca3af', fontWeight: '600' },
  cardTitle:         { fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 3 },
  cardSub:           { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  badge:             { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:         { fontSize: 11, fontWeight: '700' },
  editLink:          { color: '#3d5a2e', fontSize: 12, fontWeight: '700' },
  deleteLink:        { color: '#dc2626', fontSize: 12, fontWeight: '700' },
  approveBtn:        { backgroundColor: '#dcfce7', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  approveBtnText:    { color: '#16a34a', fontWeight: '700', fontSize: 13 },
  rejectBtn:         { backgroundColor: '#fef3c7', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  rejectBtnText:     { color: '#d97706', fontWeight: '700', fontSize: 13 },
  netPayRow:         { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#ecfdf5', borderRadius: 8, padding: 10, marginTop: 8 },
  netPayLabel:       { color: '#065f46', fontWeight: '700', fontSize: 14 },
  netPayValue:       { color: '#065f46', fontWeight: '800', fontSize: 16 },
  empty:             { textAlign: 'center', color: '#9ca3af', marginTop: 48, fontSize: 14 },
  moreItem:          { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 8, borderRadius: 12, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  moreItemText:      { fontSize: 15, color: '#1f2937', fontWeight: '500' },
  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:         { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '90%' },
  modalTitle:        { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  errorBanner:       { backgroundColor: '#fee2e2', borderRadius: 8, padding: 10, marginBottom: 12 },
  errorText:         { color: '#dc2626', fontSize: 13 },
  fieldGroup:        { marginBottom: 12 },
  fieldLabel:        { fontSize: 11, fontWeight: '700', color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput:        { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, color: '#1f2937', backgroundColor: '#f9fafb' },
  pickerBtn:         { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, backgroundColor: '#f9fafb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerSelected:    { fontSize: 14, color: '#1f2937' },
  pickerPlaceholder: { fontSize: 14, color: '#9ca3af' },
  pickerOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pickerSheet:       { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '60%' },
  pickerTitle:       { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  pickerOption:      { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  pickerOptionActive:{ backgroundColor: '#f0fdf4', borderRadius: 8, paddingHorizontal: 8 },
  pickerOptionText:  { fontSize: 15, color: '#374151' },
  submitBtn:         { flex: 1, backgroundColor: '#3d5a2e', borderRadius: 10, padding: 14, alignItems: 'center' },
  submitText:        { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn:         { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelText:        { color: '#6b7280', fontWeight: '600', fontSize: 15 },
});
