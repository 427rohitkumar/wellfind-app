import * as React from 'react';
import { render, screen } from '@/lib/test-utils';
import { SplashScreenView } from './splash-screen';

describe('splashScreenView', () => {
  it('renders correctly with brand title and subtitle', () => {
    render(<SplashScreenView duration={0} />);

    expect(screen.getByTestId('splash-screen')).toBeOnTheScreen();
    expect(screen.getByText('Well Find')).toBeOnTheScreen();
    expect(screen.getByText('Academic')).toBeOnTheScreen();
    expect(screen.getByLabelText('Wellfind Academic Logo')).toBeOnTheScreen();
  });
});
