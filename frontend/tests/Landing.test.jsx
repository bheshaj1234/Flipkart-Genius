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
    
    expect(screen.getAllByText('Flipkart')[0]).toBeInTheDocument();
    expect(screen.getAllByText('GENIUS')[0]).toBeInTheDocument();
    expect(screen.getByText('Enrich Your Catalog')).toBeInTheDocument();
  });

  it('should show register and sign in buttons for guest users', () => {
    renderWithRouter(<Landing />);
    
    expect(screen.getAllByRole('link', { name: /Register/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Sign In/i })[0]).toBeInTheDocument();
  });
});
