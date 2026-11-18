import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { isRTL } from '@/lib/i18n';

export function ArrowLeft({ color = '#FFFFFF', style, ...props }: SvgProps) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={StyleSheet.flatten([
        style,
        { transform: [{ scaleX: isRTL ? -1 : 1 }] },
      ])}
    >
      <Path d="m15 18-6-6 6-6" />
    </Svg>
  );
}
