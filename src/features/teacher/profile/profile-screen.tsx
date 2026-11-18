import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, COLORS, InfoRow, prettify, Screen, StatusBadge } from '@/components/wf';
import { logoutRequest } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/use-auth-store';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore.use.user();
  const signOut = useAuthStore.use.signOut();

  const handleSignOut = () => {
    const doLogout = async () => {
      try {
        await logoutRequest();
      } catch {
        // ignore logout errors
      }
      qc.clear();
      signOut();
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to log out?')) {
        void doLogout();
      }
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => void doLogout(),
      },
    ]);
  };

  const initials = (user?.email ?? '?').slice(0, 2).toUpperCase();

  return (
    <Screen title="My Profile" subtitle="Your account" bottomInset={insets.bottom + 70}>
      <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: COLORS.tealLight,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.navy, fontFamily: 'Inter' }}>{initials}</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text, fontFamily: 'Inter' }}>{user?.email}</Text>
        <View style={{ marginTop: 8 }}>
          <StatusBadge status={user?.status ?? 'active'} />
        </View>
      </Card>
      <Card>
        <InfoRow label="Account ID" value={user?.id} />
        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Role" value={prettify(user?.role)} />
        <InfoRow label="Status" value={prettify(user?.status ?? 'active')} />
      </Card>
      <Button label="Log Out" variant="danger" onPress={handleSignOut} />
    </Screen>
  );
}
