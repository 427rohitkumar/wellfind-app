import type { Allocation } from './api';
import * as React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { Button, Card, COLORS, formatDate, StatusBadge } from '@/components/wf';
import { getErrorMessage } from '@/lib/api/client';
import { useUpdateMyAllocationStatus } from './api';

export function AllocationCard({ item, showActions = true }: { item: Allocation; showActions?: boolean }) {
  const mutation = useUpdateMyAllocationStatus();
  const student = item.student;

  const respond = (status: 'accepted' | 'rejected') => {
    const run = () =>
      mutation.mutate(
        { id: item.id, status },
        {
          onSuccess: () =>
            showMessage({
              message: status === 'accepted' ? 'Student accepted' : 'Allocation rejected',
              type: status === 'accepted' ? 'success' : 'info',
            }),
          onError: e => showMessage({ message: getErrorMessage(e), type: 'danger' }),
        },
      );
    if (status === 'rejected') {
      Alert.alert('Reject allocation', `Reject ${student?.name ?? 'this student'}? This cannot be undone.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: run },
      ]);
    }
    else {
      run();
    }
  };

  return (
    <Card>
      <View style={styles.top}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(student?.name ?? '?').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.name}>{student?.name ?? 'Student'}</Text>
          <Text style={styles.meta}>
            {[student?.studentClass, item.subject].filter(Boolean).join(' • ')}
          </Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.details}>
        {student?.locality ? <Text style={styles.detail}>{`Location: ${student.locality}`}</Text> : null}
        {student?.preferredTiming ? <Text style={styles.detail}>{`Timing: ${student.preferredTiming}`}</Text> : null}
        <Text style={styles.detail}>{`Allocated: ${formatDate(item.allocatedAt ?? item.createdAt)}`}</Text>
        {item.allocationNotes ? <Text style={styles.detail}>{`Notes: ${item.allocationNotes}`}</Text> : null}
      </View>
      {showActions && item.status === 'assigned'
        ? (
            <View style={styles.actions}>
              <Button
                label="Reject"
                variant="dangerOutline"
                onPress={() => respond('rejected')}
                disabled={mutation.isPending}
                style={styles.flex}
              />
              <Button
                label="Accept"
                onPress={() => respond('accepted')}
                loading={mutation.isPending}
                style={styles.flex}
              />
            </View>
          )
        : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.navy, fontWeight: '800', fontSize: 18, fontFamily: 'Inter' },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.text, fontFamily: 'Inter' },
  meta: { fontSize: 12, color: COLORS.muted, marginTop: 2, fontFamily: 'Inter' },
  details: { marginTop: 10, gap: 3 },
  detail: { fontSize: 12, color: COLORS.muted, fontFamily: 'Inter' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
});
