import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DigestHeader } from './DigestHeader';
import { useDigestStore } from '../../store/digestStore';
import type { Digest } from '../../domain/index';

const mockGenerate = vi.fn();
let mockDigest: Digest | null = null;

vi.mock('../../hooks/useDigest', () => ({
  useDigest: () => ({
    generate: mockGenerate,
    status: useDigestStore.getState().status,
    digest: mockDigest,
  }),
}));

const mockPlay = vi.fn();
const mockPause = vi.fn();
const mockResume = vi.fn();
const mockStop = vi.fn();
let mockAudioState = {
  isSupported: true,
  isPlaying: false,
  isPaused: false,
  play: mockPlay,
  pause: mockPause,
  resume: mockResume,
  stop: mockStop,
};

vi.mock('../../hooks/useAudioBriefing', () => ({
  useAudioBriefing: () => mockAudioState,
}));

describe('DigestHeader', () => {
  beforeEach(() => {
    mockGenerate.mockReset();
    mockPlay.mockReset();
    mockPause.mockReset();
    mockResume.mockReset();
    mockStop.mockReset();

    mockDigest = {
      id: 'd1',
      createdAt: '2026-10-19T00:00:00Z',
      topicIds: ['tech'],
      executiveSummary: 'AI and tech saw breakthrough moments today.',
      items: [
        {
          article: {
            id: 'a1',
            title: 'Quantum leap in hardware',
            description: 'Major speedup',
            sourceName: 'TechDaily',
            url: 'https://example.com/1',
            publishedAt: '2026-10-19T00:00:00Z',
            topicId: 'tech',
          },
          relevanceScore: 90,
          aiReason: 'Crucial advance',
        },
      ],
      status: 'ready',
      isFromCache: false,
    };

    mockAudioState = {
      isSupported: true,
      isPlaying: false,
      isPaused: false,
      play: mockPlay,
      pause: mockPause,
      resume: mockResume,
      stop: mockStop,
    };

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

  it('renders Listen to Brief button and calls play when clicked', () => {
    render(<DigestHeader />);

    const playBtn = screen.getByRole('button', { name: /Listen to audio briefing/i });
    expect(playBtn).toBeInTheDocument();

    fireEvent.click(playBtn);
    expect(mockPlay).toHaveBeenCalledTimes(1);
    expect(mockPlay.mock.calls[0][0]).toContain('Quantum leap in hardware');
  });

  it('renders Pause and Stop buttons when audio is playing', () => {
    mockAudioState.isPlaying = true;

    render(<DigestHeader />);

    const pauseBtn = screen.getByRole('button', { name: /Pause audio briefing/i });
    const stopBtn = screen.getByRole('button', { name: /Stop audio briefing/i });

    expect(pauseBtn).toBeInTheDocument();
    expect(stopBtn).toBeInTheDocument();

    fireEvent.click(pauseBtn);
    expect(mockPause).toHaveBeenCalledTimes(1);

    fireEvent.click(stopBtn);
    expect(mockStop).toHaveBeenCalledTimes(1);
  });

  it('renders Resume and Stop buttons when audio is paused', () => {
    mockAudioState.isPaused = true;

    render(<DigestHeader />);

    const resumeBtn = screen.getByRole('button', { name: /Resume audio briefing/i });
    const stopBtn = screen.getByRole('button', { name: /Stop audio briefing/i });

    expect(resumeBtn).toBeInTheDocument();
    expect(stopBtn).toBeInTheDocument();

    fireEvent.click(resumeBtn);
    expect(mockResume).toHaveBeenCalledTimes(1);
  });
});
