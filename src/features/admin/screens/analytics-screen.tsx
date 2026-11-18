import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarChart, DonutChart } from '@/components/wf/charts';
import {
  Card,
  COLORS,
  Screen,
  SectionTitle,
  StatCard,
} from '@/components/wf';

const CHANNELS = [
  { label: 'Organic Search', value: 4820, color: '#0D9488' },
  { label: 'Direct Entry', value: 2410, color: '#0284C7' },
  { label: 'Social Media', value: 1680, color: '#D97706' },
  { label: 'Referrals', value: 920, color: '#16A34A' },
  { label: 'Email Campaigns', value: 430, color: '#94A3B8' },
];

const DEVICES = [
  { label: 'Mobile (Android/iOS)', value: 72, color: '#0D9488' },
  { label: 'Desktop / PC', value: 24, color: '#0284C7' },
  { label: 'Tablet / iPad', value: 4, color: '#D97706' },
];

export function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [period, setPeriod] = React.useState('28d');

  return (
    <Screen
      title="Website Analytics"
      subtitle="Google Analytics 4 metrics for wellfindacademic.com"
      onBack={() => router.back()}
      bottomInset={insets.bottom + 40}
    >
      {/* Period Selection */}
      <View style={styles.filterRow}>
        {[
          { key: '7d', label: 'Last 7 Days' },
          { key: '28d', label: 'Last 28 Days' },
          { key: '90d', label: 'Last 90 Days' },
        ].map(p => {
          const active = period === p.key;
          return (
            <Pressable
              key={p.key}
              onPress={() => setPeriod(p.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* KPI Cards */}
      <SectionTitle>Audience & Traffic KPIs</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <StatCard label="Active Users" value={period === '7d' ? '3,410' : '10,260'} tone="info" helper="↑ 12% vs previous period" />
        <StatCard label="New Users" value={period === '7d' ? '2,890' : '8,450'} tone="ok" helper="↑ 18% first visits" />
        <StatCard label="Total Sessions" value={period === '7d' ? '5,120' : '14,890'} tone="info" helper="Average 2.4 pages/session" />
        <StatCard label="Engagement Rate" value="64.8%" tone="ok" helper="Average 2m 14s session" />
      </View>

      {/* Acquisition Channels */}
      <SectionTitle>Traffic by Acquisition Channel</SectionTitle>
      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.cardHeader}>User Sessions by Channel</Text>
        <BarChart items={CHANNELS} maxBars={5} />
      </Card>

      {/* Device Breakdown */}
      <SectionTitle>Device Breakdown</SectionTitle>
      <Card>
        <Text style={styles.cardHeader}>User Platform Distribution</Text>
        <DonutChart
          segments={DEVICES}
          centerLabel="Traffic"
          centerValue="100%"
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
});
