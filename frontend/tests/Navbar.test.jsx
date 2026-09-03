import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../src/components/Navbar';

const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Navbar Component Tests', () => {
  it('should render brand logo and public navigation links when logged out', () => {
    sessionStorage.clear();
    renderWithRouter(<Navbar theme="dark" toggleTheme={vi.fn()} />);

    expect(screen.getAllByText('Flipkart')[0]).toBeInTheDocument();
    expect(screen.getAllByText('GENIUS')[0]).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('should render authenticated seller options when logged in', () => {
    sessionStorage.setItem('seller_token', 'test_token');
    sessionStorage.setItem('seller_store', 'Test Fashion Store');

    renderWithRouter(<Navbar theme="dark" toggleTheme={vi.fn()} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Bulk Upload')).toBeInTheDocument();
    expect(screen.getAllByText('Add Listing')[0]).toBeInTheDocument();
    expect(screen.getByText('Test Fashion Store')).toBeInTheDocument();
  });

  it('should toggle theme when theme button is clicked', () => {
    const mockToggleTheme = vi.fn();
    renderWithRouter(<Navbar theme="dark" toggleTheme={mockToggleTheme} />);

    const themeButton = screen.getByTitle(/Switch to Light Mode/i);
    fireEvent.click(themeButton);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
