import { describe, it, expect } from 'vitest';
import { validateProductRow } from '../src/utils/csvParser';

describe('CSV Parser Schema Validation Tests', () => {
  it('should validate a clean, correct product row', () => {
    const rawRow = {
      title: 'Vibrant Green T-Shirt',
      price: '499',
      category: 'Apparel',
      imageUrls: 'http://example.com/image.jpg'
    };

    const result = validateProductRow(rawRow, 1);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data.title).toBe('Vibrant Green T-Shirt');
    expect(result.data.price).toBe(499);
    expect(result.data.category).toBe('Apparel');
    expect(result.data.imageUrls).toEqual(['http://example.com/image.jpg']);
  });

  it('should reject a row missing a title or with a very short title', () => {
    const rowNoTitle = { price: '299', category: 'Apparel' };
    const rowShortTitle = { title: 'Tee', price: '299', category: 'Apparel' };

    const result1 = validateProductRow(rowNoTitle, 1);
    const result2 = validateProductRow(rowShortTitle, 2);

    expect(result1.isValid).toBe(false);
    expect(result1.errors).toContain('Title is a required field.');
    
    expect(result2.isValid).toBe(false);
    expect(result2.errors).toContain('Title is too short (minimum 5 characters).');
  });

  it('should validate and enforce numerical positive prices', () => {
    const rowNoPrice = { title: 'Classic Jeans', category: 'Apparel' };
    const rowBadPrice = { title: 'Classic Jeans', price: 'abc', category: 'Apparel' };
    const rowNegativePrice = { title: 'Classic Jeans', price: '-10', category: 'Apparel' };

    const res1 = validateProductRow(rowNoPrice, 1);
    const res2 = validateProductRow(rowBadPrice, 2);
    const res3 = validateProductRow(rowNegativePrice, 3);

    expect(res1.isValid).toBe(false);
    expect(res1.errors).toContain('Price is a required field.');

    expect(res2.isValid).toBe(false);
    expect(res2.errors).toContain('Price must be a valid number.');

    expect(res3.isValid).toBe(false);
    expect(res3.errors).toContain('Price must be greater than zero.');
  });

  it('should reject if category is missing', () => {
    const row = { title: 'Designer Purse', price: '1500' };
    const result = validateProductRow(row, 1);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Category is a required field.');
  });

  it('should add warnings if no imageUrl is present', () => {
    const row = { title: 'Cotton Socks', price: '199', category: 'Apparel' };
    const result = validateProductRow(row, 1);

    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain('No product image link specified. Vision extraction will be skipped.');
  });
});
