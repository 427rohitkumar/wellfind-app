import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Card,
  COLORS,
  InfoRow,
  Screen,
  SectionTitle,
  StatCard,
  StatusBadge,
} from '@/components/wf';

const DEMO_TEACHER_PAYMENTS = [
  { id: 'PO-26001', teacher: 'Dr. Debabrata Banerjee', category: 'Teacher Payout', amount: 24000, reference: 'PAY-DB-01', date: '2026-10-15', status: 'completed', bank: 'SBI •••• 4412' },
  { id: 'PO-26002', teacher: 'Priya Nair', category: 'Teacher Payout', amount: 21000, reference: 'PAY-PN-02', date: '2026-10-10', status: 'completed', bank: 'HDFC •••• 9923' },
  { id: 'PO-26003', teacher: 'Rohan Kapoor', category: 'Teacher Payout', amount: 18000, reference: 'PAY-RK-03', date: '2026-10-05', status: 'pending', bank: 'ICICI •••• 1109' },
  { id: 'RF-26001', teacher: 'Meera Iyer', category: 'Registration Fee', amount: 5000, reference: 'REG-MI-01', date: '2026-09-28', status: 'completed', bank: 'UPI Direct' },
  { id: 'RF-26002', teacher: 'Arjun Malhotra', category: 'Registration Fee', amount: 4500, reference: 'REG-AM-02', date: '2026-09-15', status: 'completed', bank: 'UPI Direct' },
];

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function TeacherPaymentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = React.useState('all');

  const filtered = filter === 'all'
    ? DEMO_TEACHER_PAYMENTS
    : DEMO_TEACHER_PAYMENTS.filter(p => filter === 'payout' ? p.category === 'Teacher Payout' : p.category === 'Registration Fee');

  const totalPayouts = DEMO_TEACHER_PAYMENTS
    .filter(p => p.category === 'Teacher Payout' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayouts = DEMO_TEACHER_PAYMENTS
    .filter(p => p.category === 'Teacher Payout' && p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Screen
      title="Teacher Payments"
      subtitle="Teacher payouts, compensation & registration fees"
      onBack={() => router.back()}
      bottomInset={insets.bottom + 40}
    >
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <StatCard
          label="Total Payouts"
          value={currency.format(totalPayouts)}
          tone="ok"
          helper="Disbursed earnings"
        />
        <StatCard
          label="Pending Payouts"
          value={currency.format(pendingPayouts)}
          tone="warn"
          helper="Awaiting bank processing"
        />
      </View>

      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'All Records' },
          { key: 'payout', label: 'Payouts Only' },
          { key: 'fee', label: 'Registration Fees' },
        ].map(tab => {
          const active = filter === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle>Disbursements & Receipts</SectionTitle>
      {filtered.map(p => (
        <Card key={p.id}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.teacherName}>{p.teacher}</Text>
              <Text style={styles.categoryText}>{p.category}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amountText}>{currency.format(p.amount)}</Text>
              <StatusBadge status={p.status} />
            </View>
          </View>
          <View style={{ marginTop: 10 }}>
            <InfoRow label="Reference ID" value={p.reference} />
            <InfoRow label="Payment Mode" value={p.bank} />
            <InfoRow label="Date" value={p.date} />
          </View>
        </Card>
      ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  teacherName: {
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
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.teal,
    marginBottom: 4,
  },
});
