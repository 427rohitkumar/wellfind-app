import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Badge,
  Card,
  COLORS,
  EmptyState,
  QueryState,
  Screen,
  StatusBadge,
} from '@/components/wf';
import { getErrorMessage } from '@/lib/api/client';
import { useStudents } from '../api';

const RECORD_STATUSES = ['all', 'active', 'enrolled', 'in_progress', 'paused', 'completed', 'inactive'];

export function StudentRecordsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [status, setStatus] = React.useState('all');
  const [search, setSearch] = React.useState('');

  const q = useStudents({
    status: status === 'all' ? undefined : status,
    search: search.trim() || undefined,
  });

  const students = q.data?.docs ?? [];

  return (
    <Screen
      title="Student Records"
      subtitle="Converted students, assessments & academic history"
      onBack={() => router.back()}
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}
      bottomInset={insets.bottom + 40}
    >
      {/* Search Input */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search by student name or phone…"
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterRow}>
        {RECORD_STATUSES.map(st => {
          const active = status === st;
          return (
            <Pressable
              key={st}
              onPress={() => setStatus(st)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {st === 'all' ? 'All Statuses' : st.replace('_', ' ')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <QueryState
        isLoading={q.isLoading}
        error={q.isError ? getErrorMessage(q.error) : null}
        onRetry={() => q.refetch()}
      >
        {students.length === 0 ? (
          <EmptyState title="No student records found." message="No records match the current filter." />
        ) : (
          students.map(s => (
            <Card
              key={s.id}
              onPress={() => router.push(`/admin/student/${s.id}` as any)}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{s.name}</Text>
                  <Text style={styles.metaText}>
                    {s.studentClass || 'Class not specified'} • {s.phoneNumber}
                  </Text>
                  {s.locality ? (
                    <Text style={styles.subMeta}>Locality: {s.locality}</Text>
                  ) : null}
                  {s.subjects && s.subjects.length > 0 ? (
                    <Text style={styles.subMeta}>Subjects: {s.subjects.join(', ')}</Text>
                  ) : null}
                </View>
                <StatusBadge status={s.status} />
              </View>
            </Card>
          ))
        )}
      </QueryState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: {
    height: 42,
    fontSize: 14,
    color: COLORS.text,
  },
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
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  subMeta: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
});
