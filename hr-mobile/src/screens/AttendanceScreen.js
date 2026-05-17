import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import client from '../api/client';

const STATUS_COLOR = { present: '#10b981', absent: '#ef4444', late: '#f59e0b', 'on-leave': '#8b5cf6' };

export default function AttendanceScreen() {
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendance = async () => {
    try {
      const { data } = await client.get('/attendance');
      setRecords(data);
    } catch (err) {
      console.log('Attendance error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;

  const present = records.filter(r => r.status === 'present').length;
  const absent  = records.filter(r => r.status === 'absent').length;
  const late    = records.filter(r => r.status === 'late').length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAttendance(); }} colors={['#3d5a2e']} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
        <Text style={styles.headerSub}>{records.length} records total</Text>
      </View>

      {/* Summary */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { borderTopColor: '#10b981' }]}>
          <Text style={styles.statNum}>{present}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={[styles.statBox, { borderTopColor: '#ef4444' }]}>
          <Text style={styles.statNum}>{absent}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={[styles.statBox, { borderTopColor: '#f59e0b' }]}>
          <Text style={styles.statNum}>{late}</Text>
          <Text style={styles.statLabel}>Late</Text>
        </View>
      </View>

      {/* Records */}
      {records.length === 0
        ? <Text style={styles.empty}>No attendance records found.</Text>
        : records.map(r => (
          <View key={r.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.date}>{r.date}</Text>
              <Text style={styles.employee}>
                👤 {r.employee?.first_name} {r.employee?.last_name}
              </Text>
              <Text style={styles.times}>
                🕗 {r.time_in || '--'} → {r.time_out || '--'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLOR[r.status] || '#6b7280') + '22' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLOR[r.status] || '#6b7280' }]}>
                {r.status?.toUpperCase()}
              </Text>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f3f4f6' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:      { backgroundColor: '#3d5a2e', padding: 20, paddingTop: 48 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSub:   { color: '#a7f3d0', fontSize: 13, marginTop: 4 },
  statsRow:    { flexDirection: 'row', margin: 12, gap: 8 },
  statBox:     { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', borderTopWidth: 3, elevation: 2 },
  statNum:     { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  statLabel:   { fontSize: 12, color: '#6b7280', marginTop: 2 },
  card:        { backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 12, marginBottom: 8, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  cardLeft:    { flex: 1 },
  date:        { fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  employee:    { fontSize: 13, color: '#374151', marginBottom: 2 },
  times:       { fontSize: 12, color: '#6b7280' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statusText:  { fontSize: 11, fontWeight: '700' },
  empty:       { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
