import { useRouter } from 'expo-router';
import * as React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Chips, COLORS, formatDate, QueryState, Screen, SearchBar, StatusBadge, useDebounced } from '@/components/wf';
import { getErrorMessage } from '@/lib/api/client';
import { useTeacherEnquiries, useTeachers } from '../api';

const TABS = [
  { label: 'Applications', value: 'applications' },
  { label: 'Approved Teachers', value: 'teachers' },
];

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Evaluated', value: 'evaluation_completed' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export function TeachersScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = React.useState('applications');
  return (
    <Screen
      title="Teachers"
      subtitle="Applications, evaluation and approved teachers"
      scroll={false}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Chips options={TABS} value={tab} onChange={setTab} />
      </View>
      {tab === 'applications'
        ? <Applications bottom={insets.bottom + 70} />
        : <ApprovedTeachers bottom={insets.bottom + 70} />}
    </Screen>
  );
}

function Applications({ bottom }: { bottom: number }) {
  const router = useRouter();
  const [status, setStatus] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const debounced = useDebounced(search.trim());
  const q = useTeacherEnquiries({ status, search: debounced });
  const docs = q.data?.docs ?? [];

  return (
    <ListShell
      bottom={bottom}
      header={(
        <>
          <SearchBar placeholder="Search by applicant name" value={search} onChangeText={setSearch} />
          <Chips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        </>
      )}
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}
    >
      <QueryState
        isLoading={q.isLoading}
        error={q.isError ? getErrorMessage(q.error) : null}
        onRetry={() => q.refetch()}
        isEmpty={docs.length === 0}
        emptyTitle="No applications found"
      >
        {docs.map(a => (
          <Card key={a.id} onPress={() => router.push(`/admin/application/${a.id}` as any)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1 }}>{a.fullName}</Text>
              <StatusBadge status={a.applicationStatus} />
            </View>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
              {`${a.primarySubject} • ${a.classLevel}`}
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
              {`${a.teachingLocality} • ${formatDate(a.createdAt)}`}
            </Text>
          </Card>
        ))}
      </QueryState>
    </ListShell>
  );
}

function ApprovedTeachers({ bottom }: { bottom: number }) {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const debounced = useDebounced(search.trim());
  const q = useTeachers({ search: debounced });
  const docs = q.data?.docs ?? [];

  return (
    <ListShell
      bottom={bottom}
      header={<SearchBar placeholder="Search by teacher name" value={search} onChangeText={setSearch} />}
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}
    >
      <QueryState
        isLoading={q.isLoading}
        error={q.isError ? getErrorMessage(q.error) : null}
        onRetry={() => q.refetch()}
        isEmpty={docs.length === 0}
        emptyTitle="No approved teachers"
      >
        {docs.map(t => (
          <Card key={t.id} onPress={() => router.push(`/admin/teacher/${t.id}` as any)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1 }}>{t.name}</Text>
              <StatusBadge status={t.availabilityStatus} />
            </View>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
              {[t.primarySubject, t.classLevels].filter(Boolean).join(' • ')}
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
              {[t.locality, t.evaluationScore != null ? `Score ${t.evaluationScore}` : null].filter(Boolean).join(' • ')}
            </Text>
          </Card>
        ))}
      </QueryState>
    </ListShell>
  );
}

/** Scrollable list body used inside a non-scrolling Screen. */
function ListShell({
  children,
  header,
  bottom,
  refreshing,
  onRefresh,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  bottom: number;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom }}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {header}
      {children}
    </ScrollView>
  );
}
