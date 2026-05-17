import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Modal, TextInput, Alert, RefreshControl,
} from 'react-native';
import client from '../api/client';

const STATUS_COLOR = { approved: '#10b981', rejected: '#ef4444', pending: '#f59e0b' };

const LeaveCard = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.leaveType}>{item.leave_type?.name || 'Leave'}</Text>
      <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
        <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </View>
    <Text style={styles.dates}>📅 {item.start_date} → {item.end_date}</Text>
    <Text style={styles.reason}>"{item.reason}"</Text>
    <Text style={styles.employee}>👤 {item.employee?.first_name} {item.employee?.last_name}</Text>
  </View>
);

export default function LeavesScreen() {
  const [leaves, setLeaves]         = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ employee_id: '3', leave_type_id: '', start_date: '', end_date: '', reason: '' });

  const fetchData = async () => {
    try {
      const [leavesRes, typesRes] = await Promise.all([
        client.get('/leaves'),
        client.get('/leaves/types/list'),
      ]);
      setLeaves(leavesRes.data);
      setLeaveTypes(typesRes.data);
    } catch (err) {
      console.log('Leaves error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const submitLeave = async () => {
    if (!form.leave_type_id || !form.start_date || !form.end_date || !form.reason) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    try {
      await client.post('/leaves', form);
      Alert.alert('Success', 'Leave request submitted!');
      setModalVisible(false);
      setForm({ employee_id: '3', leave_type_id: '', start_date: '', end_date: '', reason: '' });
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit leave.');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leave Requests</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ File Leave</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3d5a2e']} />}
      >
        {leaves.length === 0
          ? <Text style={styles.empty}>No leave requests found.</Text>
          : leaves.map(l => <LeaveCard key={l.id} item={l} />)
        }
      </ScrollView>

      {/* File Leave Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>File a Leave Request</Text>

            <Text style={styles.label}>Leave Type ID (1=Vacation, 2=Sick)</Text>
            <TextInput
              style={styles.input}
              value={form.leave_type_id}
              onChangeText={v => setForm({ ...form, leave_type_id: v })}
              placeholder="e.g. 1"
              keyboardType="numeric"
            />
            <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={form.start_date}
              onChangeText={v => setForm({ ...form, start_date: v })}
              placeholder="2026-06-01"
            />
            <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={form.end_date}
              onChangeText={v => setForm({ ...form, end_date: v })}
              placeholder="2026-06-05"
            />
            <Text style={styles.label}>Reason</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={form.reason}
              onChangeText={v => setForm({ ...form, reason: v })}
              placeholder="State your reason..."
              multiline
            />

            <TouchableOpacity style={styles.submitBtn} onPress={submitLeave}>
              <Text style={styles.submitText}>Submit Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f3f4f6' },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { backgroundColor: '#3d5a2e', padding: 20, paddingTop: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:  { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  addBtn:       { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText:   { color: '#fff', fontSize: 13, fontWeight: '600' },
  card:         { backgroundColor: '#fff', borderRadius: 12, margin: 12, marginBottom: 0, padding: 16, elevation: 2 },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  leaveType:    { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  badge:        { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  dates:        { fontSize: 13, color: '#374151', marginBottom: 4 },
  reason:       { fontSize: 13, color: '#6b7280', fontStyle: 'italic', marginBottom: 4 },
  employee:     { fontSize: 12, color: '#9ca3af' },
  empty:        { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:    { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle:   { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  label:        { fontSize: 13, color: '#374151', marginBottom: 4, fontWeight: '600' },
  input:        { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 14, color: '#1f2937' },
  submitBtn:    { backgroundColor: '#3d5a2e', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4 },
  submitText:   { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn:    { padding: 14, alignItems: 'center' },
  cancelText:   { color: '#6b7280', fontSize: 14 },
});
