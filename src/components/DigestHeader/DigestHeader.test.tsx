import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DigestHeader } from './DigestHeader';
import { useDigestStore } from '../../store/digestStore';

// Mock useDigest to observe generate calls
const mockGenerate = vi.fn();

vi.mock('../../hooks/useDigest', () => ({
  useDigest: () => ({
    generate: mockGenerate,
    status: useDigestStore.getState().status,
  }),
}));

describe('DigestHeader', () => {
  beforeEach(() => {
    mockGenerate.mockReset();
    useDigestStore.setState({
      status: 'ready',
      topics: [
        { id: 'tech', label: 'Technology', query: 'technology', isActive: true },
        { id: 'climate', label: 'Climate', query: 'climate', isActive: true },
        { id: 'finance', label: 'Finance', query: 'finance', isActive: false },
      ],
    });
  });

  it('renders active topics as tags', () => {
    render(<DigestHeader />);

    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Climate')).toBeInTheDocument();
    expect(screen.queryByText('Finance')).toBeNull();
  });

  it('renders refresh button and calls generate on click', () => {
    render(<DigestHeader />);

    const refreshBtn = screen.getByRole('button', { name: /Refresh Briefing/i });
    expect(refreshBtn).toBeEnabled();

    fireEvent.click(refreshBtn);
    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });

  it('disables the button and shows Updating when status is fetching or summarising', () => {
    useDigestStore.setState({ status: 'fetching' });

    render(<DigestHeader />);

    const refreshBtn = screen.getByRole('button', { name: /Updating/i });
    expect(refreshBtn).toBeDisabled();
  });
});
