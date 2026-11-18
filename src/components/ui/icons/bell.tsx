import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export function Bell({ color = '#FFFFFF', size = 24, hasUnread = false, ...props }: SvgProps & { size?: number; hasUnread?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      {hasUnread
        ? (
            <Circle cx={18} cy={5} r={3} fill="#35D0BA" stroke="#101D36" strokeWidth={1.5} />
          )
        : null}
    </Svg>
  );
}
