import type { TextInputProps } from 'react-native';
import * as React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export type LoginInputProps = {
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  error?: string;
} & TextInputProps;

export function LoginInput({
  ref,
  icon,
  rightAction,
  error,
  style,
  onFocus,
  onBlur,
  ...props
}: LoginInputProps & { ref?: React.RefObject<TextInput | null> }) {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          Boolean(error) && styles.containerError,
        ]}
      >
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor="#94A3B8"
          selectionColor="#35D0BA"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightAction
          ? (
              <View style={styles.rightActionContainer}>{rightAction}</View>
            )
          : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

LoginInput.displayName = 'LoginInput';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#14213D',
    borderWidth: 1.5,
    borderColor: '#243759',
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  containerFocused: {
    borderColor: '#35D0BA',
    backgroundColor: '#18294C',
  },
  containerError: {
    borderColor: '#EF4444',
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActionContainer: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#FFFFFF',
    height: '100%',
    paddingVertical: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
        color: '#FFFFFF',
        caretColor: '#35D0BA',
      } as any,
    }),
  },
  errorText: {
    fontFamily: 'Inter',
    color: '#F87171',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
