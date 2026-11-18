import { useRouter } from 'expo-router';
import * as React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Chips, COLORS, formatDate, QueryState, Screen, SearchBar, StatusBadge, useDebounced } from '@/components/wf';
import { getErrorMessage } from '@/lib/api/client';
import { useStudentEnquiries } from '../api';

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Converted', value: 'converted' },
  { label: 'Closed', value: 'closed' },
];

export function EnquiriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [status, setStatus] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const debounced = useDebounced(search.trim());
  const q = useStudentEnquiries({ status, search: debounced });
  const docs = q.data?.docs ?? [];

  return (
    <Screen
      title="Student Enquiries"
      subtitle={`${q.data?.totalDocs ?? 0} enquiries`}
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}
      bottomInset={insets.bottom + 70}
    >
      <SearchBar placeholder="Search by student name" value={search} onChangeText={setSearch} />
      <Chips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      <QueryState
        isLoading={q.isLoading}
        error={q.isError ? getErrorMessage(q.error) : null}
        onRetry={() => q.refetch()}
        isEmpty={docs.length === 0}
        emptyTitle="No enquiries found"
      >
        {docs.map(e => (
          <Card key={e.id} onPress={() => router.push(`/admin/enquiry/${e.id}` as any)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1 }}>{e.name}</Text>
              <StatusBadge status={e.enquiryStatus} />
            </View>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
              {[e.studentClass, (e.subjects ?? []).join(', ')].filter(Boolean).join(' • ')}
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
              {`${e.phoneNumber} • ${formatDate(e.createdAt)}`}
            </Text>
          </Card>
        ))}
      </QueryState>
    </Screen>
  );
}
