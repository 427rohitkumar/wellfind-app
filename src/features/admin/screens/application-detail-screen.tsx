/* eslint-disable max-lines-per-function */
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Text, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import {
  Button,
  Card,
  COLORS,
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
import {
  useApproveTeacher,
  useCreateEvaluation,
  useEvaluations,
  useTeacherEnquiry,
  useUpdateTeacherEnquiry,
} from '../api';

const NEXT: Record<string, string[]> = {
  new: ['under_review', 'rejected'],
  under_review: ['shortlisted', 'rejected'],
  shortlisted: ['rejected'],
  evaluation_completed: ['rejected'],
  approved: [],
  rejected: ['under_review'],
};

export function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const appId = Number(id);
  const router = useRouter();
  const q = useTeacherEnquiry(appId);
  const evals = useEvaluations(appId);
  const update = useUpdateTeacherEnquiry();
  const approve = useApproveTeacher();
  const [notes, setNotes] = React.useState<string | null>(null);
  const a = q.data;
  const notesValue = notes ?? a?.adminNotes ?? '';

  const changeStatus = (to: string) => {
    if (!a)
      return;
    update.mutate(
      { id: a.id, applicationStatus: to },
      {
        onSuccess: () => showMessage({ message: `Marked ${prettify(to)}`, type: 'success' }),
        onError: e => showMessage({ message: getErrorMessage(e), type: 'danger' }),
      },
    );
  };

  const saveNotes = () => {
    if (!a)
      return;
    update.mutate(
      { id: a.id, adminNotes: notesValue },
      {
        onSuccess: () => showMessage({ message: 'Notes saved', type: 'success' }),
        onError: e => showMessage({ message: getErrorMessage(e), type: 'danger' }),
      },
    );
  };

  const doApprove = () => {
    if (!a)
      return;
    Alert.alert(
      'Approve teacher',
      `Approve ${a.fullName}? A teacher login account will be created and they can activate it via Forgot Password.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () =>
            approve.mutate(
              { id: a.id },
              {
                onSuccess: () => showMessage({ message: 'Teacher approved', type: 'success' }),
                onError: e => showMessage({ message: getErrorMessage(e), type: 'danger' }),
              },
            ),
        },
      ],
    );
  };

  return (
    <Screen
      title="Application"
      subtitle={a?.fullName}
      onBack={() => router.back()}
      refreshing={q.isRefetching}
      onRefresh={() => {
        q.refetch();
        evals.refetch();
      }}
    >
      <QueryState isLoading={q.isLoading} error={q.isError ? getErrorMessage(q.error) : null} onRetry={() => q.refetch()}>
        {a
          ? (
              <>
                <Card>
                  <View style={{ marginBottom: 8 }}>
                    <StatusBadge status={a.applicationStatus} />
                  </View>
                  <InfoRow label="Name" value={a.fullName} />
                  <InfoRow label="Mobile" value={a.mobileNumber} />
                  <InfoRow label="Email" value={a.email} />
                  <InfoRow label="Qualification" value={a.highestQualification} />
                  <InfoRow label="Experience" value={a.teachingExperience} />
                  <InfoRow label="Subject" value={a.primarySubject} />
                  <InfoRow label="Class level" value={a.classLevel} />
                  <InfoRow label="Locality" value={a.teachingLocality} />
                  <InfoRow label="Availability" value={a.preferredAvailability} />
                  <InfoRow label="Applied" value={formatDate(a.createdAt)} />
                  <InfoRow label="Notes" value={a.additionalNotes} />
                </Card>

                <SectionTitle>Workflow</SectionTitle>
                <Card>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {(NEXT[a.applicationStatus] ?? []).map(to => (
                      <Button
                        key={to}
                        label={`Mark ${prettify(to)}`}
                        variant={to === 'rejected' ? 'dangerOutline' : 'outline'}
                        onPress={() => changeStatus(to)}
                        loading={update.isPending}
                      />
                    ))}
                    {a.applicationStatus === 'evaluation_completed'
                      ? <Button label="Approve Teacher" onPress={doApprove} loading={approve.isPending} />
                      : null}
                  </View>
                  {a.applicationStatus === 'shortlisted'
                    ? (
                        <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 10 }}>
                          Record a completed evaluation below to enable approval.
                        </Text>
                      )
                    : null}
                </Card>

                <SectionTitle>Evaluations</SectionTitle>
                {(evals.data?.docs ?? []).map(ev => (
                  <Card key={ev.id}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontWeight: '700', color: COLORS.text }}>{`Attempt #${ev.attemptNumber}`}</Text>
                      <StatusBadge status={ev.evaluationStatus} />
                    </View>
                    <InfoRow
                      label="Written test"
                      value={ev.writtenTest ? `${ev.writtenTest.marksObtained}/${ev.writtenTest.totalMarks}` : null}
                    />
                    <InfoRow
                      label="Interview"
                      value={ev.interview ? `${ev.interview.marksObtained}/${ev.interview.totalMarks}` : null}
                    />
                    <InfoRow label="Quality score" value={ev.qualityScore} />
                    <InfoRow label="Remarks" value={ev.overallRemarks} />
                  </Card>
                ))}
                {(evals.data?.docs ?? []).length === 0
                  ? <Text style={{ color: COLORS.muted, fontSize: 13, marginBottom: 12 }}>No evaluations recorded yet.</Text>
                  : null}
                {['approved', 'rejected'].includes(a.applicationStatus)
                  ? null
                  : <EvaluationForm enquiryId={a.id} />}

                <SectionTitle>Admin Notes</SectionTitle>
                <Card>
                  <Field value={notesValue} onChangeText={setNotes} placeholder="Internal notes" multiline />
                  <Button label="Save Notes" variant="outline" onPress={saveNotes} loading={update.isPending} />
                </Card>
              </>
            )
          : null}
      </QueryState>
    </Screen>
  );
}

function EvaluationForm({ enquiryId }: { enquiryId: number }) {
  const create = useCreateEvaluation();
  const [wm, setWm] = React.useState('');
  const [wt, setWt] = React.useState('100');
  const [im, setIm] = React.useState('');
  const [it, setIt] = React.useState('100');
  const [remarks, setRemarks] = React.useState('');

  const submit = () => {
    const nums = [wm, wt, im, it].map(Number);
    if ([wm, wt, im, it].some(v => v.trim() === '') || nums.some(n => Number.isNaN(n))) {
      showMessage({ message: 'Enter valid numeric marks for both sections.', type: 'warning' });
      return;
    }
    const [wmN, wtN, imN, itN] = nums;
    if (wtN <= 0 || itN <= 0 || wmN < 0 || imN < 0 || wmN > wtN || imN > itN) {
      showMessage({ message: 'Marks must be within 0 and the total marks.', type: 'warning' });
      return;
    }
    create.mutate(
      {
        enquiryId,
        writtenTest: { marksObtained: wmN, totalMarks: wtN },
        interview: { marksObtained: imN, totalMarks: itN },
        ...(remarks.trim() ? { overallRemarks: remarks.trim() } : {}),
      },
      {
        onSuccess: (ev) => {
          showMessage({ message: `Evaluation saved. Score: ${ev?.qualityScore ?? '-'}`, type: 'success' });
          setWm('');
          setIm('');
          setRemarks('');
        },
        onError: e => showMessage({ message: getErrorMessage(e), type: 'danger' }),
      },
    );
  };

  return (
    <Card>
      <Text style={{ fontWeight: '700', color: COLORS.text, marginBottom: 10 }}>Add Evaluation</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Field label="Written marks" value={wm} onChangeText={setWm} keyboardType="numeric" placeholder="75" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Written total" value={wt} onChangeText={setWt} keyboardType="numeric" />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Field label="Interview marks" value={im} onChangeText={setIm} keyboardType="numeric" placeholder="80" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Interview total" value={it} onChangeText={setIt} keyboardType="numeric" />
        </View>
      </View>
      <Field label="Remarks" value={remarks} onChangeText={setRemarks} multiline placeholder="Optional" />
      <Button label="Save Evaluation" onPress={submit} loading={create.isPending} />
    </Card>
  );
}
