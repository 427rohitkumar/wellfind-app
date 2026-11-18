import { useRouter } from 'expo-router';
import * as React from 'react';
import { SplashScreenView } from '@/features/splash';

export default function SplashScreenRoute() {
  const router = useRouter();

  return (
    <SplashScreenView
      duration={2500}
      onFinish={() => {
        if (router.canGoBack()) {
          router.back();
        }
        else {
          router.replace('/(app)');
        }
      }}
    />
  );
}
