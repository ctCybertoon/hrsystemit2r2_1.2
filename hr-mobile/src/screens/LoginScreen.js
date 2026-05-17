import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>HR</Text>
        </View>
        <Text style={styles.title}>HR System</Text>
        <Text style={styles.subtitle}>Employee Portal</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>

        <Text style={styles.footer}>HR System Integration Project</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f3f4f6', justifyContent: 'center', padding: 24 },
  card:        { backgroundColor: '#fff', borderRadius: 16, padding: 32, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  logoBox:     { width: 72, height: 72, borderRadius: 16, backgroundColor: '#3d5a2e', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  logoText:    { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  title:       { fontSize: 24, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
  subtitle:    { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 28 },
  input:       { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 15, color: '#1f2937', backgroundColor: '#f9fafb' },
  button:      { backgroundColor: '#3d5a2e', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 4 },
  buttonText:  { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer:      { textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 24 },
});
