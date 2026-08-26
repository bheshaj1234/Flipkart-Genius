import test from 'node:test';
import assert from 'node:assert';
import { calculateOptimalPrice, getCompetitorPrice } from '../services/pricingService.js';

test('AI Dynamic Pricing Calculation Calculations', async (t) => {
  
  await t.test('getCompetitorPrice matches key presets', () => {
    const shoePrice = getCompetitorPrice('Nike Running Shoes', 5000);
    assert.strictEqual(shoePrice, 4200);

    const laptopPrice = getCompetitorPrice('Asus ExpertBook B1502', 50000);
    assert.strictEqual(laptopPrice, 48500);

    const randomPrice = getCompetitorPrice('Unmatched Generic Item', 1000);
    assert.ok(randomPrice > 500 && randomPrice < 1500);
  });

  await t.test('match_lowest undercuts competitor price by ₹15', () => {
    const mockProduct = {
      rawInput: { title: 'Nike Running Shoes', price: 5000 },
      finalData: { title: 'Nike Running Shoes', price: 5000 },
      dynamicPricing: {
        enabled: true,
        minPrice: 3000,
        maxPrice: 6000,
        pricingStrategy: 'match_lowest',
        festivalMode: false
      }
    };
    
    // Competitor for Nike Shoes is 4200. Optimal target should undercut it by 15 => 4185.
    const result = calculateOptimalPrice(mockProduct);
    assert.strictEqual(result.competitorPrice, 4200);
    assert.strictEqual(result.optimalPrice, 4185);
  });

  await t.test('demand_surge upscales competitor price by 10%', () => {
    const mockProduct = {
      rawInput: { title: 'Nike Running Shoes', price: 5000 },
      finalData: { title: 'Nike Running Shoes', price: 5000 },
      dynamicPricing: {
        enabled: true,
        minPrice: 3000,
        maxPrice: 6000,
        pricingStrategy: 'demand_surge',
        festivalMode: false
      }
    };
    
    // Competitor 4200 * 1.10 = 4620.
    const result = calculateOptimalPrice(mockProduct);
    assert.strictEqual(result.optimalPrice, 4620);
  });

  await t.test('enforces safety minPrice (floor) guardrail', () => {
    const mockProduct = {
      rawInput: { title: 'Nike Running Shoes', price: 5000 },
      finalData: { title: 'Nike Running Shoes', price: 5000 },
      dynamicPricing: {
        enabled: true,
        minPrice: 4500, // Floor set above competitor undercut target (4185)
        maxPrice: 6000,
        pricingStrategy: 'match_lowest',
        festivalMode: false
      }
    };
    
    // Target would be 4185, but floor of 4500 keeps it at 4500.
    const result = calculateOptimalPrice(mockProduct);
    assert.strictEqual(result.optimalPrice, 4500);
  });

  await t.test('festivalMode downscales apparel listings to drive promotions', () => {
    const mockProduct = {
      rawInput: { title: 'Traditional Cotton Kurta', price: 1000 },
      finalData: { title: 'Traditional Cotton Kurta', price: 1000 },
      dynamicPricing: {
        enabled: true,
        minPrice: 200,
        maxPrice: 2000,
        pricingStrategy: 'match_lowest',
        festivalMode: true // Active Festival
      }
    };
    
    // Competitor Kurta is 650. Undercut matches 635.
    // Apparel festival mode scales down by 12%: 635 * 0.88 = 559.
    const result = calculateOptimalPrice(mockProduct);
    assert.strictEqual(result.competitorPrice, 650);
    assert.strictEqual(result.optimalPrice, 559);
  });

  await t.test('festivalMode upscales non-apparel listings to maximize premium margins', () => {
    const mockProduct = {
      rawInput: { title: 'Asus ExpertBook B1502', price: 50000 },
      finalData: { title: 'Asus ExpertBook B1502', price: 50000 },
      dynamicPricing: {
        enabled: true,
        minPrice: 40000,
        maxPrice: 60000,
        pricingStrategy: 'match_lowest',
        festivalMode: true // Active Festival
      }
    };
    
    // Competitor Laptop is 48500. Undercut matches 48485.
    // Non-apparel festival mode scales up by 8%: 48485 * 1.08 = 52364.
    const result = calculateOptimalPrice(mockProduct);
    assert.strictEqual(result.competitorPrice, 48500);
    assert.strictEqual(result.optimalPrice, 52364);
  });
});
