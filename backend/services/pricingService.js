import Product from '../models/Product.js';

/**
 * Simulates scraping/querying competitor price based on product title
 */
export const getCompetitorPrice = (title, originalPrice) => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('asus') && titleLower.includes('expertbook')) {
    return 48500;
  }
  if (titleLower.includes('headphone') || titleLower.includes('earphone')) {
    return 4899;
  }
  if (titleLower.includes('kurta')) {
    return 1199;
  }
  if (titleLower.includes('mouse')) {
    return 1449;
  }
  if (titleLower.includes('keyboard')) {
    return 2849;
  }
  if (titleLower.includes('watch')) {
    return 3299;
  }
  if (titleLower.includes('chair')) {
    return 8499;
  }
  
  const base = Number(originalPrice) || 1000;
  return Math.max(100, Math.round(base * 0.96));
};

/**
 * Calculates optimal price based on competitor price, strategy, and seasonal festival modes
 */
export const calculateOptimalPrice = (product) => {
  const { minPrice, maxPrice, pricingStrategy, festivalMode } = product.dynamicPricing;
  const title = product.rawInput.title || product.finalData.title || '';
  const basePrice = product.rawInput.price || product.finalData.price || 500;
  
  // 1. Fetch competitor baseline price
  const competitorPrice = getCompetitorPrice(title, basePrice);
  
  let targetPrice = basePrice;

  // 2. Apply Strategy calculations
  if (pricingStrategy === 'match_lowest') {
    // Undercut competitor slightly to secure Buy Box speed
    targetPrice = competitorPrice - 15;
  } else if (pricingStrategy === 'maximize_margin') {
    // Target maximum ceiling margin
    targetPrice = maxPrice > 0 ? maxPrice : Math.round(competitorPrice * 1.15);
  } else if (pricingStrategy === 'demand_surge') {
    // Boost price based on simulated popularity surge
    targetPrice = Math.round(competitorPrice * 1.10);
  }

  // 3. Apply Festival Season Mode scaling adjustments
  if (festivalMode) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('kurta') || titleLower.includes('dress') || titleLower.includes('trouser')) {
      // Apparel: scale down to run volume/sales promotions
      console.log(`🎉 [Festival Mode] Downscaling apparel listing: "${title}" by 12%`);
      targetPrice = Math.round(targetPrice * 0.88);
    } else {
      // Electronics/Other: scale up to capture premium seasonal margins
      console.log(`🎉 [Festival Mode] Upscaling listing: "${title}" by 8%`);
      targetPrice = Math.round(targetPrice * 1.08);
    }
  }

  // 4. Enforce Floor & Ceiling guardrails (Sellers Safety boundaries)
  const floorPrice = minPrice > 0 ? minPrice : Math.round(basePrice * 0.6);
  const ceilingPrice = maxPrice > 0 ? maxPrice : Math.round(basePrice * 1.6);

  // Guarantee price never dips below break-even floor or exceeds max cap
  targetPrice = Math.max(targetPrice, floorPrice);
  targetPrice = Math.min(targetPrice, ceilingPrice);

  return {
    optimalPrice: targetPrice,
    competitorPrice
  };
};

/**
 * Updates a single product listing with optimized dynamic pricing
 */
export const optimizeProductPrice = async (productId) => {
  const product = await Product.findById(productId);
  if (!product || !product.dynamicPricing.enabled) return null;

  const { optimalPrice, competitorPrice } = calculateOptimalPrice(product);

  product.finalData.price = optimalPrice;
  product.dynamicPricing.competitorPrice = competitorPrice;
  product.dynamicPricing.lastChecked = new Date();

  await product.save();
  return product;
};

/**
 * Run pricing optimization job in batch for all enabled listings
 */
export const runBatchPricingOptimization = async (sellerId) => {
  const activeProducts = await Product.find({
    sellerId,
    'dynamicPricing.enabled': true
  });

  console.log(`💼 Running pricing calculations job for ${activeProducts.length} listings...`);

  const updates = [];
  for (const product of activeProducts) {
    const updated = await optimizeProductPrice(product._id);
    if (updated) updates.push(updated);
  }

  return updates;
};
