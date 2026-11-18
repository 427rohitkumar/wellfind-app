import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export function ClipboardList({ color = '#FFFFFF', size = 24, ...props }: SvgProps & { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Rect width={8} height={4} x={8} y={2} rx={1} ry={1} />
      <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <Path d="M12 11h4" />
      <Path d="M12 16h4" />
      <Path d="M8 11h.01" />
      <Path d="M8 16h.01" />
    </Svg>
  );
}
