/* eslint-disable max-lines-per-function */
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import {
  Button,
  Card,
  Field,
  formatDate,
  InfoRow,
  prettify,
  QueryState,
  Screen,
  SectionTitle,
  StatusBadge,
} from '@/components/wf';
import { getErrorMessage } from '@/lib/api/client';
import { useConvertEnquiry, useStudentEnquiry, useUpdateStudentEnquiry } from '../api';

/** Allowed manual transitions (convert is its own endpoint). */
const NEXT: Record<string, string[]> = {
  new: ['contacted', 'closed'],
  contacted: ['in_progress', 'closed'],
  in_progress: ['closed'],
  converted: ['closed'],
  closed: ['contacted', 'in_progress'],
  allocated: [],
};

const NEEDS_REASON = (from: string, to: string) => to === 'closed' || from === 'closed';

export function EnquiryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const enquiryId = Number(id);
  const router = useRouter();
  const q = useStudentEnquiry(enquiryId);
  const update = useUpdateStudentEnquiry();
  const convert = useConvertEnquiry();
  const [notes, setNotes] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState('');
  const e = q.data;

  const notesValue = notes ?? e?.adminNotes ?? '';
  const canConvert = !!e && ['new', 'contacted', 'in_progress'].includes(e.enquiryStatus);

  const changeStatus = (to: string) => {
    if (!e)
      return;
    if (NEEDS_REASON(e.enquiryStatus, to) && !reason.trim()) {
      showMessage({ message: 'Please enter a reason for this change.', type: 'warning' });
      return;
    }
    update.mutate(
      {
        id: e.id,
        enquiryStatus: to,
        ...(NEEDS_REASON(e.enquiryStatus, to) ? { changeReason: reason.trim() } : {}),
      },
      {
        onSuccess: () => {
          setReason('');
          showMessage({ message: `Status changed to ${prettify(to)}`, type: 'success' });
        },
        onError: err => showMessage({ message: getErrorMessage(err), type: 'danger' }),
      },
    );
  };

  const saveNotes = () => {
    if (!e)
      return;
    update.mutate(
      { id: e.id, adminNotes: notesValue },
      {
        onSuccess: () => showMessage({ message: 'Notes saved', type: 'success' }),
        onError: err => showMessage({ message: getErrorMessage(err), type: 'danger' }),
      },
    );
  };

  const doConvert = () => {
    if (!e)
      return;
    Alert.alert('Convert to student', `Create a student record for ${e.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Convert',
        onPress: () =>
          convert.mutate(
            { id: e.id },
            {
              onSuccess: (res) => {
                showMessage({ message: 'Converted to student', type: 'success' });
                if (res?.student?.id) {
                  router.replace(`/admin/student/${res.student.id}` as any);
                }
              },
              onError: err => showMessage({ message: getErrorMessage(err), type: 'danger' }),
            },
          ),
      },
    ]);
  };

  return (
    <Screen
      title="Enquiry Details"
      subtitle={e?.name}
      onBack={() => router.back()}
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}
    >
      <QueryState isLoading={q.isLoading} error={q.isError ? getErrorMessage(q.error) : null} onRetry={() => q.refetch()}>
        {e
          ? (
              <>
                <Card>
                  <View style={{ marginBottom: 8 }}>
                    <StatusBadge status={e.enquiryStatus} />
                  </View>
                  <InfoRow label="Student" value={e.name} />
                  <InfoRow label="Phone" value={e.phoneNumber} />
                  <InfoRow label="Class" value={e.studentClass} />
                  <InfoRow label="Subjects" value={[...(e.subjects ?? []), e.customSubject].filter(Boolean).join(', ')} />
                  <InfoRow label="Locality" value={[e.locality, e.customLocality].filter(Boolean).join(' - ')} />
                  <InfoRow label="Timing" value={e.preferredTiming} />
                  <InfoRow label="Budget" value={e.budgetRange} />
                  <InfoRow label="Source" value={prettify(e.enquirySource)} />
                  <InfoRow label="Received" value={formatDate(e.createdAt)} />
                  <InfoRow label="Parent notes" value={e.additionalNotes} />
                </Card>

                <SectionTitle>Update Status</SectionTitle>
                <Card>
                  <Field
                    label="Reason (required for close / reopen)"
                    value={reason}
                    onChangeText={setReason}
                    placeholder="Why is the status changing?"
                  />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {(NEXT[e.enquiryStatus] ?? []).map(to => (
                      <Button
                        key={to}
                        label={`Mark ${prettify(to)}`}
                        variant={to === 'closed' ? 'dangerOutline' : 'outline'}
                        onPress={() => changeStatus(to)}
                        loading={update.isPending}
                      />
                    ))}
                    {canConvert
                      ? <Button label="Convert to Student" onPress={doConvert} loading={convert.isPending} />
                      : null}
                  </View>
                </Card>

                <SectionTitle>Admin Notes</SectionTitle>
                <Card>
                  <Field
                    value={notesValue}
                    onChangeText={setNotes}
                    placeholder="Internal notes"
                    multiline
                  />
                  <Button label="Save Notes" variant="outline" onPress={saveNotes} loading={update.isPending} />
                </Card>
              </>
            )
          : null}
      </QueryState>
    </Screen>
  );
}
