import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from '../src/pages/Login';

// Helper to render component with Router context
const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Login Component Tests', () => {
  it('should render form fields correctly', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByPlaceholderText('seller@store.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('should display error if empty fields are submitted', async () => {
    renderWithRouter(<Login />);
    
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    const errorMsg = await screen.findByText('Please fill in all fields');
    expect(errorMsg).toBeInTheDocument();
  });

  it('should trigger loading animation and store credentials on login', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText('seller@store.com');
    const passInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'test@seller.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });
    
    fireEvent.click(submitBtn);

    // Should set values in localStorage after simulated delay
    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith('seller_token', 'mock-jwt-token-xyz');
      expect(setItemSpy).toHaveBeenCalledWith('seller_store', 'FashionCart Store');
    }, { timeout: 1000 });

    setItemSpy.mockRestore();
  });
});
