import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Register from '../src/pages/Register';
import API from '../src/services/api';

const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Register Component Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('should render form inputs correctly', () => {
    renderWithRouter(<Register />);
    
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('FashionCart Store')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seller@store.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('should display error if empty fields are submitted', async () => {
    renderWithRouter(<Register />);
    
    const nameInput = screen.getByPlaceholderText('John Doe');
    const form = nameInput.closest('form');
    fireEvent.submit(form);

    const errorMsg = await screen.findByText('Please fill in all fields.');
    expect(errorMsg).toBeInTheDocument();
  });

  it('should trigger loading animation and store register credentials on submit', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    API.post = vi.fn().mockResolvedValue({
      data: { success: true, token: 'mock-token-xyz', seller: { storeName: 'SparkStore' } }
    });
    
    renderWithRouter(<Register />);
    
    const nameInput = screen.getByPlaceholderText('John Doe');
    const storeInput = screen.getByPlaceholderText('FashionCart Store');
    const emailInput = screen.getByPlaceholderText('seller@store.com');
    const passInput = screen.getByPlaceholderText('••••••••');
    const form = nameInput.closest('form');

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(storeInput, { target: { value: 'SparkStore' } });
    fireEvent.change(emailInput, { target: { value: 'jane@seller.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });
    
    fireEvent.submit(form);

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith('seller_token', 'mock-token-xyz');
      expect(setItemSpy).toHaveBeenCalledWith('seller_store', 'SparkStore');
    }, { timeout: 2000 });
  });
});
