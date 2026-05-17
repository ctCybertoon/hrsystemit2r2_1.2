import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
);

export default function ProfileScreen() {
  const { user, logout }          = useAuth();
  const [employee, setEmployee]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await client.get('/employees/1');
      setEmployee(data);
    } catch (err) {
      console.log('Profile error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3d5a2e" /></View>;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfile(); }} colors={['#3d5a2e']} />}
    >
      {/* Avatar Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {employee?.first_name?.[0]}{employee?.last_name?.[0]}
          </Text>
        </View>
        <Text style={styles.name}>{employee?.first_name} {employee?.last_name}</Text>
        <Text style={styles.position}>{employee?.position}</Text>
        <View style={[styles.statusBadge, { backgroundColor: employee?.status === 'active' ? '#10b981' : '#ef4444' }]}>
          <Text style={styles.statusText}>{employee?.status?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Personal Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <InfoRow icon="📧" label="Email"  value={employee?.email} />
        <InfoRow icon="📱" label="Phone"  value={employee?.phone} />
        <InfoRow icon="💼" label="Position" value={employee?.position} />
        <InfoRow icon="📅" label="Hire Date" value={employee?.hire_date} />
        <InfoRow icon="💰" label="Salary" value={`₱${parseFloat(employee?.salary || 0).toLocaleString()}/month`} />
      </View>

      {/* Department & Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Department & Location</Text>
        <InfoRow icon="🏢" label="Department" value={employee?.department?.name} />
        <InfoRow icon="📍" label="Office"      value={employee?.location?.name} />
        <InfoRow icon="🌏" label="City"        value={`${employee?.location?.city}, ${employee?.location?.country}`} />
        <InfoRow icon="🏠" label="Address"     value={employee?.location?.address} />
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <InfoRow icon="👤" label="Username" value={user?.username} />
        <InfoRow icon="🔐" label="Role"     value={user?.role?.toUpperCase()} />
        <InfoRow icon="📧" label="Login Email" value={user?.email} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f3f4f6' },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { backgroundColor: '#3d5a2e', alignItems: 'center', padding: 32, paddingTop: 56 },
  avatar:       { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText:   { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  name:         { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  position:     { color: '#a7f3d0', fontSize: 14, marginTop: 4, marginBottom: 10 },
  statusBadge:  { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  statusText:   { color: '#fff', fontSize: 12, fontWeight: '700' },
  section:      { backgroundColor: '#fff', margin: 12, marginBottom: 0, borderRadius: 12, padding: 16, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  infoRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 12 },
  infoIcon:     { fontSize: 20, width: 28 },
  infoLabel:    { fontSize: 11, color: '#9ca3af', marginBottom: 2 },
  infoValue:    { fontSize: 14, color: '#1f2937', fontWeight: '500' },
  logoutBtn:    { margin: 16, backgroundColor: '#fee2e2', borderRadius: 12, padding: 16, alignItems: 'center' },
  logoutText:   { color: '#dc2626', fontWeight: '700', fontSize: 15 },
});
