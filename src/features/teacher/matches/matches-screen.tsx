import * as React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chips, QueryState, Screen } from '@/components/wf';
import { getErrorMessage } from '@/lib/api/client';
import { AllocationCard } from '../allocation-card';
import { useMyAllocations } from '../api';

type Filter = 'new' | 'accepted' | 'active' | 'closed' | 'all';

const OPTIONS: { label: string; value: Filter }[] = [
  { label: 'New', value: 'new' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Active', value: 'active' },
  { label: 'Closed', value: 'closed' },
  { label: 'All', value: 'all' },
];

const MAP: Record<Exclude<Filter, 'all'>, string[]> = {
  new: ['assigned'],
  accepted: ['accepted'],
  active: ['active'],
  closed: ['completed', 'rejected', 'cancelled'],
};

export function MatchesScreen() {
  const [filter, setFilter] = React.useState<Filter>('new');
  const insets = useSafeAreaInsets();
  const q = useMyAllocations();
  const docs = (q.data?.docs ?? []).filter(a => filter === 'all' || MAP[filter].includes(a.status));

  return (
    <Screen
      title="Student Matches"
      subtitle="Students allocated to you by Wellfind Academic"
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}
      bottomInset={insets.bottom + 70}
    >
      <Chips options={OPTIONS} value={filter} onChange={setFilter} />
      <QueryState
        isLoading={q.isLoading}
        error={q.isError ? getErrorMessage(q.error) : null}
        onRetry={() => q.refetch()}
        isEmpty={docs.length === 0}
        emptyTitle="No allocations"
        emptyMessage="New student allocations will appear here."
      >
        {docs.map(a => <AllocationCard key={a.id} item={a} />)}
      </QueryState>
    </Screen>
  );
}
