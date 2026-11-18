/* eslint-disable max-lines-per-function */
/* eslint-disable perfectionist/sort-imports */
import { useForm } from '@tanstack/react-form';
import { Image } from 'expo-image';
import * as React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import { getFieldError } from '@/components/ui/form-utils';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from '@/components/ui/icons';

import { LoginInput } from './login-input';

const BOTTOM_WAVE = require('../../../../assets/wave-graphics.png');
const HERO_ILLUSTRATION = require('../../../../assets/Login-Page-image.png');

const schema = z.object({
  name: z.string().optional(),
  email: z
    .string({
      message: 'Email is required',
    })
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string({
      message: 'Password is required',
    })
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: (data: FormType) => void | Promise<void>;
  onForgotPassword?: () => void;
};

export function LoginForm({
  onSubmit = () => {},
  onForgotPassword = () => {},
}: LoginFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    validators: {
      onChange: schema as any,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <View style={styles.screenContainer}>
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
          {/* Centered card container for vertical and horizontal balance */}
          <View style={styles.centerContainer}>
            <HeroSection />

            <View style={styles.formContent}>
              <Text testID="form-title" style={styles.tagline}>
                Sign in to continue your academic journey
                {'\n'}
                with Wellfind Academic.
              </Text>

              <form.Field
                name="email"
                children={field => (
                  <LoginInput
                    testID="email-input"
                    placeholder="Email or Phone Number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={field.handleChange}
                    error={getFieldError(field)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    icon={<Mail size={20} color="#8E9EB8" />}
                  />
                )}
              />

              <form.Field
                name="password"
                children={field => (
                  <LoginInput
                    testID="password-input"
                    placeholder="Password"
                    secureTextEntry={!isPasswordVisible}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={field.handleChange}
                    error={getFieldError(field)}
                    autoCapitalize="none"
                    autoComplete="password"
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
                )}
              />

              <RememberAndForgot
                rememberMe={rememberMe}
                onToggle={() => setRememberMe(!rememberMe)}
                onForgotPassword={onForgotPassword}
              />

              <form.Subscribe
                selector={state => [state.isSubmitting]}
                children={([isSubmitting]) => (
                  <LoginButton
                    isSubmitting={isSubmitting}
                    onPress={form.handleSubmit}
                  />
                )}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Image
        source={BOTTOM_WAVE}
        style={styles.bottomWave}
        contentFit="cover"
        pointerEvents="none"
      />
    </View>
  );
}

function HeroSection() {
  return (
    <View style={styles.heroContainer}>
      <Image
        source={HERO_ILLUSTRATION}
        style={styles.heroImage}
        contentFit="contain"
        priority="high"
      />
    </View>
  );
}

function RememberAndForgot({
  rememberMe,
  onToggle,
  onForgotPassword,
}: {
  rememberMe: boolean;
  onToggle: () => void;
  onForgotPassword: () => void;
}) {
  return (
    <View style={styles.optionsRow}>
      <Pressable
        style={styles.rememberMeContainer}
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: rememberMe }}
      >
        <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
          {rememberMe
            ? (
                <Text style={styles.checkmark}>✓</Text>
              )
            : null}
        </View>
        <Text style={styles.rememberMeText}>Remember Me</Text>
      </Pressable>

      <Pressable
        onPress={onForgotPassword}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Forgot Password"
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </Pressable>
    </View>
  );
}

function LoginButton({
  isSubmitting,
  onPress,
}: {
  isSubmitting: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID="login-button"
      style={({ pressed }) => [
        styles.loginButton,
        pressed && styles.loginButtonPressed,
      ]}
      onPress={onPress}
      disabled={isSubmitting}
      accessibilityRole="button"
      accessibilityLabel="Login"
    >
      {isSubmitting
        ? (
            <ActivityIndicator size="small" color="#0A182E" />
          )
        : (
            <View style={styles.loginButtonInner}>
              <Text style={styles.loginButtonText}>Login</Text>
              <ArrowRight color="#0A182E" width={10} height={16} />
            </View>
          )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#101D36',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', // Vertically centered!
    alignItems: 'center', // Horizontally centered!
    paddingHorizontal: 28, // Generous left and right padding!
    paddingVertical: 28,
  },
  centerContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroContainer: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  formContent: {
    width: '100%',
  },
  tagline: {
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 22,
    color: '#CAD5E8',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '400',
    paddingHorizontal: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#4A5D7E',
    backgroundColor: '#14213D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#35D0BA',
    borderColor: '#35D0BA',
  },
  checkmark: {
    color: '#0A182E',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 14,
  },
  rememberMeText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  forgotPasswordText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: '#35D0BA',
  },
  loginButton: {
    height: 52,
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#35D0BA',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#35D0BA',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      default: {
        boxShadow: '0 6px 16px rgba(53, 208, 186, 0.35)',
      },
    }),
  },
  loginButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  loginButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontFamily: 'Inter',
    fontSize: 17,
    fontWeight: '700',
    color: '#0A182E',
    marginRight: 8,
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
