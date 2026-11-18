import type { LoginFormProps } from './components/login-form';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';

import { getErrorMessage } from '@/lib/api/client';
import { loginRequest } from './api';
import { LoginForm } from './components/login-form';
import { useAuthStore } from './use-auth-store';

const ALLOWED_ROLES = ['super_admin', 'admin', 'teacher'];

export function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore.use.signIn();

  const onSubmit: LoginFormProps['onSubmit'] = async (data) => {
    try {
      const res = await loginRequest(data.email, data.password);
      if (!ALLOWED_ROLES.includes(res.user.role)) {
        showMessage({
          message: 'This app is only for teachers and admins.',
          type: 'danger',
        });
        return;
      }
      signIn({ access: res.token }, res.user);
      router.replace('/');
    }
    catch (error) {
      showMessage({ message: getErrorMessage(error), type: 'danger' });
    }
  };

  return (
    <>
      <StatusBar style="light" backgroundColor="#101D36" />
      <LoginForm
        onSubmit={onSubmit}
        onForgotPassword={() => router.push('/forgot-password')}
      />
    </>
  );
}
