import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, COLORS, InfoRow, prettify, Screen, SectionTitle } from '@/components/wf';
import { logoutRequest } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/use-auth-store';

export function MoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore.use.user();
  const signOut = useAuthStore.use.signOut();

  const doSignOut = async () => {
    try {
      await logoutRequest();
    } catch {}
    qc.clear();
    signOut();
    router.replace('/login');
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Are you sure you want to log out?') : true;
      if (confirmed) {
        void doSignOut();
      }
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          void doSignOut();
        },
      },
    ]);
  };

  return (
    <Screen title="Admin Menu & Controls" subtitle="Operations, finance and system administration" bottomInset={insets.bottom + 80}>
      {/* 1. Operations Hub */}
      <SectionTitle>Operations</SectionTitle>
      <Card onPress={() => router.push('/admin/allocations' as any)}>
        <Text style={{ fontWeight: '700', color: COLORS.text, fontSize: 14 }}>Teacher Allocations</Text>
        <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
          View, assign and manage live student-teacher allocations
        </Text>
      </Card>
      <Card onPress={() => router.push('/admin/student-records' as any)}>
        <Text style={{ fontWeight: '700', color: COLORS.text, fontSize: 14 }}>Student Records & Assessments</Text>
        <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
          Converted student profiles, academic capabilities & test reports
        </Text>
      </Card>
      <Card onPress={() => router.push('/admin/users' as any)}>
        <Text style={{ fontWeight: '700', color: COLORS.text, fontSize: 14 }}>User Accounts & RBAC</Text>
        <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
          Create, block, suspend and manage administrator & teacher accounts
        </Text>
      </Card>

      {/* 2. Finance & Payouts */}
      <SectionTitle>Finance & Payouts</SectionTitle>
      <Card onPress={() => router.push('/admin/student-payments' as any)}>
        <Text style={{ fontWeight: '700', color: COLORS.text, fontSize: 14 }}>Student Payments</Text>
        <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
          Tuition fees, admission receipts and transaction clearances
        </Text>
      </Card>
      <Card onPress={() => router.push('/admin/teacher-payments' as any)}>
        <Text style={{ fontWeight: '700', color: COLORS.text, fontSize: 14 }}>Teacher Payments & Payouts</Text>
        <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
          Teacher monthly earnings, disbursements and registration receipts
        </Text>
      </Card>
      <Card onPress={() => router.push('/admin/reports' as any)}>
        <Text style={{ fontWeight: '700', color: COLORS.text, fontSize: 14 }}>Billing & Financial Reports</Text>
        <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
          Consolidated inflows, disbursements and margin calculations
        </Text>
      </Card>

      {/* 3. Analytics */}
      <SectionTitle>Analytics</SectionTitle>
      <Card onPress={() => router.push('/admin/analytics' as any)}>
        <Text style={{ fontWeight: '700', color: COLORS.text, fontSize: 14 }}>Website & Google Analytics</Text>
        <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
          Traffic trends, user sessions, top acquisition channels and devices
        </Text>
      </Card>

      {/* 4. Administrator Profile & Sign Out */}
      <SectionTitle>Administrator Account</SectionTitle>
      <Card>
        <InfoRow label="Signed in as" value={user?.email} />
        <InfoRow label="Access Role" value={prettify(user?.role)} />
        <InfoRow label="Status" value="Active" />
      </Card>
      <Button label="Sign Out" variant="danger" onPress={handleSignOut} />
    </Screen>
  );
}
