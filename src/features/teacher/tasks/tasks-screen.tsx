import * as React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QueryState, Screen, StatCard } from '@/components/wf';
import { getErrorMessage } from '@/lib/api/client';
import { AllocationCard } from '../allocation-card';
import { splitAllocations, useMyAllocations } from '../api';

/** "My Students": allocations the teacher has accepted or that are running. */
export function TasksScreen() {
  const insets = useSafeAreaInsets();
  const q = useMyAllocations();
  const { accepted, active, closed } = splitAllocations(q.data?.docs);
  const students = [...active, ...accepted];

  return (
    <Screen
      title="My Students"
      subtitle="Students you are currently teaching"
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}
      bottomInset={insets.bottom + 70}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <StatCard label="Active" value={active.length} tone="ok" />
        <StatCard label="Awaiting start" value={accepted.length} tone="warn" />
        <StatCard label="Completed / closed" value={closed.length} tone="muted" />
      </View>
      <QueryState
        isLoading={q.isLoading}
        error={q.isError ? getErrorMessage(q.error) : null}
        onRetry={() => q.refetch()}
        isEmpty={students.length === 0}
        emptyTitle="No students yet"
        emptyMessage="Accept a match to start teaching a student."
      >
        {students.map(a => <AllocationCard key={a.id} item={a} showActions={false} />)}
      </QueryState>
    </Screen>
  );
}
