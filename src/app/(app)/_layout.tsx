import { Redirect, Tabs } from 'expo-router';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';

import {
  ClipboardList,
  House,
  UserRound,
  Users,
  Wallet,
} from '@/components/ui/icons';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { isAdminRole } from '@/lib/auth/utils';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';

export default function TabLayout() {
  const status = useAuth.use.status();
  const user = useAuth.use.user();
  const [isFirstTime] = useIsFirstTime();

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }
  if (isAdminRole(user?.role)) {
    return <Redirect href="/admin" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0D9488',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      {/* 1. Home (extreme left) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <House color={color} size={22} />,
          tabBarButtonTestID: 'home-tab',
        }}
      />

      {/* 2. Matches (second position) */}
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color }) => <Users color={color} size={22} />,
          tabBarButtonTestID: 'matches-tab',
        }}
      />

      {/* 3. Payments (exact center position) */}
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color }) => <Wallet color={color} size={22} />,
          tabBarButtonTestID: 'payments-tab',
        }}
      />

      {/* 4. Tasks (fourth position) */}
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Students',
          tabBarIcon: ({ color }) => <ClipboardList color={color} size={22} />,
          tabBarButtonTestID: 'tasks-tab',
        }}
      />

      {/* 5. Profile (extreme right) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserRound color={color} size={22} />,
          tabBarButtonTestID: 'profile-tab',
        }}
      />

      {/* Hidden legacy routes */}
      <Tabs.Screen
        name="style"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 66,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabBarLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabBarItem: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
