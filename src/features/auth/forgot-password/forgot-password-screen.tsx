/* eslint-disable max-lines-per-function */
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { ArrowLeft } from '@/components/ui/icons';
import { forgotPasswordRequest, resetPasswordRequest, verifyOtpRequest } from '../api';

import { StepEmail } from './components/step-email';
import { StepNewPassword } from './components/step-new-password';
import { StepOtp } from './components/step-otp';
import { StepSuccess } from './components/step-success';

// eslint-disable-next-line perfectionist/sort-imports
const BOTTOM_WAVE = require('../../../../assets/wave-graphics.png');

type Step = 'email' | 'otp' | 'new-password' | 'success';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>('email');
  const [email, setEmail] = React.useState('');
  const [resetToken, setResetToken] = React.useState('');

  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
    }
    else if (step === 'new-password') {
      setStep('otp');
    }
    else {
      if (router.canGoBack()) {
        router.back();
      }
      else {
        router.replace('/login');
      }
    }
  };

  const handleBackToLogin = () => {
    if (router.canGoBack()) {
      router.back();
    }
    else {
      router.replace('/login');
    }
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="light" backgroundColor="#101D36" />

      {/* Top Navigation Bar with Back Button & Progress Dots */}
      <View style={styles.topBar}>
        {step !== 'success'
          ? (
              <Pressable
                testID="forgot-back-button"
                onPress={handleBack}
                style={styles.backButton}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                <ArrowLeft color="#FFFFFF" />
              </Pressable>
            )
          : (
              <View style={styles.backButtonPlaceholder} />
            )}

        {step !== 'success'
          ? (
              <View style={styles.progressContainer}>
                <View style={[styles.progressDot, step === 'email' && styles.progressDotActive]} />
                <View style={[styles.progressLine, (step === 'otp' || step === 'new-password') && styles.progressLineActive]} />
                <View style={[styles.progressDot, step === 'otp' && styles.progressDotActive]} />
                <View style={[styles.progressLine, step === 'new-password' && styles.progressLineActive]} />
                <View style={[styles.progressDot, step === 'new-password' && styles.progressDotActive]} />
              </View>
            )
          : (
              <View />
            )}

        <View style={styles.backButtonPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centerContainer}>
            {step === 'email'
              ? (
                  <StepEmail
                    initialEmail={email}
                    onProceed={async (enteredEmail) => {
                      await forgotPasswordRequest(enteredEmail);
                      setEmail(enteredEmail);
                      setStep('otp');
                    }}
                    onBackToLogin={handleBackToLogin}
                  />
                )
              : null}

            {step === 'otp'
              ? (
                  <StepOtp
                    email={email}
                    onProceed={async (code) => {
                      const res = await verifyOtpRequest(email, code);
                      setResetToken(res.resetAuthToken);
                      setStep('new-password');
                    }}
                    onResend={async () => {
                      await forgotPasswordRequest(email);
                    }}
                    onEditEmail={() => setStep('email')}
                  />
                )
              : null}

            {step === 'new-password'
              ? (
                  <StepNewPassword
                    onProceed={async (password) => {
                      await resetPasswordRequest(resetToken, password);
                      setStep('success');
                    }}
                  />
                )
              : null}

            {step === 'success'
              ? (
                  <StepSuccess onBackToLogin={handleBackToLogin} />
                )
              : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Decorative Bottom Teal Wave */}
      <Image
        source={BOTTOM_WAVE}
        style={styles.bottomWave}
        contentFit="cover"
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#101D36',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 12,
    zIndex: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#14213D',
    borderWidth: 1,
    borderColor: '#243759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 44,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#243759',
  },
  progressDotActive: {
    backgroundColor: '#35D0BA',
    width: 20,
    borderRadius: 6,
  },
  progressLine: {
    width: 20,
    height: 2,
    backgroundColor: '#243759',
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: '#35D0BA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  centerContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    zIndex: 10,
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 90,
    zIndex: 1,
  },
});
