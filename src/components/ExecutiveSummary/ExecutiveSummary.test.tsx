import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ExecutiveSummary } from './ExecutiveSummary';

describe('ExecutiveSummary', () => {
  it('renders badge and summary text when ready', () => {
    render(<ExecutiveSummary summary="A major geopolitical shift occurred today." status="ready" />);

    expect(screen.getByText(/AI Editor's Briefing/i)).toBeInTheDocument();
    expect(screen.getByText(/A major geopolitical shift occurred today/i)).toBeInTheDocument();
  });

  it('renders skeleton loading placeholders when summarising', () => {
    const { container } = render(
      <ExecutiveSummary summary="Should not be visible yet" status="summarising" />
    );

    expect(screen.getByText(/AI Editor's Briefing/i)).toBeInTheDocument();
    expect(screen.queryByText(/Should not be visible yet/i)).toBeNull();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
