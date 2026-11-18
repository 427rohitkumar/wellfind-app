/* eslint-disable max-lines-per-function */
import * as React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ArrowRight, KeyIcon } from '@/components/ui/icons';
import { getErrorMessage } from '@/lib/api/client';

type StepOtpProps = {
  email: string;
  onProceed: (code: string) => void | Promise<void>;
  onResend?: () => Promise<void>;
  onEditEmail: () => void;
};

const OTP_SLOTS = ['first', 'second', 'third', 'fourth'] as const;

export function StepOtp({ email, onProceed, onResend, onEditEmail }: StepOtpProps) {
  const [digits, setDigits] = React.useState<string[]>(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = React.useState<number>(0);
  const [error, setError] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState(false);
  const [timer, setTimer] = React.useState(45);

  const inputRefs = React.useRef<(TextInput | null)[]>([]);

  React.useEffect(() => {
    if (timer <= 0)
      return;
    const interval = setInterval(() => {
      setTimer(t => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/\D/g, '');
    const newDigits = [...digits];

    if (cleaned.length > 1) {
      // User pasted OTP
      const pasted = cleaned.slice(0, 4).split('');
      pasted.forEach((char, i) => {
        if (i < 4)
          newDigits[i] = char;
      });
      setDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 3);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = cleaned;
    setDigits(newDigits);
    if (error)
      setError(undefined);

    if (cleaned && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const code = digits.join('');
    if (code.length < 4) {
      setError('Please enter the complete 4-digit code');
      return;
    }

    setError(undefined);
    setLoading(true);

    void (async () => {
      try {
        await onProceed(code);
      }
      catch (e) {
        setError(getErrorMessage(e));
      }
      finally {
        setLoading(false);
      }
    })();
  };

  const handleResend = () => {
    if (timer > 0)
      return;
    setTimer(60);
    setDigits(['', '', '', '']);
    setError(undefined);
    inputRefs.current[0]?.focus();
    onResend?.().catch(e => setError(getErrorMessage(e)));
  };

  return (
    <View style={styles.container}>
      {/* Icon Badge */}
      <View style={styles.badgeContainer}>
        <View style={styles.badge}>
          <KeyIcon size={32} color="#35D0BA" />
        </View>
      </View>

      <Text style={styles.title}>Verify Code</Text>
      <Text style={styles.subtitle}>
        We’ve sent a 4-digit code to
        {' '}
        <Text style={styles.emailHighlight}>{email}</Text>
      </Text>

      <Pressable onPress={onEditEmail} style={styles.changeEmailRow} hitSlop={8}>
        <Text style={styles.changeEmailText}>Change email address</Text>
      </Pressable>

      {/* 4 Digit OTP Inputs */}
      <View style={styles.otpRow}>
        {digits.map((digit, index) => {
          const isFocused = focusedIndex === index || Boolean(digit);
          return (
            <TextInput
              key={`otp-${OTP_SLOTS[index]}`}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpBox,
                isFocused && styles.otpBoxFilled,
                Boolean(error) && styles.otpBoxError,
                styles.otpBoxColorFix,
              ]}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor="#35D0BA"
              autoFocus={index === 0}
              placeholderTextColor="#4A5D7E"
            />
          );
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Verify Button */}
      <Pressable
        testID="verify-code-button"
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
                <Text style={styles.buttonText}>Verify & Proceed</Text>
                <ArrowRight color="#0A182E" width={10} height={16} />
              </View>
            )}
      </Pressable>

      {/* Resend Timer */}
      <View style={styles.resendRow}>
        <Text style={styles.resendText}>Didn't receive the code? </Text>
        <Pressable onPress={handleResend} disabled={timer > 0} hitSlop={8}>
          <Text style={[styles.resendLink, timer > 0 && styles.resendDisabled]}>
            {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
          </Text>
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
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  emailHighlight: {
    color: '#35D0BA',
    fontWeight: '600',
  },
  changeEmailRow: {
    alignSelf: 'center',
    marginBottom: 26,
    paddingVertical: 2,
  },
  changeEmailText: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#8E9EB8',
    textDecorationLine: 'underline',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  otpBox: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: '#14213D',
    borderWidth: 1.5,
    borderColor: '#243759',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    includeFontPadding: false,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
        textAlign: 'center',
        color: '#FFFFFF',
        caretColor: '#35D0BA',
        lineHeight: 60,
      } as any,
    }),
  },
  otpBoxColorFix: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: '#35D0BA',
    backgroundColor: '#18294C',
    color: '#FFFFFF',
  },
  otpBoxError: {
    borderColor: '#EF4444',
    color: '#FFFFFF',
  },
  errorText: {
    fontFamily: 'Inter',
    color: '#F87171',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
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
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  resendText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#8E9EB8',
  },
  resendLink: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#35D0BA',
  },
  resendDisabled: {
    color: '#657795',
  },
});
