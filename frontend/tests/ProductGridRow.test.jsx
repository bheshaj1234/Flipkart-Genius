import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductGridRow from '../src/components/ProductGridRow';
import { mockProducts } from '../src/utils/mockData';

describe('ProductGridRow Component Tests', () => {
  it('should render compare details correctly', () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();
    const mockProduct = mockProducts[0];

    render(
      <ProductGridRow
        product={mockProduct}
        onClose={handleClose}
        onSave={handleSave}
      />
    );

    // Should display Title comparisons
    expect(screen.getByText('Blue cotton kurta')).toBeInTheDocument(); // raw title
    expect(screen.getByLabelText(/Enriched Product Title/i)).toHaveValue('Elegant Blue Cotton Straight Kurta for Men'); // editable title
  });

  it('should call onSave with edited form attributes', () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();
    const mockProduct = mockProducts[0];

    render(
      <ProductGridRow
        product={mockProduct}
        onClose={handleClose}
        onSave={handleSave}
      />
    );

    const titleInput = screen.getByLabelText(/Enriched Product Title/i);
    fireEvent.change(titleInput, { target: { value: 'Modified Premium Blue Kurta' } });

    const saveBtn = screen.getByRole('button', { name: /Save Audit Changes/i });
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSave.mock.calls[0][0].finalData.title).toBe('Modified Premium Blue Kurta');
  });
});
