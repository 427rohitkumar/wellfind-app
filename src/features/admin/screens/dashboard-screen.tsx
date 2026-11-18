import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarChart, DonutChart, TrendAreaChart } from '@/components/wf/charts';
import {
  Badge,
  Card,
  COLORS,
  InfoRow,
  QueryState,
  Screen,
  SectionTitle,
  StatCard,
  StatusBadge,
} from '@/components/wf';
import { logoutRequest } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { getErrorMessage } from '@/lib/api/client';
import { type DateRange, useCrmDashboardData } from '../api';

const DATE_RANGES: { key: DateRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

export function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore.use.user();
  const signOut = useAuthStore.use.signOut();
  const [dateRange, setDateRange] = React.useState<DateRange>('30d');

  const q = useCrmDashboardData(dateRange);
  const d = q.data;
  const m = d?.metrics;

  const doSignOut = async () => {
    try {
      await logoutRequest();
    } catch {}
    qc.clear();
    signOut();
    router.replace('/login');
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Are you sure you want to log out?') : true;
      if (confirmed) {
        void doSignOut();
      }
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          void doSignOut();
        },
      },
    ]);
  };

  return (
    <Screen
      title={`Welcome back, ${user?.email?.split('@')[0] || 'Admin'}`}
      subtitle="Wellfind Academic operations overview"
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}
      bottomInset={insets.bottom + 80}
      right={
        <Pressable onPress={handleSignOut} style={styles.logoutBtn}>
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </Pressable>
      }
    >
      {/* Date Range Filter Chips */}
      <View style={styles.filterRow}>
        <View style={styles.chipsContainer}>
          {DATE_RANGES.map(r => {
            const active = dateRange === r.key;
            return (
              <Pressable
                key={r.key}
                onPress={() => setDateRange(r.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {r.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={() => q.refetch()} style={styles.refreshBtn}>
          <Text style={styles.refreshBtnText}>↻ Refresh</Text>
        </Pressable>
      </View>

      <QueryState
        isLoading={q.isLoading}
        error={q.isError ? getErrorMessage(q.error) : null}
        onRetry={() => q.refetch()}
      >
        {/* CRM Operations 8 Core Metric Cards */}
        <SectionTitle>Key Operations Metrics</SectionTitle>
        <View style={styles.metricGrid}>
          <StatCard
            label="Total Students"
            value={m?.totalStudents ?? 0}
            tone="info"
            helper="Live CRM records"
          />
          <StatCard
            label="Active Students"
            value={m?.activeStudents ?? 0}
            tone="ok"
            helper="Enrolled / in progress"
          />
          <StatCard
            label="Total Teachers"
            value={m?.totalTeachers ?? 0}
            tone="info"
            helper="Approved profiles source"
          />
          <StatCard
            label="Active Teachers"
            value={m?.activeTeachers ?? 0}
            tone="ok"
            helper={`${m?.approvedTeachersCount ?? 0} approved`}
          />
          <StatCard
            label="Active Studies"
            value={m?.activeStudies ?? 0}
            tone="info"
            helper="Allocated students"
          />
          <StatCard
            label="Students Awaiting"
            value={m?.studentsAwaiting ?? 0}
            tone="warn"
            helper="Unallocated status"
          />
          <StatCard
            label="Today's Enquiries"
            value={m?.todayEnquiries ?? 0}
            tone="info"
            helper="Received today"
          />
          <StatCard
            label="Pending Enquiries"
            value={m?.pendingEnquiries ?? 0}
            tone="warn"
            helper="New or in progress"
          />
        </View>

        {/* 7-Day Daily Enquiry Trend Chart */}
        <SectionTitle>Daily Enquiry Trend</SectionTitle>
        <Card>
          <Text style={styles.cardHeader}>Enquiries Received (Last 7 Days)</Text>
          <TrendAreaChart points={d?.trendDays ?? []} height={160} color={COLORS.teal} />
        </Card>

        {/* Students by Class Distribution */}
        <SectionTitle>Students by Class</SectionTitle>
        <Card>
          <Text style={styles.cardHeader}>Academic Class Distribution</Text>
          <BarChart items={d?.classDistribution ?? []} maxBars={13} />
        </Card>

        {/* Students by Board Donut Chart */}
        <SectionTitle>Students by Education Board</SectionTitle>
        <Card>
          <Text style={styles.cardHeader}>Board Categories</Text>
          <DonutChart
            segments={d?.boardDistribution ?? []}
            centerLabel="Students"
            centerValue={m?.totalStudents ?? 0}
          />
        </Card>

        {/* Recent Enquiries Section */}
        <SectionTitle>Recent Enquiries</SectionTitle>
        {(!d?.recentEnquiries || d.recentEnquiries.length === 0) ? (
          <Card>
            <Text style={{ color: COLORS.muted, textAlign: 'center', paddingVertical: 12 }}>
              No recent enquiries for this period.
            </Text>
          </Card>
        ) : (
          d.recentEnquiries.map(enq => (
            <Card
              key={enq.id}
              onPress={() => router.push(`/admin/enquiry/${enq.id}` as any)}
            >
              <View style={styles.enquiryRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.enquiryName}>{enq.name || 'Anonymous'}</Text>
                  <Text style={styles.enquiryMeta}>
                    {enq.studentClass || 'Class not specified'} • {Array.isArray(enq.subjects) ? enq.subjects.join(', ') : enq.subjects || 'General'}
                  </Text>
                  <Text style={styles.enquiryDate}>
                    {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                  </Text>
                </View>
                <StatusBadge status={enq.enquiryStatus} />
              </View>
            </Card>
          ))
        )}

        {/* Quick Actions Hub */}
        <SectionTitle>Quick Actions</SectionTitle>
        {[
          { label: 'Review Student Enquiries', path: '/admin/enquiries' },
          { label: 'Review Teacher Applications', path: '/admin/teachers' },
          { label: 'Manage Students & Records', path: '/admin/student-records' },
          { label: 'Teacher Allocations', path: '/admin/allocations' },
          { label: 'User Accounts & Roles', path: '/admin/users' },
          { label: 'Financial Reports & Payouts', path: '/admin/reports' },
        ].map(a => (
          <Card key={a.path} onPress={() => router.push(a.path as any)}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.text }}>{a.label}</Text>
          </Card>
        ))}
      </QueryState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 7,
  },
  chipActive: {
    backgroundColor: COLORS.teal,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    fontFamily: 'Inter',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  refreshBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.teal,
    fontFamily: 'Inter',
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    fontFamily: 'Inter',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  enquiryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  enquiryName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'Inter',
  },
  enquiryMeta: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
    fontFamily: 'Inter',
  },
  enquiryDate: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
    fontFamily: 'Inter',
  },
});
