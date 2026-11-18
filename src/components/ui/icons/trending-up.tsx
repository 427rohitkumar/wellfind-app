import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Polyline } from 'react-native-svg';

export function TrendingUp({ color = '#FFFFFF', size = 24, ...props }: SvgProps & { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <Polyline points="16 7 22 7 22 13" />
    </Svg>
  );
}
