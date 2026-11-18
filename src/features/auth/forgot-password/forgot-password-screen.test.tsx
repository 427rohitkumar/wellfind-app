import * as React from 'react';

import { cleanup, render, screen } from '@/lib/test-utils';

import { ForgotPasswordScreen } from './forgot-password-screen';

afterEach(cleanup);

describe('forgotPasswordScreen', () => {
  it('renders Step 1 (email input) correctly', () => {
    render(<ForgotPasswordScreen />);

    expect(screen.getByText('Forgot Password?')).toBeOnTheScreen();
    expect(screen.getByTestId('forgot-email-input')).toBeOnTheScreen();
    expect(screen.getByTestId('send-code-button')).toBeOnTheScreen();
  });
});
