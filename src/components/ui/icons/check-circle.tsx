import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export function CheckCircle({ color = '#35D0BA', size = 20, ...props }: SvgProps & { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Circle cx={12} cy={12} r={10} />
      <Path d="m9 12 2 2 4-4" />
    </Svg>
  );
}
