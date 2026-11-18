/* eslint-disable max-lines-per-function */
import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ArrowRight, Check, Eye, EyeOff, Lock, ShieldCheck } from '@/components/ui/icons';
import { getErrorMessage } from '@/lib/api/client';
import { LoginInput } from '../../components/login-input';

type StepNewPasswordProps = {
  onProceed: (password: string) => void | Promise<void>;
};

export function StepNewPassword({ onProceed }: StepNewPasswordProps) {
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState(false);

  const hasLength = password.length >= 8;
  const isMatching = password.length > 0 && password === confirmPassword;

  const handleSubmit = () => {
    if (!hasLength) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(undefined);
    setLoading(true);

    void (async () => {
      try {
        await onProceed(password);
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
          <ShieldCheck size={32} color="#35D0BA" />
        </View>
      </View>

      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>
        Your new password must be at least 8 characters long and different from previous passwords.
      </Text>

      {/* New Password Input */}
      <LoginInput
        testID="new-password-input"
        placeholder="New Password"
        secureTextEntry={!isPasswordVisible}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (error)
            setError(undefined);
        }}
        autoCapitalize="none"
        icon={<Lock size={20} color="#8E9EB8" />}
        rightAction={(
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Toggle password visibility"
          >
            {isPasswordVisible
              ? (
                  <EyeOff size={20} color="#35D0BA" />
                )
              : (
                  <Eye size={20} color="#8E9EB8" />
                )}
          </Pressable>
        )}
      />

      {/* Confirm Password Input */}
      <LoginInput
        testID="confirm-password-input"
        placeholder="Confirm New Password"
        secureTextEntry={!isConfirmVisible}
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (error)
            setError(undefined);
        }}
        error={error}
        autoCapitalize="none"
        icon={<Lock size={20} color="#8E9EB8" />}
        rightAction={(
          <Pressable
            onPress={() => setIsConfirmVisible(!isConfirmVisible)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Toggle confirm password visibility"
          >
            {isConfirmVisible
              ? (
                  <EyeOff size={20} color="#35D0BA" />
                )
              : (
                  <Eye size={20} color="#8E9EB8" />
                )}
          </Pressable>
        )}
      />

      {/* Real-time Password Rules Checklist */}
      <View style={styles.checklist}>
        <View style={styles.checkItem}>
          <View style={[styles.checkCircle, hasLength && styles.checkCircleActive]}>
            {hasLength ? <Check size={12} color="#0A182E" /> : null}
          </View>
          <Text style={[styles.checkText, hasLength && styles.checkTextActive]}>
            At least 8 characters
          </Text>
        </View>

        <View style={styles.checkItem}>
          <View style={[styles.checkCircle, isMatching && styles.checkCircleActive]}>
            {isMatching ? <Check size={12} color="#0A182E" /> : null}
          </View>
          <Text style={[styles.checkText, isMatching && styles.checkTextActive]}>
            Passwords match
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <Pressable
        testID="reset-password-button"
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
                <Text style={styles.buttonText}>Reset Password</Text>
                <ArrowRight color="#0A182E" width={10} height={16} />
              </View>
            )}
      </Pressable>
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
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  checklist: {
    marginBottom: 20,
    marginTop: 2,
    paddingHorizontal: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#4A5D7E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkCircleActive: {
    backgroundColor: '#35D0BA',
    borderColor: '#35D0BA',
  },
  checkText: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#8E9EB8',
  },
  checkTextActive: {
    color: '#E2E8F0',
    fontWeight: '500',
  },
  actionButton: {
    height: 52,
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#35D0BA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
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
});
