import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ConfidenceBadge from '../src/components/ConfidenceBadge';

describe('ConfidenceBadge Component Tests', () => {
  it('should render green badge for high confidence score (>= 0.8)', () => {
    render(<ConfidenceBadge score={0.92} />);
    
    const badge = screen.getByText('92% High');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('.inline-flex')).toHaveClass('bg-emerald-50');
  });

  it('should render amber badge for medium confidence score (0.6 - 0.79)', () => {
    render(<ConfidenceBadge score={0.72} />);
    
    const badge = screen.getByText('72% Medium');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('.inline-flex')).toHaveClass('bg-amber-50');
  });

  it('should render red badge for low confidence score (< 0.6)', () => {
    render(<ConfidenceBadge score={0.54} />);
    
    const badge = screen.getByText('54% Low');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('.inline-flex')).toHaveClass('bg-rose-50');
  });
});
