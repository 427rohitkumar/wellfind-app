import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ArrowRight, Mail } from '@/components/ui/icons';
import { getErrorMessage } from '@/lib/api/client';
import { LoginInput } from '../../components/login-input';

type StepEmailProps = {
  initialEmail?: string;
  onProceed: (email: string) => void | Promise<void>;
  onBackToLogin: () => void;
};

export function StepEmail({
  initialEmail = '',
  onProceed,
  onBackToLogin,
}: StepEmailProps) {
  const [email, setEmail] = React.useState(initialEmail);
  const [error, setError] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Email or phone number is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    setError(undefined);
    setLoading(true);

    void (async () => {
      try {
        await onProceed(trimmed);
      }
      catch (e) {
        setError(getErrorMessage(e));
      }
      finally {
        setLoading(false);
      }
    })();
  };

  return (
    <View style={styles.container}>
      {/* Icon Badge */}
      <View style={styles.badgeContainer}>
        <View style={styles.badge}>
          <Mail size={32} color="#35D0BA" />
        </View>
      </View>

      {/* Header Typography */}
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Don’t worry! Enter your registered email or phone number and we’ll send you a verification code.
      </Text>

      {/* Email Input */}
      <LoginInput
        testID="forgot-email-input"
        placeholder="Email or Phone Number"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (error)
            setError(undefined);
        }}
        error={error}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        icon={<Mail size={20} color="#8E9EB8" />}
      />

      {/* Action Button */}
      <Pressable
        testID="send-code-button"
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.actionButtonPressed,
        ]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? (
              <ActivityIndicator size="small" color="#0A182E" />
            )
          : (
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>Send Code</Text>
                <ArrowRight color="#0A182E" width={10} height={16} />
              </View>
            )}
      </Pressable>

      {/* Bottom Link to Login */}
      <View style={styles.bottomLinkContainer}>
        <Text style={styles.bottomText}>Remember your password? </Text>
        <Pressable onPress={onBackToLogin} hitSlop={8}>
          <Text style={styles.linkText}>Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(53, 208, 186, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(53, 208, 186, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 22,
    color: '#CAD5E8',
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  actionButton: {
    height: 52,
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#35D0BA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#0A182E',
    marginRight: 8,
  },
  bottomLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  bottomText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#8E9EB8',
  },
  linkText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#35D0BA',
  },
});
