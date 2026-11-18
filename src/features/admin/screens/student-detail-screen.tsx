import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import {
  Button,
  Card,
  COLORS,
  InfoRow,
  prettify,
  QueryState,
  Screen,
  SectionTitle,
  StatusBadge,
} from '@/components/wf';
import { getErrorMessage } from '@/lib/api/client';
import {
  useAllocations,
  useCreateAllocation,
  useStudent,
  useStudentMatches,
  useUpdateStudent,
} from '../api';

const STATUSES = ['active', 'paused', 'inactive', 'completed'];

export function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const studentId = Number(id);
  const router = useRouter();
  const q = useStudent(studentId);
  const update = useUpdateStudent();
  const allocations = useAllocations({ studentId });
  const [showMatches, setShowMatches] = React.useState(false);
  const s = q.data;

  const setStatus = (status: string) =>
    update.mutate(
      { id: studentId, status },
      {
        onSuccess: () => showMessage({ message: `Student ${status}`, type: 'success' }),
        onError: e => showMessage({ message: getErrorMessage(e), type: 'danger' }),
      },
    );

  return (
    <Screen
      title="Student"
      subtitle={s?.name}
      onBack={() => router.back()}
      refreshing={q.isRefetching}
      onRefresh={() => {
        q.refetch();
        allocations.refetch();
      }}
    >
      <QueryState isLoading={q.isLoading} error={q.isError ? getErrorMessage(q.error) : null} onRetry={() => q.refetch()}>
        {s
          ? (
              <>
                <Card>
                  <View style={{ marginBottom: 8 }}>
                    <StatusBadge status={s.status} />
                  </View>
                  <InfoRow label="Name" value={s.name} />
                  <InfoRow label="Parent" value={s.parentName} />
                  <InfoRow label="Phone" value={s.phoneNumber} />
                  <InfoRow label="Alt. phone" value={s.alternatePhoneNumber} />
                  <InfoRow label="Parent email" value={s.parentEmail} />
                  <InfoRow label="Class" value={s.studentClass} />
                  <InfoRow label="Subjects" value={[...(s.subjects ?? []), s.customSubject].filter(Boolean).join(', ')} />
                  <InfoRow label="Locality" value={[s.locality, s.customLocality].filter(Boolean).join(' - ')} />
                  <InfoRow label="Timing" value={s.preferredTiming} />
                  <InfoRow label="Budget" value={s.budgetRange} />
                  <InfoRow label="Learning notes" value={s.learningNotes} />
                </Card>

                <SectionTitle>Status</SectionTitle>
                <Card>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {STATUSES.filter(x => x !== s.status).map(x => (
                      <Button
                        key={x}
                        label={prettify(x)}
                        variant="outline"
                        onPress={() => setStatus(x)}
                        loading={update.isPending}
                      />
                    ))}
                  </View>
                </Card>

                <SectionTitle>Allocations</SectionTitle>
                {(allocations.data?.docs ?? []).map(a => (
                  <Card key={a.id}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '700', color: COLORS.text }}>{a.teacher?.name ?? 'Teacher'}</Text>
                        <Text style={{ fontSize: 12, color: COLORS.muted }}>{a.subject}</Text>
                      </View>
                      <StatusBadge status={a.status} />
                    </View>
                  </Card>
                ))}
                {(allocations.data?.docs ?? []).length === 0
                  ? <Text style={{ color: COLORS.muted, fontSize: 13, marginBottom: 12 }}>Not allocated to any teacher yet.</Text>
                  : null}

                <SectionTitle>Teacher Matching</SectionTitle>
                {showMatches
                  ? <Matches studentId={studentId} subjects={[...(s.subjects ?? []), s.customSubject].filter(Boolean) as string[]} />
                  : <Button label="Find Matching Teachers" onPress={() => setShowMatches(true)} />}
              </>
            )
          : null}
      </QueryState>
    </Screen>
  );
}

function Matches({ studentId, subjects }: { studentId: number; subjects: string[] }) {
  const q = useStudentMatches(studentId);
  const create = useCreateAllocation();
  const [subject, setSubject] = React.useState(subjects[0] ?? '');
  const matches = q.data?.matches ?? [];

  const allocate = (teacherId: number, name: string) => {
    if (!subject) {
      showMessage({ message: 'Select a subject first.', type: 'warning' });
      return;
    }
    Alert.alert('Allocate teacher', `Allocate ${name} for ${subject}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Allocate',
        onPress: () =>
          create.mutate(
            { studentId, teacherId, subject },
            {
              onSuccess: () => showMessage({ message: 'Teacher allocated', type: 'success' }),
              onError: e => showMessage({ message: getErrorMessage(e), type: 'danger' }),
            },
          ),
      },
    ]);
  };

  return (
    <QueryState
      isLoading={q.isLoading}
      error={q.isError ? getErrorMessage(q.error) : null}
      onRetry={() => q.refetch()}
      isEmpty={matches.length === 0}
      emptyTitle="No eligible teachers"
      emptyMessage="No approved, free teacher matches this student's subject, class and locality."
    >
      <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>Subject to allocate</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {subjects.map(sub => (
          <Pressable
            key={sub}
            onPress={() => setSubject(sub)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: subject === sub ? COLORS.navy : COLORS.border,
              backgroundColor: subject === sub ? COLORS.navy : '#FFFFFF',
            }}
          >
            <Text style={{ color: subject === sub ? '#FFFFFF' : COLORS.muted, fontWeight: '600', fontSize: 13 }}>{sub}</Text>
          </Pressable>
        ))}
      </View>
      {matches.map(m => (
        <Card key={m.teacherId}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight: '700', color: COLORS.text, flex: 1 }}>{m.name}</Text>
            {m.qualityScore != null ? <Text style={{ fontWeight: '800', color: COLORS.teal }}>{`${m.qualityScore}`}</Text> : null}
          </View>
          <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
            {[m.primarySubject, m.classLevel, m.locality].filter(Boolean).join(' • ')}
          </Text>
          <Button
            label="Allocate"
            onPress={() => allocate(m.teacherId, m.name)}
            loading={create.isPending}
            style={{ marginTop: 10 }}
          />
        </Card>
      ))}
    </QueryState>
  );
}
