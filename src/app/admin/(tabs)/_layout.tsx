import { Tabs } from 'expo-router';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';

import {
  Award,
  ClipboardList,
  House,
  UserRound,
  Users,
} from '@/components/ui/icons';

export default function AdminTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0D9488',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <House color={color} size={22} /> }}
      />
      <Tabs.Screen
        name="enquiries"
        options={{ title: 'Enquiries', tabBarIcon: ({ color }) => <ClipboardList color={color} size={22} /> }}
      />
      <Tabs.Screen
        name="teachers"
        options={{ title: 'Teachers', tabBarIcon: ({ color }) => <Award color={color} size={22} /> }}
      />
      <Tabs.Screen
        name="students"
        options={{ title: 'Students', tabBarIcon: ({ color }) => <Users color={color} size={22} /> }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: 'More', tabBarIcon: ({ color }) => <UserRound color={color} size={22} /> }}
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
  },
  tabBarLabel: { fontFamily: 'Inter', fontSize: 11, fontWeight: '600' },
});
