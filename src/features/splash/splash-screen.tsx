import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const LOGO_SOURCE = require('../../../assets/blue-logo-wellfind.png');

export type SplashScreenProps = {
  /**
   * If true, renders as an absolute overlay over the screen.
   */
  isOverlay?: boolean;
  /**
   * Auto dismiss duration in milliseconds (default: 2000). Set to 0 to disable auto-dismiss.
   */
  duration?: number;
  /**
   * Callback fired when splash animation/timeout completes.
   */
  onFinish?: () => void;
};

export function SplashScreenView({
  isOverlay = false,
  duration = 2000,
  onFinish,
}: SplashScreenProps) {
  const containerOpacity = useSharedValue(1);
  const finishedRef = React.useRef(false);

  const dismiss = React.useCallback(() => {
    if (finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    // eslint-disable-next-line react-hooks/immutability
    containerOpacity.value = withTiming(
      0,
      { duration: 350 },
      (finished) => {
        if (finished && onFinish) {
          runOnJS(onFinish)();
        }
      },
    );
  }, [containerOpacity, onFinish]);

  React.useEffect(() => {
    if (duration > 0 && onFinish) {
      const timer = setTimeout(() => {
        dismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [dismiss, duration, onFinish]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        isOverlay && styles.overlay,
        animatedContainerStyle,
      ]}
      testID="splash-screen"
    >
      <StatusBar style="light" backgroundColor="#101D36" translucent />

      <Pressable
        style={styles.pressableArea}
        onPress={onFinish ? dismiss : undefined}
        accessibilityRole="button"
        accessibilityLabel="Splash Screen"
      >
        {/* Centered Logo and Brand Group */}
        <View style={styles.brandGroup} testID="brand-group">
          {/* Logo Image Container */}
          <Animated.View
            entering={FadeInDown.duration(700)}
            style={styles.logoContainer}
            testID="logo-container"
          >
            <Image
              source={LOGO_SOURCE}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel="Wellfind Academic Logo"
              priority="high"
            />
          </Animated.View>

          {/* Brand Name Typography */}
          <Animated.View
            entering={FadeInUp.duration(600)}
            style={styles.typographyGroup}
            testID="brand-typography"
          >
            <Text style={styles.brandTitle}>Well Find</Text>
            <Text style={styles.brandSubtitle}>Academic</Text>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#101D36',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999,
  },
  pressableArea: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brandGroup: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: -32, // -mt-8 to optical center
  },
  logoContainer: {
    width: 144, // w-36
    height: 144, // h-36
    marginBottom: 24, // mb-6
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      default: {
        // web shadow
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35)',
      },
    }),
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  typographyGroup: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: 'Inter',
    color: '#FFFFFF',
    fontSize: 32, // text-3xl
    fontWeight: '700', // font-bold
    letterSpacing: 0.8, // tracking-wide
    lineHeight: 38, // leading-tight
    textAlign: 'center',
  },
  brandSubtitle: {
    fontFamily: 'Inter',
    color: '#35D0BA', // turquoise
    fontSize: 20, // text-xl
    fontWeight: '500', // font-medium
    letterSpacing: 1.5, // tracking-wider
    lineHeight: 26,
    marginTop: 4, // mt-1
    textAlign: 'center',
  },
});
