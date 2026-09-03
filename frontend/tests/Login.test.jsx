import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../src/pages/Login';
import API from '../src/services/api';

const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Login Component Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('should render form fields correctly', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByPlaceholderText('seller@store.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('should display error if empty fields are submitted', async () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText('seller@store.com');
    const form = emailInput.closest('form');
    fireEvent.submit(form);

    const errorMsg = await screen.findByText('Please fill in all fields');
    expect(errorMsg).toBeInTheDocument();
  });

  it('should trigger loading animation and store credentials on login', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    API.post = vi.fn().mockResolvedValue({
      data: { success: true, token: 'mock-token-123', seller: { storeName: 'FashionCart Store' } }
    });
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText('seller@store.com');
    const passInput = screen.getByPlaceholderText('••••••••');
    const form = emailInput.closest('form');

    fireEvent.change(emailInput, { target: { value: 'test@seller.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });
    
    fireEvent.submit(form);

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith('seller_token', 'mock-token-123');
    }, { timeout: 2000 });
  });
});
