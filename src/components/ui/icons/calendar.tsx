import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export function Calendar({ color = '#FFFFFF', size = 24, ...props }: SvgProps & { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Rect width={18} height={18} x={3} y={4} rx={2} />
      <Path d="M16 2v4" />
      <Path d="M8 2v4" />
      <Path d="M3 10h18" />
    </Svg>
  );
}
