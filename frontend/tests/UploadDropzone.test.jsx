import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UploadDropzone from '../src/components/UploadDropzone';

describe('UploadDropzone Component Tests', () => {
  it('should render drag drop zones for CSV and images', () => {
    const handleFileParsed = vi.fn();
    const handleImagesSelected = vi.fn();

    render(
      <UploadDropzone
        onFileParsed={handleFileParsed}
        onImagesSelected={handleImagesSelected}
      />
    );

    expect(screen.getByText(/1. Upload Product CSV File/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Upload Product Images/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop your CSV file here, or browse/i)).toBeInTheDocument();
  });
});
