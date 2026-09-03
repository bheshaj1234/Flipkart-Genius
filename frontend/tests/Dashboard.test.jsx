import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Dashboard from '../src/pages/Dashboard';

const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Dashboard Component Tests', () => {
  it('should render the dashboard header and quick actions', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByText('Upload Bulk Catalog')).toBeInTheDocument();
  });

  it('should render correct counts in metrics cards', async () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('Total Batches')).toBeInTheDocument();
    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(screen.getByText('Enriched Drafts')).toBeInTheDocument();
  });

  it('should display table list of uploaded files', async () => {
    renderWithRouter(<Dashboard />);
    
    expect(await screen.findByText('summer_apparel_import.csv')).toBeInTheDocument();
    expect(await screen.findByText('ethnic_wear_collection.xlsx')).toBeInTheDocument();
    expect(await screen.findByText('bags_and_accessories_v1.csv')).toBeInTheDocument();
  });
});
