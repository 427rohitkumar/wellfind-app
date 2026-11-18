import * as React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, EmptyState, Screen } from '@/components/wf';

/**
 * The backend does not expose teacher payment / payout endpoints yet.
 * This screen is intentionally an honest empty state until they exist.
 */
export function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <Screen
      title="My Payments"
      subtitle="Registration fee and earnings"
      bottomInset={insets.bottom + 70}
    >
      <Card>
        <EmptyState
          title="No payment records"
          message="Your registration fee and tuition payouts will appear here once payments are enabled for your account."
        />
      </Card>
    </Screen>
  );
}
