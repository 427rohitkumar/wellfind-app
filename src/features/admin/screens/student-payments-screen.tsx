import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

const DEMO_STUDENT_PAYMENTS = [
  { id: 'PAY-26001', student: 'Aarav Sharma', className: 'Class 10', date: '2026-10-08', type: 'Tuition Fee', amount: 15000, method: 'UPI', reference: 'UPI-AX91K2', status: 'completed', notes: 'First instalment' },
  { id: 'PAY-26002', student: 'Ananya Mehta', className: 'Class 8', date: '2026-10-04', type: 'Tuition Fee', amount: 10000, method: 'Bank Transfer', reference: 'NEFT-BC7721', status: 'completed', notes: 'Direct transfer' },
  { id: 'PAY-26003', student: 'Kabir Singh', className: 'Class 12', date: '2026-09-18', type: 'Admission Fee', amount: 8000, method: 'Card', reference: 'CARD-9F31Q', status: 'completed', notes: 'Admission processing' },
  { id: 'PAY-26004', student: 'Diya Patel', className: 'Class 6', date: '2026-10-12', type: 'Tuition Fee', amount: 6000, method: 'UPI', reference: 'UPI-PENDING4', status: 'pending', notes: 'Awaiting bank confirmation' },
  { id: 'PAY-26005', student: 'Kabir Singh', className: 'Class 12', date: '2026-10-10', type: 'Tuition Fee', amount: 12000, method: 'Bank Transfer', reference: 'NEFT-FAILED8', status: 'rejected', notes: 'Payment timed out' },
  { id: 'PAY-26006', student: 'Ananya Mehta', className: 'Class 8', date: '2025-12-20', type: 'Tuition Fee', amount: 7000, method: 'Card', reference: 'CARD-REF22', status: 'cancelled', notes: 'Refunded on request' },
];

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function StudentPaymentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = React.useState('all');

  const filtered = filter === 'all'
    ? DEMO_STUDENT_PAYMENTS
    : DEMO_STUDENT_PAYMENTS.filter(p => p.status === filter);

  const totalCollected = DEMO_STUDENT_PAYMENTS
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = DEMO_STUDENT_PAYMENTS
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Screen
      title="Student Payments"
      subtitle="Fees, receipts & payment transactions"
      onBack={() => router.back()}
      bottomInset={insets.bottom + 40}
    >
      {/* Financial Summaries */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <StatCard
          label="Total Collected"
          value={currency.format(totalCollected)}
          tone="ok"
          helper="Completed tuition & admissions"
        />
        <StatCard
          label="Pending Clearance"
          value={currency.format(totalPending)}
          tone="warn"
          helper="Awaiting confirmation"
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {['all', 'completed', 'pending', 'rejected', 'cancelled'].map(st => {
          const active = filter === st;
          return (
            <Pressable
              key={st}
              onPress={() => setFilter(st)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {st === 'all' ? 'All Payments' : st.replace('_', ' ')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle>Payment Transactions</SectionTitle>
      {filtered.map(p => (
        <Card key={p.id}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>{p.student}</Text>
              <Text style={styles.subText}>{p.className} • {p.type}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amountText}>{currency.format(p.amount)}</Text>
              <StatusBadge status={p.status} />
            </View>
          </View>
          <View style={{ marginTop: 10 }}>
            <InfoRow label="Payment ID" value={p.id} />
            <InfoRow label="Method / Ref" value={`${p.method} (${p.reference})`} />
            <InfoRow label="Date" value={p.date} />
            {p.notes ? <InfoRow label="Notes" value={p.notes} /> : null}
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    textTransform: 'capitalize',
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
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  subText: {
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
