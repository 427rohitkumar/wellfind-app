import type { ManagedUser, UserAction } from '../api';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Text, View } from 'react-native';

import { showMessage } from 'react-native-flash-message';
import {
  Button,
  Card,
  Chips,
  COLORS,
  Field,
  prettify,
  QueryState,
  Screen,
  SearchBar,
  SectionTitle,
  StatusBadge,
  useDebounced,
} from '@/components/wf';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { getErrorMessage } from '@/lib/api/client';
import { useCreateUser, useUserAction, useUsers } from '../api';

const ROLE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Teachers', value: 'teacher' },
  { label: 'Admins', value: 'super_admin' },
];

export function UsersScreen() {
  const router = useRouter();
  const [role, setRole] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const debounced = useDebounced(search.trim());
  const q = useUsers({ role, search: debounced });
  const docs = q.data?.docs ?? [];

  return (
    <Screen
      title="User Accounts"
      subtitle={`${q.data?.totalDocs ?? 0} users`}
      onBack={() => router.back()}
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}
    >
      {creating
        ? <CreateUserForm onDone={() => setCreating(false)} />
        : <Button label="+ Create User" onPress={() => setCreating(true)} style={{ marginBottom: 12 }} />}
      <SearchBar placeholder="Search by email" value={search} onChangeText={setSearch} />
      <Chips options={ROLE_OPTIONS} value={role} onChange={setRole} />
      <QueryState
        isLoading={q.isLoading}
        error={q.isError ? getErrorMessage(q.error) : null}
        onRetry={() => q.refetch()}
        isEmpty={docs.length === 0}
        emptyTitle="No users found"
      >
        {docs.map(u => <UserRow key={u.id} user={u} />)}
      </QueryState>
    </Screen>
  );
}

function UserRow({ user }: { user: ManagedUser }) {
  const me = useAuthStore.use.user();
  const action = useUserAction();
  const isSelf = me?.id === user.id;

  const run = (a: UserAction) => {
    const exec = () =>
      action.mutate(
        { id: user.id, action: a },
        {
          onSuccess: (res) => {
            if (a === 'reset-password' && res.temporaryPassword) {
              Alert.alert('Temporary password', `${res.temporaryPassword}\n\nShare it securely. It is shown only once.`);
            }
            else {
              showMessage({ message: res.message, type: 'success' });
            }
          },
          onError: e => showMessage({ message: getErrorMessage(e), type: 'danger' }),
        },
      );
    Alert.alert(prettify(a.replace('-', '_')), `${prettify(a.replace('-', '_'))} ${user.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: a === 'block' || a === 'suspend' ? 'destructive' : 'default', onPress: exec },
    ]);
  };

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', color: COLORS.text }}>{user.email}</Text>
          <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{prettify(user.role)}</Text>
        </View>
        <StatusBadge status={user.status} />
      </View>
      {isSelf
        ? null
        : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {user.status === 'active'
                ? (
                    <>
                      <Button label="Suspend" variant="outline" onPress={() => run('suspend')} loading={action.isPending} />
                      <Button label="Block" variant="dangerOutline" onPress={() => run('block')} loading={action.isPending} />
                    </>
                  )
                : null}
              {user.status === 'suspended'
                ? <Button label="Reactivate" variant="outline" onPress={() => run('reactivate')} loading={action.isPending} />
                : null}
              {user.status === 'blocked'
                ? <Button label="Unblock" variant="outline" onPress={() => run('unblock')} loading={action.isPending} />
                : null}
              <Button label="Reset Password" variant="outline" onPress={() => run('reset-password')} loading={action.isPending} />
            </View>
          )}
    </Card>
  );
}

function CreateUserForm({ onDone }: { onDone: () => void }) {
  const create = useCreateUser();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState('teacher');

  const submit = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showMessage({ message: 'Enter a valid email.', type: 'warning' });
      return;
    }
    if (password.length < 8) {
      showMessage({ message: 'Password must be at least 8 characters.', type: 'warning' });
      return;
    }
    create.mutate(
      { email: email.trim(), password, role },
      {
        onSuccess: () => {
          showMessage({ message: 'User created', type: 'success' });
          onDone();
        },
        onError: e => showMessage({ message: getErrorMessage(e), type: 'danger' }),
      },
    );
  };

  return (
    <Card>
      <SectionTitle>New User</SectionTitle>
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Field label="Password (min 8)" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
      <Chips
        options={[{ label: 'Teacher', value: 'teacher' }, { label: 'Super Admin', value: 'super_admin' }]}
        value={role}
        onChange={setRole}
      />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button label="Cancel" variant="outline" onPress={onDone} style={{ flex: 1 }} />
        <Button label="Create" onPress={submit} loading={create.isPending} style={{ flex: 1 }} />
      </View>
    </Card>
  );
}
