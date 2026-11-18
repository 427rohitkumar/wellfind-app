import * as React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ArrowRight, Check } from '@/components/ui/icons';

type StepSuccessProps = {
  onBackToLogin: () => void;
};

export function StepSuccess({ onBackToLogin }: StepSuccessProps) {
  return (
    <View style={styles.container}>
      {/* Success Animated/Glowing Badge */}
      <View style={styles.badgeContainer}>
        <View style={styles.outerGlow}>
          <View style={styles.badge}>
            <Check size={40} color="#0A182E" />
          </View>
        </View>
      </View>

      <Text style={styles.title}>Password Reset Successfully!</Text>
      <Text style={styles.subtitle}>
        Your password has been securely updated. You can now use your new credentials to sign in to your Wellfind Academic account.
      </Text>

      {/* Back to Login Button */}
      <Pressable
        testID="success-login-button"
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.actionButtonPressed,
        ]}
        onPress={onBackToLogin}
      >
        <View style={styles.buttonInner}>
          <Text style={styles.buttonText}>Back to Login</Text>
          <ArrowRight color="#0A182E" width={10} height={16} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  outerGlow: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(53, 208, 186, 0.1)',
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#35D0BA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#35D0BA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 22,
    color: '#CAD5E8',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  actionButton: {
    height: 52,
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#35D0BA',
    alignItems: 'center',
    justifyContent: 'center',
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
