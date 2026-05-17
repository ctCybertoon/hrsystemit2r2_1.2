import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen     from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LeavesScreen    from './src/screens/LeavesScreen';
import PayrollScreen   from './src/screens/PayrollScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import ProfileScreen   from './src/screens/ProfileScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ICONS = {
  Dashboard:  '🏠', Leaves: '📅',
  Payroll:    '💰', Attendance: '📋', Profile: '👤',
};

function TabIcon({ name, focused }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{ICONS[name]}</Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: '#3d5a2e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 8, paddingTop: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Dashboard"  component={DashboardScreen} />
      <Tab.Screen name="Leaves"     component={LeavesScreen} />
      <Tab.Screen name="Payroll"    component={PayrollScreen} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Profile"    component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3d5a2e" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
