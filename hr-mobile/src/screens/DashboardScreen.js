import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const StatCard = ({ label, value, color }) => (
  <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
    <Text style={styles.cardValue}>{value}</Text>
    <Text style={styles.cardLabel}>{label}</Text>
  </View>
);

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      // Uses the integration endpoint — pulls from all 3 systems at once
      const { data } = await client.get('/employees/1/summary');
      setSummary(data);
    } catch (err) {
      console.log('Dashboard error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchSummary(); };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;

  const pendingLeaves  = summary?.leaves?.filter(l => l.status === 'pending').length  || 0;
  const approvedLeaves = summary?.leaves?.filter(l => l.status === 'approved').length || 0;
  const totalPayroll   = summary?.payroll?.length || 0;
  const totalAttend    = summary?.attendance?.length || 0;
  const employee       = summary?.employee;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3d5a2e']} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.username || 'Employee'}</Text>
          <Text style={styles.role}>{employee?.position || user?.role}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Integration badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          ⚡ Live data from {summary?._meta?.systems?.join(' · ')}
        </Text>
      </View>

      {/* Employee Info */}
      {employee && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Employee Info</Text>
          <Text style={styles.infoText}>📛 {employee.first_name} {employee.last_name}</Text>
          <Text style={styles.infoText}>🏢 {employee.department?.name}</Text>
          <Text style={styles.infoText}>📍 {employee.location?.name} — {employee.location?.city}</Text>
          <Text style={styles.infoText}>💼 {employee.position}</Text>
          <Text style={styles.infoText}>💰 ₱{parseFloat(employee.salary).toLocaleString()}/mo</Text>
        </View>
      )}

      {/* Stat Cards */}
      <Text style={styles.sectionTitle}>Summary</Text>
      <View style={styles.grid}>
        <StatCard label="Pending Leaves"  value={pendingLeaves}  color="#f59e0b" />
        <StatCard label="Approved Leaves" value={approvedLeaves} color="#10b981" />
        <StatCard label="Payroll Records" value={totalPayroll}   color="#8b5cf6" />
        <StatCard label="Attendance Logs" value={totalAttend}    color="#3b82f6" />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by HR Middleware API Gateway</Text>
        <Text style={styles.footerText}>Data generated: {summary?._meta?.generated_at?.slice(0,10)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f3f4f6' },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { backgroundColor: '#3d5a2e', padding: 24, paddingTop: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting:     { color: '#d1fae5', fontSize: 14 },
  name:         { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  role:         { color: '#a7f3d0', fontSize: 13, marginTop: 2 },
  logoutBtn:    { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText:   { color: '#fff', fontSize: 13 },
  badge:        { backgroundColor: '#ecfdf5', margin: 16, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#6ee7b7' },
  badgeText:    { color: '#065f46', fontSize: 12, textAlign: 'center' },
  infoCard:     { backgroundColor: '#fff', margin: 16, marginTop: 0, borderRadius: 12, padding: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginHorizontal: 16, marginBottom: 12, marginTop: 4 },
  infoText:     { fontSize: 14, color: '#374151', marginBottom: 6 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 16, margin: 8, width: '44%', elevation: 2 },
  cardValue:    { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  cardLabel:    { fontSize: 12, color: '#6b7280', marginTop: 4 },
  footer:       { padding: 16, alignItems: 'center' },
  footerText:   { fontSize: 11, color: '#9ca3af', marginBottom: 2 },
});
