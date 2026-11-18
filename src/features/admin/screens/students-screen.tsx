import { useRouter } from 'expo-router';
import * as React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Chips, COLORS, QueryState, Screen, SearchBar, StatusBadge, useDebounced } from '@/components/wf';
import { getErrorMessage } from '@/lib/api/client';
import { useStudents } from '../api';

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Completed', value: 'completed' },
];

export function StudentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [status, setStatus] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const debounced = useDebounced(search.trim());
  const q = useStudents({ status, search: debounced });
  const docs = q.data?.docs ?? [];

  return (
    <Screen
      title="Students"
      subtitle={`${q.data?.totalDocs ?? 0} students`}
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}
      bottomInset={insets.bottom + 70}
    >
      <SearchBar placeholder="Search name, phone or parent" value={search} onChangeText={setSearch} />
      <Chips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      <QueryState
        isLoading={q.isLoading}
        error={q.isError ? getErrorMessage(q.error) : null}
        onRetry={() => q.refetch()}
        isEmpty={docs.length === 0}
        emptyTitle="No students found"
        emptyMessage="Convert a student enquiry to create a student record."
      >
        {docs.map(s => (
          <Card key={s.id} onPress={() => router.push(`/admin/student/${s.id}` as any)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1 }}>{s.name}</Text>
              <StatusBadge status={s.status} />
            </View>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
              {[s.studentClass, (s.subjects ?? []).join(', ')].filter(Boolean).join(' • ')}
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
              {[s.phoneNumber, s.locality].filter(Boolean).join(' • ')}
            </Text>
          </Card>
        ))}
      </QueryState>
    </Screen>
  );
}
