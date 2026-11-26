import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArticleCard } from './ArticleCard';
import type { DigestItem } from '../../domain/index';

const mockAskDeepDive = vi.fn();

vi.mock('../../adapters/GeminiAdapter', () => ({
  askDeepDive: (...args: unknown[]) => mockAskDeepDive(...args),
}));

describe('ArticleCard', () => {
  const mockItem: DigestItem = {
    article: {
      id: 'abc123hash',
      title: 'Revolutionary Quantum Breakthrough Announced',
      description: 'Scientists have achieved a new milestone in quantum coherence.',
      url: 'https://example.com/quantum-news',
      sourceName: 'TechDaily',
      publishedAt: '2026-10-15T12:00:00Z',
      topicId: 'tech',
    },
    relevanceScore: 92,
    aiReason: 'Crucial advance for next-generation computing architectures.',
  };

  beforeEach(() => {
    mockAskDeepDive.mockReset();
  });

  it('renders headline, source, description, and AI insight', () => {
    render(<ArticleCard item={mockItem} index={0} />);

    expect(screen.getByText('Revolutionary Quantum Breakthrough Announced')).toBeInTheDocument();
    expect(screen.getByText(/TechDaily/i)).toBeInTheDocument();
    expect(screen.getByText(/Scientists have achieved a new milestone/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Insight:/i)).toBeInTheDocument();
    expect(screen.getByText(/Crucial advance for next-generation/i)).toBeInTheDocument();
    expect(screen.getByText(/Score 92%/i)).toBeInTheDocument();
  });

  it('renders safe anchor link with noopener noreferrer for valid https URLs', () => {
    render(<ArticleCard item={mockItem} index={0} />);

    const link = screen.getByRole('link', { name: /Revolutionary Quantum Breakthrough/i });
    expect(link).toHaveAttribute('href', 'https://example.com/quantum-news');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders headline as plain text without link when URL is unsafe', () => {
    const unsafeItem: DigestItem = {
      ...mockItem,
      article: {
        ...mockItem.article,
        url: 'javascript:alert("XSS")',
      },
    };

    render(<ArticleCard item={unsafeItem} index={1} />);

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Revolutionary Quantum Breakthrough Announced')).toBeInTheDocument();
  });

  it('renders interactive deep dive prompt chips and fetches explanation on click', async () => {
    mockAskDeepDive.mockResolvedValue('Imagine quantum particles are like spinning spinning tops that never stop.');

    render(<ArticleCard item={mockItem} index={0} />);

    const eli5Btn = screen.getByRole('button', { name: /Explain simply/i });
    expect(eli5Btn).toBeInTheDocument();

    fireEvent.click(eli5Btn);

    expect(mockAskDeepDive).toHaveBeenCalledWith(mockItem.article, 'eli5');

    await waitFor(() => {
      expect(
        screen.getByText(/Imagine quantum particles are like spinning spinning tops/i)
      ).toBeInTheDocument();
    });

    // Close button dismisses the answer panel
    const closeBtn = screen.getByRole('button', { name: /Close deep dive/i });
    fireEvent.click(closeBtn);

    expect(
      screen.queryByText(/Imagine quantum particles are like spinning spinning tops/i)
    ).toBeNull();
  });

  it('applies staggered animation delay when not from cache', () => {
    const { container } = render(<ArticleCard item={mockItem} index={2} isFromCache={false} />);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement.style.animationDelay).toBe('150ms');
  });

  it('suppresses animation delay when restored from cache', () => {
    const { container } = render(<ArticleCard item={mockItem} index={2} isFromCache={true} />);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement.style.animationDelay).toBe('0ms');
  });
});
