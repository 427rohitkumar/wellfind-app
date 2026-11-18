import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export function UserRound({ color = '#FFFFFF', size = 24, ...props }: SvgProps & { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Circle cx={12} cy={8} r={5} />
      <Path d="M20 21a8 8 0 0 0-16 0" />
    </Svg>
  );
}
