import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { TopicSelector } from './TopicSelector';
import { useDigestStore } from '../../store/digestStore';

describe('TopicSelector', () => {
  beforeEach(() => {
    // Reset topics to clean initial state
    useDigestStore.setState({
      topics: [
        { id: 'tech', label: 'Technology', query: 'technology', isActive: true },
        { id: 'ai', label: 'AI', query: 'artificial intelligence', isActive: true },
        { id: 'science', label: 'Science', query: 'science', isActive: false },
      ],
    });
  });

  it('renders all topics with active count', () => {
    render(<TopicSelector />);

    expect(screen.getByText(/Your Focus/i)).toBeInTheDocument();
    expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Technology/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AI/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Science/i })).toBeInTheDocument();
  });

  it('toggles an inactive topic to active when clicked', () => {
    render(<TopicSelector />);

    const scienceBtn = screen.getByRole('button', { name: /Science/i });
    fireEvent.click(scienceBtn);

    expect(screen.getByText(/3 selected/i)).toBeInTheDocument();
  });

  it('toggles an active topic to inactive when clicked if more than one is active', () => {
    render(<TopicSelector />);

    const techBtn = screen.getByRole('button', { name: /Technology/i });
    fireEvent.click(techBtn);

    expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
  });

  it('disables the chip and prevents deactivation when only one topic remains active', () => {
    useDigestStore.setState({
      topics: [
        { id: 'tech', label: 'Technology', query: 'technology', isActive: true },
        { id: 'ai', label: 'AI', query: 'artificial intelligence', isActive: false },
      ],
    });

    render(<TopicSelector />);

    const techBtn = screen.getByRole('button', { name: /Technology/i });
    expect(techBtn).toBeDisabled();

    fireEvent.click(techBtn);
    // Still 1 selected because guard prevents deselecting last topic
    expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
  });
});
