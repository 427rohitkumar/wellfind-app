import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, COLORS, QueryState, Screen, SectionTitle, StatCard } from '@/components/wf';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { getErrorMessage } from '@/lib/api/client';
import { AllocationCard } from '../allocation-card';
import { splitAllocations, useMyAllocations } from '../api';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore.use.user();
  const q = useMyAllocations();
  const { pending, accepted, active } = splitAllocations(q.data?.docs);
  const name = user?.email?.split('@')[0] ?? 'Teacher';

  return (
    <Screen
      title={`Hello, ${name}`}
      subtitle="Manage your teaching journey"
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}
      bottomInset={insets.bottom + 70}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
        <StatCard label="New Matches" value={pending.length} tone="info" />
        <StatCard label="Active Students" value={active.length} tone="ok" />
        <StatCard label="Awaiting Start" value={accepted.length} tone="warn" />
        <StatCard label="Total Allocations" value={q.data?.totalDocs ?? 0} tone="muted" />
      </View>

      <SectionTitle
        action={(
          <Pressable onPress={() => router.push('/(app)/matches')}>
            <Text style={{ color: COLORS.teal, fontWeight: '700', fontSize: 13, fontFamily: 'Inter' }}>View All</Text>
          </Pressable>
        )}
      >
        New Match Requests
      </SectionTitle>
      <QueryState
        isLoading={q.isLoading}
        error={q.isError ? getErrorMessage(q.error) : null}
        onRetry={() => q.refetch()}
        isEmpty={pending.length === 0}
        emptyTitle="No pending requests"
        emptyMessage="You are all caught up."
      >
        {pending.slice(0, 3).map(a => <AllocationCard key={a.id} item={a} />)}
      </QueryState>

      {active.length > 0
        ? (
            <>
              <SectionTitle>My Students</SectionTitle>
              <Card>
                {active.slice(0, 4).map(a => (
                  <View key={a.id} style={{ paddingVertical: 6 }}>
                    <Text style={{ fontWeight: '700', color: COLORS.text }}>{a.student?.name}</Text>
                    <Text style={{ color: COLORS.muted, fontSize: 12 }}>
                      {[a.student?.studentClass, a.subject].filter(Boolean).join(' • ')}
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          )
        : null}
    </Screen>
  );
}
