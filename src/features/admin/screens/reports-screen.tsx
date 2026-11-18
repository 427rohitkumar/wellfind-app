import { useRouter } from 'expo-router';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Badge,
  Card,
  COLORS,
  InfoRow,
  Screen,
  SectionTitle,
  StatCard,
  StatusBadge,
} from '@/components/wf';

const DEMO_TRANSACTIONS = [
  { id: 'SP-26001', date: '2026-10-08', category: 'Student Payment', party: 'Aarav Sharma', amount: 15000, type: 'inflow', status: 'completed' },
  { id: 'PO-26001', date: '2026-10-15', category: 'Teacher Payout', party: 'Dr. Debabrata Banerjee', amount: 24000, type: 'outflow', status: 'completed' },
  { id: 'SP-26002', date: '2026-10-04', category: 'Student Payment', party: 'Ananya Mehta', amount: 10000, type: 'inflow', status: 'completed' },
  { id: 'RF-26001', date: '2026-09-28', category: 'Registration Fee', party: 'Meera Iyer', amount: 5000, type: 'inflow', status: 'completed' },
  { id: 'PO-26002', date: '2026-10-10', category: 'Teacher Payout', party: 'Priya Nair', amount: 21000, type: 'outflow', status: 'completed' },
];

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const totalInflow = DEMO_TRANSACTIONS
    .filter(t => t.type === 'inflow')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = DEMO_TRANSACTIONS
    .filter(t => t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalInflow - totalOutflow;

  return (
    <Screen
      title="Billing & Reports"
      subtitle="Financial overview, revenue and payout records"
      onBack={() => router.back()}
      bottomInset={insets.bottom + 40}
    >
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <StatCard
          label="Total Revenue"
          value={currency.format(totalInflow)}
          tone="ok"
          helper="Student payments & fees"
        />
        <StatCard
          label="Total Payouts"
          value={currency.format(totalOutflow)}
          tone="info"
          helper="Teacher disbursements"
        />
      </View>

      <Card style={{ marginBottom: 16, borderColor: COLORS.teal, borderWidth: 1.5 }}>
        <Text style={styles.cardHeader}>Net Platform Margin</Text>
        <Text style={[styles.netAmount, { color: netBalance >= 0 ? COLORS.ok : COLORS.danger }]}>
          {currency.format(netBalance)}
        </Text>
        <Text style={styles.subText}>Calculated from recorded inflows minus disbursements.</Text>
      </Card>

      <SectionTitle>Recent Financial Audit Trail</SectionTitle>
      {DEMO_TRANSACTIONS.map(tx => (
        <Card key={tx.id}>
          <View style={styles.txHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.partyName}>{tx.party}</Text>
              <Text style={styles.categoryText}>{tx.category} • {tx.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.amountText, { color: tx.type === 'inflow' ? COLORS.ok : COLORS.text }]}>
                {tx.type === 'inflow' ? `+${currency.format(tx.amount)}` : `-${currency.format(tx.amount)}`}
              </Text>
              <StatusBadge status={tx.status} />
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
  },
  netAmount: {
    fontSize: 26,
    fontWeight: '900',
    marginVertical: 4,
  },
  subText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partyName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
});
