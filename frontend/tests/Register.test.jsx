import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Register from '../src/pages/Register';

// Helper to render component with Router context
const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Register Component Tests', () => {
  it('should render form inputs correctly', () => {
    renderWithRouter(<Register />);
    
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('FashionCart Store')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seller@store.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('should display error if empty fields are submitted', async () => {
    renderWithRouter(<Register />);
    
    const submitBtn = screen.getByRole('button', { name: /Register/i });
    fireEvent.click(submitBtn);

    const errorMsg = await screen.findByText('Ayo, fill in all fields no cap!');
    expect(errorMsg).toBeInTheDocument();
  });

  it('should trigger loading animation and store register credentials on submit', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    renderWithRouter(<Register />);
    
    const nameInput = screen.getByPlaceholderText('John Doe');
    const storeInput = screen.getByPlaceholderText('FashionCart Store');
    const emailInput = screen.getByPlaceholderText('seller@store.com');
    const passInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(storeInput, { target: { value: 'SparkStore' } });
    fireEvent.change(emailInput, { target: { value: 'jane@seller.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });
    
    fireEvent.click(submitBtn);

    // Should set values in localStorage after simulated delay
    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith('seller_token', 'mock-jwt-token-xyz');
      expect(setItemSpy).toHaveBeenCalledWith('seller_store', 'SparkStore');
    }, { timeout: 1000 });

    setItemSpy.mockRestore();
  });
});
