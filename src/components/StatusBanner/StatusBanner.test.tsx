import { render, screen } from '@testing-library/react';
import { StatusBanner } from './StatusBanner';
import { describe, it, expect } from 'vitest';

describe('StatusBanner', () => {
  it('renders nothing when idle or ready', () => {
    const { container: idle } = render(<StatusBanner status="idle" error={null} />);
    expect(idle.firstChild).toBeNull();

    const { container: ready } = render(<StatusBanner status="ready" error={null} />);
    expect(ready.firstChild).toBeNull();
  });

  it('renders fetching message', () => {
    render(<StatusBanner status="fetching" error={null} />);
    expect(screen.getByText(/Fetching headlines/i)).toBeInTheDocument();
  });

  it('renders summarising message', () => {
    render(<StatusBanner status="summarising" error={null} />);
    expect(screen.getByText(/Gemini is reading/i)).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<StatusBanner status="error" error="API Key invalid" />);
    expect(screen.getByText(/API Key invalid/i)).toBeInTheDocument();
    expect(screen.getByText(/Please try again/i)).toBeInTheDocument();
  });
});
