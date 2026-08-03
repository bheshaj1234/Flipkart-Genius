import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Landing from '../src/pages/Landing';

const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Landing Component Tests', () => {
  it('should render the landing page header and pitch correctly', () => {
    renderWithRouter(<Landing />);
    
    expect(screen.getByText('Flipkart')).toBeInTheDocument();
    expect(screen.getByText('Genius')).toBeInTheDocument();
    expect(screen.getByText('The End of Tedious Bulk Product Uploads')).toBeInTheDocument();
    expect(screen.getByText('Next-Gen AI Catalog Integration')).toBeInTheDocument();
  });

  it('should show register and sign in buttons for guest users', () => {
    renderWithRouter(<Landing />);
    
    expect(screen.getByRole('link', { name: /Register Store/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();
  });
});
