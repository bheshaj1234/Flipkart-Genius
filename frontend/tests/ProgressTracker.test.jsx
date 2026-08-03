import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProgressTracker from '../src/components/ProgressTracker';

describe('ProgressTracker Component Tests', () => {
  it('should render progress bar container and header information', () => {
    render(
      <ProgressTracker
        totalRows={5}
        batchId="batch_1"
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByText('Job Processing Tracker')).toBeInTheDocument();
    expect(screen.getByText(/Progress: 0 \/ 5 Items/i)).toBeInTheDocument();
  });
});
