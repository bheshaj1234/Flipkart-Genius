import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Dashboard from '../src/pages/Dashboard';

// Helper to render component with Router context
const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Dashboard Component Tests', () => {
  it('should render the dashboard header and quick actions', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('Seller Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Upload Bulk File')).toBeInTheDocument();
  });

  it('should render correct counts in metrics cards', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('Total Uploaded Batches')).toBeInTheDocument();
    // 3 batches in mockData
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Enriched Drafts')).toBeInTheDocument();
  });

  it('should display table list of uploaded files', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('summer_apparel_import.csv')).toBeInTheDocument();
    expect(screen.getByText('ethnic_wear_collection.xlsx')).toBeInTheDocument();
    expect(screen.getByText('bags_and_accessories_v1.csv')).toBeInTheDocument();
  });
});
