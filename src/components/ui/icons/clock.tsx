import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Circle, Polyline } from 'react-native-svg';

export function Clock({ color = '#FFFFFF', size = 24, ...props }: SvgProps & { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Circle cx={12} cy={12} r={10} />
      <Polyline points="12 6 12 12 16 14" />
    </Svg>
  );
}
