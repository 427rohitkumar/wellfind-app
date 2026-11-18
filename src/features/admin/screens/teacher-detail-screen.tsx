import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import {
  Button,
  Card,
  formatDate,
  InfoRow,
  prettify,
  QueryState,
  Screen,
  SectionTitle,
  StatusBadge,
} from '@/components/wf';
import { getErrorMessage } from '@/lib/api/client';
import { useTeacher, useUpdateTeacherAvailability, useUpdateTeacherStatus } from '../api';

export function TeacherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const teacherId = Number(id);
  const router = useRouter();
  const q = useTeacher(teacherId);
  const setStatus = useUpdateTeacherStatus();
  const setAvailability = useUpdateTeacherAvailability();
  const t = q.data as any;
  const accountStatus: string | undefined = t?.account?.status;

  const onStatus = (status: 'active' | 'inactive' | 'suspended') =>
    setStatus.mutate(
      { id: teacherId, status },
      {
        onSuccess: () => showMessage({ message: `Teacher ${status}`, type: 'success' }),
        onError: e => showMessage({ message: getErrorMessage(e), type: 'danger' }),
      },
    );

  const onAvailability = (availabilityStatus: 'free' | 'allocated') =>
    setAvailability.mutate(
      { id: teacherId, availabilityStatus },
      {
        onSuccess: () => showMessage({ message: `Marked ${availabilityStatus}`, type: 'success' }),
        onError: e => showMessage({ message: getErrorMessage(e), type: 'danger' }),
      },
    );

  return (
    <Screen
      title="Teacher"
      subtitle={t?.name}
      onBack={() => router.back()}
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}
    >
      <QueryState isLoading={q.isLoading} error={q.isError ? getErrorMessage(q.error) : null} onRetry={() => q.refetch()}>
        {t
          ? (
              <>
                <Card>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <StatusBadge status={t.approvalStatus} />
                    <StatusBadge status={t.availabilityStatus} />
                    {accountStatus ? <StatusBadge status={accountStatus} /> : null}
                  </View>
                  <InfoRow label="Name" value={t.name} />
                  <InfoRow label="Email" value={t.email} />
                  <InfoRow label="Mobile" value={t.mobile} />
                  <InfoRow label="Subject" value={t.primarySubject} />
                  <InfoRow label="Class levels" value={t.classLevels} />
                  <InfoRow label="Qualification" value={t.qualification} />
                  <InfoRow label="Experience (yrs)" value={t.experienceYears} />
                  <InfoRow label="Locality" value={t.locality} />
                  <InfoRow label="Availability" value={t.availability} />
                  <InfoRow label="Quality score" value={t.evaluationScore} />
                  <InfoRow label="Approved" value={formatDate(t.approvedAt)} />
                </Card>

                {t.registrationFee || t.kyc
                  ? (
                      <Card>
                        <InfoRow label="Registration fee" value={prettify(t.registrationFee?.status)} />
                        <InfoRow
                          label="Fee amount"
                          value={t.registrationFee?.amount != null ? `₹${t.registrationFee.amount}` : null}
                        />
                        <InfoRow label="KYC" value={prettify(t.kyc?.status)} />
                      </Card>
                    )
                  : null}

                <SectionTitle>Operational Status</SectionTitle>
                <Card>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    <Button label="Set Active" variant="outline" onPress={() => onStatus('active')} loading={setStatus.isPending} />
                    <Button label="Set Inactive" variant="outline" onPress={() => onStatus('inactive')} loading={setStatus.isPending} />
                    <Button label="Suspend" variant="dangerOutline" onPress={() => onStatus('suspended')} loading={setStatus.isPending} />
                  </View>
                </Card>

                <SectionTitle>Availability</SectionTitle>
                <Card>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button
                      label="Mark Free"
                      variant={t.availabilityStatus === 'free' ? 'primary' : 'outline'}
                      onPress={() => onAvailability('free')}
                      loading={setAvailability.isPending}
                    />
                    <Button
                      label="Mark Allocated"
                      variant={t.availabilityStatus === 'allocated' ? 'primary' : 'outline'}
                      onPress={() => onAvailability('allocated')}
                      loading={setAvailability.isPending}
                    />
                  </View>
                </Card>
              </>
            )
          : null}
      </QueryState>
    </Screen>
  );
}
