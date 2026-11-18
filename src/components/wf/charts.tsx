import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { COLORS } from './index';

/* ------------------------------- Donut Distribution -------------------------------- */

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

export function DonutChart({
  segments,
  size = 180,
  strokeWidth = 26,
  centerLabel,
  centerValue,
}: {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string | number;
}) {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentOffset = 0;

  return (
    <View style={chartStyles.donutContainer}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {total === 0 ? (
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={COLORS.border}
                strokeWidth={strokeWidth}
                fill="none"
              />
            ) : (
              segments.map((seg, idx) => {
                if (seg.value === 0) return null;
                const strokeDasharray = `${(seg.value / total) * circumference} ${circumference}`;
                const strokeDashoffset = -currentOffset;
                currentOffset += (seg.value / total) * circumference;

                return (
                  <Circle
                    key={idx}
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    fill="none"
                  />
                );
              })
            )}
          </G>
        </Svg>
        <View style={[StyleSheet.absoluteFillObject, chartStyles.centerOverlay]}>
          <Text style={chartStyles.centerValueText}>{centerValue ?? total}</Text>
          {centerLabel ? <Text style={chartStyles.centerLabelText}>{centerLabel}</Text> : null}
        </View>
      </View>

      <View style={chartStyles.legendContainer}>
        {segments.map((seg, idx) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <View key={idx} style={chartStyles.legendItem}>
              <View style={[chartStyles.legendDot, { backgroundColor: seg.color }]} />
              <Text style={chartStyles.legendLabel} numberOfLines={1}>
                {seg.label}
              </Text>
              <Text style={chartStyles.legendValue}>
                {seg.value} ({pct}%)
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* ------------------------------- Bar Distribution -------------------------------- */

export type BarItem = {
  label: string;
  value: number;
  color?: string;
};

export function BarChart({
  items,
  maxBars = 10,
}: {
  items: BarItem[];
  maxBars?: number;
}) {
  const visible = items.slice(0, maxBars);
  const maxValue = Math.max(...visible.map(i => i.value), 1);

  return (
    <View style={chartStyles.barContainer}>
      {visible.map((item, idx) => {
        const pct = Math.round((item.value / maxValue) * 100);
        return (
          <View key={idx} style={chartStyles.barRow}>
            <Text style={chartStyles.barRowLabel} numberOfLines={1}>
              {item.label}
            </Text>
            <View style={chartStyles.barTrack}>
              <View
                style={[
                  chartStyles.barFill,
                  {
                    width: `${Math.max(pct, item.value > 0 ? 5 : 0)}%`,
                    backgroundColor: item.color || COLORS.teal,
                  },
                ]}
              />
            </View>
            <Text style={chartStyles.barRowValue}>{item.value}</Text>
          </View>
        );
      })}
    </View>
  );
}

/* ------------------------------- Trend Line Chart -------------------------------- */

export type TrendPoint = {
  label: string;
  value: number;
};

export function TrendAreaChart({
  points,
  height = 160,
  color = COLORS.teal,
}: {
  points: TrendPoint[];
  height?: number;
  color?: string;
}) {
  if (points.length < 2) {
    return (
      <View style={[chartStyles.emptyChart, { height }]}>
        <Text style={chartStyles.emptyChartText}>Not enough data to render trend</Text>
      </View>
    );
  }

  const maxValue = Math.max(...points.map(p => p.value), 1);
  const width = 320;
  const paddingX = 20;
  const paddingY = 24;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const coords = points.map((p, idx) => {
    const x = paddingX + (idx / (points.length - 1)) * chartW;
    const y = paddingY + chartH - (p.value / maxValue) * chartH;
    return { x, y, label: p.label, value: p.value };
  });

  // Construct SVG path
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    // Simple line curve
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpX2 = cpX1;
    pathD += ` C ${cpX1} ${prev.y}, ${cpX2} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`;

  return (
    <View style={chartStyles.trendContainer}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Background Grid Lines */}
        <Path
          d={`M ${paddingX} ${paddingY} L ${width - paddingX} ${paddingY} M ${paddingX} ${paddingY + chartH / 2} L ${width - paddingX} ${paddingY + chartH / 2} M ${paddingX} ${height - paddingY} L ${width - paddingX} ${height - paddingY}`}
          stroke={COLORS.border}
          strokeDasharray="4 4"
          strokeWidth="1"
        />

        {/* Gradient fill */}
        <Path d={areaD} fill={color} fillOpacity={0.15} />

        {/* Stroke line */}
        <Path d={pathD} stroke={color} strokeWidth="3" fill="none" />

        {/* Data points */}
        {coords.map((c, idx) => (
          <Circle
            key={idx}
            cx={c.x}
            cy={c.y}
            r="4"
            fill={COLORS.card}
            stroke={color}
            strokeWidth="2.5"
          />
        ))}
      </Svg>

      {/* X-axis labels */}
      <View style={chartStyles.trendXAxis}>
        {points.map((p, idx) => (
          <Text key={idx} style={chartStyles.trendLabelText}>
            {p.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  donutContainer: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  centerOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValueText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    fontFamily: 'Inter',
  },
  centerLabelText: {
    fontSize: 11,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter',
  },
  legendContainer: {
    width: '100%',
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
    fontFamily: 'Inter',
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    fontFamily: 'Inter',
  },
  barContainer: {
    gap: 10,
    paddingVertical: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barRowLabel: {
    width: 75,
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  barRowValue: {
    width: 32,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'Inter',
  },
  trendContainer: {
    width: '100%',
    paddingVertical: 4,
  },
  trendXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 4,
  },
  trendLabelText: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  emptyChart: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: 'Inter',
  },
});
