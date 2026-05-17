import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import client from '../api/client';

const Row = ({ label, value, highlight }) => (
  <View style={[styles.row, highlight && styles.rowHighlight]}>
    <Text style={[styles.rowLabel, highlight && styles.rowLabelHL]}>{label}</Text>
    <Text style={[styles.rowValue, highlight && styles.rowValueHL]}>{value}</Text>
  </View>
);

export default function PayrollScreen() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayroll = async () => {
    try {
      // Integration endpoint — combines payroll + leave deductions + overtime
      const res = await client.get('/payroll/employee/3/full');
      setData(res.data);
    } catch (err) {
      console.log('Payroll error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPayroll(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;

  const payroll  = data?.payroll?.[0];
  const employee = data?.employee;
  const leaves   = data?.deductions?.approved_leaves || [];
  const overtime = data?.additions?.overtime || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayroll(); }} colors={['#3d5a2e']} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payroll</Text>
        <Text style={styles.headerSub}>Integration: HRMS + Leave + Payroll</Text>
      </View>

      {/* Employee */}
      {employee && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee</Text>
          <Row label="Name"     value={`${employee.first_name} ${employee.last_name}`} />
          <Row label="Position" value={employee.position} />
          <Row label="Base Salary" value={`₱${parseFloat(employee.salary).toLocaleString()}`} />
        </View>
      )}

      {/* Payslip */}
      {payroll ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Payslip</Text>
          <Row label="Pay Date"     value={payroll.pay_date} />
          <Row label="Basic Pay"    value={`₱${parseFloat(payroll.basic_pay).toLocaleString()}`} />
          <Row label="Overtime Pay" value={`₱${parseFloat(payroll.overtime_pay).toLocaleString()}`} />
          <Row label="Deductions"   value={`- ₱${parseFloat(payroll.deductions).toLocaleString()}`} />
          <Row label="NET PAY"      value={`₱${parseFloat(payroll.net_pay).toLocaleString()}`} highlight />
        </View>
      ) : (
        <Text style={styles.empty}>No payroll records found.</Text>
      )}

      {/* Leave Deductions (cross-system) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Approved Leaves Affecting Pay</Text>
        {leaves.length === 0
          ? <Text style={styles.emptySmall}>No approved leaves on record.</Text>
          : leaves.map(l => (
            <Row
              key={l.id}
              label={`${l.leave_type?.name} (${l.start_date})`}
              value={l.status.toUpperCase()}
            />
          ))
        }
      </View>

      {/* Overtime (cross-system) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overtime Records</Text>
        {overtime.length === 0
          ? <Text style={styles.emptySmall}>No overtime records.</Text>
          : overtime.map(o => (
            <Row key={o.id} label={o.date} value={`${o.hours}hrs`} />
          ))
        }
      </View>

      {/* Meta */}
      {data?._meta && (
        <View style={styles.meta}>
          <Text style={styles.metaText}>⚡ {data._meta.source}</Text>
          <Text style={styles.metaText}>Systems: {data._meta.systems?.join(', ')}</Text>
          <Text style={styles.metaText}>Generated: {data._meta.generated_at?.slice(0, 19).replace('T', ' ')}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f3f4f6' },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { backgroundColor: '#3d5a2e', padding: 20, paddingTop: 48 },
  headerTitle:  { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSub:    { color: '#a7f3d0', fontSize: 12, marginTop: 4 },
  section:      { backgroundColor: '#fff', margin: 12, marginBottom: 0, borderRadius: 12, padding: 16, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowLabel:     { fontSize: 14, color: '#6b7280' },
  rowValue:     { fontSize: 14, color: '#1f2937', fontWeight: '500' },
  rowHighlight: { backgroundColor: '#ecfdf5', borderRadius: 8, paddingHorizontal: 8, borderBottomWidth: 0, marginTop: 4 },
  rowLabelHL:   { color: '#065f46', fontWeight: '700' },
  rowValueHL:   { color: '#065f46', fontWeight: '800', fontSize: 16 },
  empty:        { textAlign: 'center', color: '#9ca3af', margin: 24 },
  emptySmall:   { color: '#9ca3af', fontSize: 13 },
  meta:         { margin: 12, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 10, borderWidth: 1, borderColor: '#bbf7d0' },
  metaText:     { fontSize: 11, color: '#16a34a', marginBottom: 2 },
});
