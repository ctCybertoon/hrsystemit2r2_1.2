import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl, Alert, Modal, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const Tab = createBottomTabNavigator();

// ── My Dashboard ──────────────────────────────────────────────────────────────
function MyDashboard() {
  const { user, logout } = useAuth();
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      const meRes = await client.get('/auth/me');
      const employeeId = meRes.data?.employee?.id;
      if (!employeeId) return;
      const { data } = await client.get(`/employees/${employeeId}/summary`);
      setSummary(data);
    } catch (e) { console.log('Dashboard error:', e.response?.data || e.message); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchSummary(); }, []);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;

  const emp            = summary?.employee;
  const pendingLeaves  = summary?.leaves?.filter(l => l.status === 'pending').length  || 0;
  const approvedLeaves = summary?.leaves?.filter(l => l.status === 'approved').length || 0;
  const payrollCount   = summary?.payroll?.length || 0;
  const attendCount    = summary?.attendance?.length || 0;

  return (
    <ScrollView style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSummary(); }} colors={['#3d5a2e']} />}>
      <View style={s.header}>
        <View>
          <Text style={s.headerSub}>Employee Portal</Text>
          <Text style={s.headerTitle}>Welcome, {emp?.first_name || user?.username}!</Text>
          <Text style={s.headerRole}>{emp?.position} · {emp?.department?.name}</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={s.metaBadge}>
        <Text style={s.metaText}>⚡ {summary?._meta?.systems?.join(' · ')}</Text>
      </View>

      <Text style={s.sectionTitle}>Here's your summary.</Text>
      <View style={s.grid}>
        {[
          { label: 'Attendance Records', value: attendCount,    color: '#3b82f6' },
          { label: 'Pending Leaves',     value: pendingLeaves,  color: '#f59e0b' },
          { label: 'Approved Leaves',    value: approvedLeaves, color: '#10b981' },
          { label: 'Payroll Records',    value: payrollCount,   color: '#8b5cf6' },
        ].map(c => (
          <View key={c.label} style={[s.statCard, { borderLeftColor: c.color, borderLeftWidth: 4 }]}>
            <Text style={s.statNum}>{c.value}</Text>
            <Text style={s.statLabel}>{c.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ── My Leave ──────────────────────────────────────────────────────────────────
function MyLeave() {
  const [leaves, setLeaves]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal]           = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [form, setForm] = useState({ employee_id: '', leave_type_id: '', start_date: '', end_date: '', reason: '' });

  const fetchLeaves = async () => {
    try {
      const meRes = await client.get('/auth/me');
      const empId = meRes.data?.employee?.id;
      setEmployeeId(empId);
      setForm(f => ({ ...f, employee_id: String(empId) }));
      const { data } = await client.get('/leaves');
      const mine = data.filter(l => l.employee_id === empId);
      setLeaves(mine);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const submit = async () => {
    if (!form.leave_type_id || !form.start_date || !form.end_date || !form.reason) {
      Alert.alert('Error', 'Please fill in all fields.'); return;
    }
    try {
      await client.post('/leaves', form);
      Alert.alert('Success', 'Leave request submitted!');
      setModal(false);
      fetchLeaves();
    } catch (e) { Alert.alert('Error', e.response?.data?.message || 'Failed to submit.'); }
  };

  const STATUS_COLOR = { approved: '#10b981', rejected: '#ef4444', pending: '#f59e0b' };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <View style={s.header}>
        <Text style={s.headerTitle}>My Leaves</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setModal(true)}>
          <Text style={s.addBtnText}>+ File Leave</Text>
        </TouchableOpacity>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLeaves(); }} colors={['#3d5a2e']} />}>
        {leaves.length === 0
          ? <Text style={s.empty}>No leave requests yet.</Text>
          : leaves.map(l => (
            <View key={l.id} style={[s.card, { flexDirection: 'column' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={s.cardTitle}>{l.leave_type?.name}</Text>
                <View style={[s.badge, { backgroundColor: STATUS_COLOR[l.status] + '22' }]}>
                  <Text style={[s.badgeText, { color: STATUS_COLOR[l.status] }]}>{l.status?.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={s.cardSub}>📅 {l.start_date} → {l.end_date}</Text>
              <Text style={s.cardSub}>💬 {l.reason}</Text>
            </View>
          ))
        }
      </ScrollView>

      <Modal visible={modal} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>File a Leave Request</Text>
              <Text style={s.label}>Leave Type ID (1=Vacation, 2=Sick, 5=Paternity)</Text>
              <TextInput style={s.input} value={form.leave_type_id} onChangeText={v => setForm({ ...form, leave_type_id: v })} placeholder="e.g. 1" keyboardType="numeric" />
              <Text style={s.label}>Start Date (YYYY-MM-DD)</Text>
              <TextInput style={s.input} value={form.start_date} onChangeText={v => setForm({ ...form, start_date: v })} placeholder="2026-06-01" />
              <Text style={s.label}>End Date (YYYY-MM-DD)</Text>
              <TextInput style={s.input} value={form.end_date} onChangeText={v => setForm({ ...form, end_date: v })} placeholder="2026-06-05" />
              <Text style={s.label}>Reason</Text>
              <TextInput style={[s.input, { height: 70 }]} value={form.reason} onChangeText={v => setForm({ ...form, reason: v })} placeholder="State your reason..." multiline />
              <TouchableOpacity style={s.submitBtn} onPress={submit}><Text style={s.submitText}>Submit</Text></TouchableOpacity>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModal(false)}><Text style={s.cancelText}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ── My Payroll ────────────────────────────────────────────────────────────────
function MyPayroll() {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayroll = async () => {
    try {
      const meRes = await client.get('/auth/me');
      const empId = meRes.data?.employee?.id;
      if (!empId) return;
      const res = await client.get(`/payroll/employee/${empId}/full`);
      setData(res.data);
    } catch (e) { console.log('Payroll error:', e.response?.data || e.message); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchPayroll(); }, []);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;

  const payroll  = data?.payroll?.[0];
  const employee = data?.employee;

  return (
    <ScrollView style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayroll(); }} colors={['#3d5a2e']} />}>
      <View style={s.header}>
        <Text style={s.headerTitle}>My Payroll</Text>
        <Text style={s.headerSub}>Latest payslip</Text>
      </View>
      {payroll ? (
        <View style={[s.card, { flexDirection: 'column' }]}>
          <Text style={s.cardTitle}>{employee?.first_name} {employee?.last_name}</Text>
          <Text style={s.cardSub}>💼 {employee?.position}</Text>
          <View style={{ height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 }} />
          {[
            { label: 'Pay Date',     value: payroll.pay_date },
            { label: 'Basic Pay',    value: `₱${parseFloat(payroll.basic_pay).toLocaleString()}` },
            { label: 'Overtime Pay', value: `₱${parseFloat(payroll.overtime_pay).toLocaleString()}` },
            { label: 'Deductions',   value: `- ₱${parseFloat(payroll.deductions).toLocaleString()}` },
          ].map(r => (
            <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
              <Text style={{ color: '#6b7280', fontSize: 14 }}>{r.label}</Text>
              <Text style={{ color: '#1f2937', fontWeight: '500', fontSize: 14 }}>{r.value}</Text>
            </View>
          ))}
          <View style={s.netPayRow}>
            <Text style={s.netPayLabel}>NET PAY</Text>
            <Text style={s.netPayValue}>₱{parseFloat(payroll.net_pay).toLocaleString()}</Text>
          </View>
        </View>
      ) : <Text style={s.empty}>No payroll records found.</Text>}

      {data?._meta && (
        <View style={s.metaBadge}>
          <Text style={s.metaText}>⚡ {data._meta.source}</Text>
          <Text style={s.metaText}>Systems: {data._meta.systems?.join(', ')}</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ── My Attendance ─────────────────────────────────────────────────────────────
function MyAttendance() {
  const [records, setRecords]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendance = async () => {
    try {
      const meRes = await client.get('/auth/me');
      const empId = meRes.data?.employee?.id;
      const { data } = await client.get('/attendance');
      const mine = empId ? data.filter(r => r.employee_id === empId) : data;
      setRecords(mine);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const STATUS_COLOR = { present: '#10b981', absent: '#ef4444', late: '#f59e0b' };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;

  return (
    <ScrollView style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAttendance(); }} colors={['#3d5a2e']} />}>
      <View style={s.header}>
        <Text style={s.headerTitle}>My Attendance</Text>
        <Text style={s.headerSub}>{records.length} records</Text>
      </View>
      {records.length === 0
        ? <Text style={s.empty}>No attendance records found.</Text>
        : records.map(r => (
          <View key={r.id} style={[s.card, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <View>
              <Text style={s.cardTitle}>{r.date}</Text>
              <Text style={s.cardSub}>🕗 {r.time_in} → {r.time_out || '--'}</Text>
            </View>
            <View style={[s.badge, { backgroundColor: (STATUS_COLOR[r.status] || '#6b7280') + '22' }]}>
              <Text style={[s.badgeText, { color: STATUS_COLOR[r.status] || '#6b7280' }]}>{r.status?.toUpperCase()}</Text>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

// ── My Profile ────────────────────────────────────────────────────────────────
function MyProfile() {
  const { user, logout }        = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    client.get('/auth/me')
      .then(r => setEmployee(r.data?.employee))
      .catch(e => console.log(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;

  return (
    <ScrollView style={s.container}>
      <View style={[s.header, { alignItems: 'center', flexDirection: 'column', paddingBottom: 24 }]}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{employee?.first_name?.[0]}{employee?.last_name?.[0]}</Text>
        </View>
        <Text style={s.headerTitle}>{employee?.first_name} {employee?.last_name}</Text>
        <Text style={s.headerRole}>{employee?.position}</Text>
      </View>

      {[
        { icon: '📧', label: 'Email',      value: employee?.email },
        { icon: '📱', label: 'Phone',      value: employee?.phone },
        { icon: '🏢', label: 'Department', value: employee?.department?.name },
        { icon: '📍', label: 'Location',   value: employee?.location?.name },
        { icon: '💰', label: 'Salary',     value: `₱${parseFloat(employee?.salary || 0).toLocaleString()}/mo` },
        { icon: '📅', label: 'Hire Date',  value: employee?.hire_date },
        { icon: '👤', label: 'Username',   value: user?.username },
        { icon: '🔐', label: 'Role',       value: user?.role?.toUpperCase() },
      ].map(r => (
        <View key={r.label} style={[s.card, { flexDirection: 'row', gap: 12, alignItems: 'center' }]}>
          <Text style={{ fontSize: 22 }}>{r.icon}</Text>
          <View>
            <Text style={{ fontSize: 11, color: '#9ca3af' }}>{r.label}</Text>
            <Text style={{ fontSize: 15, color: '#1f2937', fontWeight: '500' }}>{r.value || '—'}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={s.logoutBtnFull} onPress={logout}>
        <Text style={s.logoutFullText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Employee Tab Navigator ────────────────────────────────────────────────────
const ICONS = { Dashboard: '🏠', 'My Leave': '📅', 'My Payroll': '💰', 'My Attendance': '📋', Profile: '👤' };

export default function EmployeeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{ICONS[route.name]}</Text>
        ),
        tabBarActiveTintColor: '#3d5a2e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 8, paddingTop: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Dashboard"     component={MyDashboard} />
      <Tab.Screen name="My Leave"      component={MyLeave} />
      <Tab.Screen name="My Payroll"    component={MyPayroll} />
      <Tab.Screen name="My Attendance" component={MyAttendance} />
      <Tab.Screen name="Profile"       component={MyProfile} />
    </Tab.Navigator>
  );
}

// ── Shared Styles ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f3f4f6' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:        { backgroundColor: '#3d5a2e', padding: 20, paddingTop: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle:   { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSub:     { color: '#a7f3d0', fontSize: 13 },
  headerRole:    { color: '#a7f3d0', fontSize: 13, marginTop: 2 },
  logoutBtn:     { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText:    { color: '#fff', fontSize: 13 },
  logoutBtnFull: { margin: 16, backgroundColor: '#fee2e2', borderRadius: 12, padding: 16, alignItems: 'center' },
  logoutFullText:{ color: '#dc2626', fontWeight: '700', fontSize: 15 },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  statCard:      { backgroundColor: '#fff', borderRadius: 12, margin: 8, padding: 16, width: '44%', elevation: 2 },
  statNum:       { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  statLabel:     { fontSize: 12, color: '#6b7280', marginTop: 4 },
  metaBadge:     { margin: 16, marginBottom: 0, backgroundColor: '#ecfdf5', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#6ee7b7' },
  metaText:      { color: '#065f46', fontSize: 12, textAlign: 'center' },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: '#1f2937', marginHorizontal: 16, marginTop: 16, marginBottom: 4 },
  card:          { backgroundColor: '#fff', borderRadius: 12, margin: 12, marginBottom: 0, padding: 16, elevation: 2, flexDirection: 'row', gap: 12 },
  cardTitle:     { fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  cardSub:       { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  badge:         { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  badgeText:     { fontSize: 11, fontWeight: '700' },
  addBtn:        { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText:    { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty:         { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:     { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle:    { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  label:         { fontSize: 13, color: '#374151', marginBottom: 4, fontWeight: '600' },
  input:         { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 14, color: '#1f2937' },
  submitBtn:     { backgroundColor: '#3d5a2e', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4 },
  submitText:    { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn:     { padding: 14, alignItems: 'center' },
  cancelText:    { color: '#6b7280', fontSize: 14 },
  avatar:        { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText:    { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  netPayRow:     { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#ecfdf5', borderRadius: 8, padding: 10, marginTop: 8 },
  netPayLabel:   { color: '#065f46', fontWeight: '700', fontSize: 14 },
  netPayValue:   { color: '#065f46', fontWeight: '800', fontSize: 16 },
});
