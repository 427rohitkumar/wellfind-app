import type { Allocation } from '../api';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Text, View } from 'react-native';

import { showMessage } from 'react-native-flash-message';
import { Button, Card, Chips, COLORS, formatDate, prettify, QueryState, Screen, StatusBadge } from '@/components/wf';
import { getErrorMessage } from '@/lib/api/client';
import { useAdminAllocationStatus, useAllocations } from '../api';

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
];

/** Admin-permitted transitions (teacher handles accept/reject). */
const NEXT: Record<string, string[]> = {
  assigned: ['cancelled'],
  accepted: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
};

export function AllocationsScreen() {
  const router = useRouter();
  const [status, setStatus] = React.useState('all');
  const q = useAllocations({ status });
  const docs = q.data?.docs ?? [];

  return (
    <Screen
      title="Allocations"
      subtitle={`${q.data?.totalDocs ?? 0} allocations`}
      onBack={() => router.back()}
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}
    >
      <Chips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      <QueryState
        isLoading={q.isLoading}
        error={q.isError ? getErrorMessage(q.error) : null}
        onRetry={() => q.refetch()}
        isEmpty={docs.length === 0}
        emptyTitle="No allocations"
        emptyMessage="Allocate a matching teacher from a student's page."
      >
        {docs.map(a => <AllocationRow key={a.id} item={a} />)}
      </QueryState>
    </Screen>
  );
}

function AllocationRow({ item }: { item: Allocation }) {
  const mutation = useAdminAllocationStatus();
  const next = NEXT[item.status] ?? [];

  const change = (to: string) => {
    const run = () =>
      mutation.mutate(
        { id: item.id, status: to },
        {
          onSuccess: () => showMessage({ message: `Marked ${prettify(to)}`, type: 'success' }),
          onError: e => showMessage({ message: getErrorMessage(e), type: 'danger' }),
        },
      );
    if (to === 'cancelled') {
      Alert.alert('Cancel allocation', 'This cannot be undone.', [
        { text: 'Keep', style: 'cancel' },
        { text: 'Cancel allocation', style: 'destructive', onPress: run },
      ]);
    }
    else {
      run();
    }
  };

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', color: COLORS.text }}>{item.student?.name ?? 'Student'}</Text>
          <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
            {`${item.teacher?.name ?? 'Teacher'} • ${item.subject}`}
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{formatDate(item.allocatedAt ?? item.createdAt)}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      {next.length > 0
        ? (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              {next.map(to => (
                <Button
                  key={to}
                  label={to === 'cancelled' ? 'Cancel' : `Mark ${prettify(to)}`}
                  variant={to === 'cancelled' ? 'dangerOutline' : 'primary'}
                  onPress={() => change(to)}
                  loading={mutation.isPending}
                  style={{ flex: 1 }}
                />
              ))}
            </View>
          )
        : null}
    </Card>
  );
}
