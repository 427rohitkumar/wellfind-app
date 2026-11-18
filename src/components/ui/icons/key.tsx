import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export function KeyIcon({ color = '#35D0BA', size = 32, ...props }: SvgProps & { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <Circle cx="7.5" cy="15.5" r="5.5" />
      <Path d="m21 2-9.6 9.6" />
      <Path d="m15.5 7.5 3 3L22 7l-3-3" />
    </Svg>
  );
}
