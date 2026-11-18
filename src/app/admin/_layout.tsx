import { Redirect, Stack } from 'expo-router';
import * as React from 'react';

import { useAuthStore } from '@/features/auth/use-auth-store';
import { isAdminRole } from '@/lib/auth/utils';

export default function AdminLayout() {
  const status = useAuthStore.use.status();
  const user = useAuthStore.use.user();

  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }
  if (status === 'signIn' && !isAdminRole(user?.role)) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
