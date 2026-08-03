// Sample Mock Data for E-commerce Bulk Upload Sandbox

export const mockBatches = [
  {
    _id: "batch_664df08b4efc8942e88a01a1",
    sellerId: "seller_1",
    fileName: "summer_apparel_import.csv",
    totalRows: 8,
    processedRows: 8,
    failedRows: 0,
    status: "completed",
    createdAt: "2026-07-23T12:30:00.000Z",
    completedAt: "2026-07-23T12:31:15.000Z"
  },
  {
    _id: "batch_664df08b4efc8942e88a01a2",
    sellerId: "seller_1",
    fileName: "ethnic_wear_collection.xlsx",
    totalRows: 6,
    processedRows: 4,
    failedRows: 2, // Low confidence or missing image failures
    status: "needs_review",
    createdAt: "2026-07-23T14:15:00.000Z",
    completedAt: "2026-07-23T14:17:02.000Z"
  },
  {
    _id: "batch_664df08b4efc8942e88a01a3",
    sellerId: "seller_1",
    fileName: "bags_and_accessories_v1.csv",
    totalRows: 12,
    processedRows: 4,
    failedRows: 0,
    status: "processing", // Active animated state
    createdAt: "2026-07-23T15:40:00.000Z",
    completedAt: null
  }
];

export const mockProducts = [
  // Products for batch 2 (needs_review)
  {
    _id: "prod_001",
    batchId: "batch_664df08b4efc8942e88a01a2",
    sellerId: "seller_1",
    rawInput: {
      title: "Blue cotton kurta",
      category: "Kurtas",
      price: 899,
      imageUrls: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"]
    },
    aiGenerated: {
      title: "Elegant Blue Cotton Straight Kurta for Men",
      description: "Experience premium comfort with our Men's Straight Kurta crafted from 100% breathable organic cotton. Featuring a sophisticated solid color pattern, standard mandarin collar, and full button placket. Perfect for traditional celebrations, festive occasions, or casual ethnic wear.",
      bulletPoints: [
        "Premium Organic Cotton fabric for maximum summer comfort",
        "Classic Straight Cut fit with side slits for easy movement",
        "Mandarin collar styling with half-button placket detail",
        "Vibrant solid royal blue color dyed with eco-friendly colors"
      ],
      extractedAttributes: {
        color: "Royal Blue",
        pattern: "Solid",
        material: "Organic Cotton"
      },
      suggestedCategory: "Apparel",
      suggestedSubcategory: "Kurtas",
      confidenceScore: 0.94
    },
    finalData: {
      title: "Elegant Blue Cotton Straight Kurta for Men",
      description: "Experience premium comfort with our Men's Straight Kurta crafted from 100% breathable organic cotton. Featuring a sophisticated solid color pattern, standard mandarin collar, and full button placket. Perfect for traditional celebrations, festive occasions, or casual ethnic wear.",
      category: "Apparel",
      subcategory: "Kurtas",
      price: 899,
      attributes: {
        color: "Royal Blue",
        pattern: "Solid",
        material: "Organic Cotton"
      },
      imageUrls: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"]
    },
    status: "needs_review",
    rejectionReason: null
  },
  {
    _id: "prod_002",
    batchId: "batch_664df08b4efc8942e88a01a2",
    sellerId: "seller_1",
    rawInput: {
      title: "Women linen trousers white",
      category: "Trousers",
      price: 1299,
      imageUrls: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80"]
    },
    aiGenerated: {
      title: "Casual White Linen High-Waist Trousers for Women",
      description: "Stay stylishly relaxed in these premium white linen trousers. Tailored with a comfortable high-waist fit, wide legs, and functional side pockets. Extremely lightweight and suitable for beach vacations, summer lunches, or smart-casual office wear.",
      bulletPoints: [
        "Lightweight Linen-Cotton blend offering optimal breathability",
        "High-waisted fit with an elasticated back waistband for comfort",
        "Wide-leg silhouette for a modern, flowy summer look",
        "Twin functional side-seam pockets and decorative back pockets"
      ],
      extractedAttributes: {
        color: "Off-White",
        pattern: "Plain",
        material: "Linen-Cotton Blend"
      },
      suggestedCategory: "Apparel",
      suggestedSubcategory: "Trousers",
      confidenceScore: 0.88
    },
    finalData: {
      title: "Casual White Linen High-Waist Trousers for Women",
      description: "Stay stylishly relaxed in these premium white linen trousers. Tailored with a comfortable high-waist fit, wide legs, and functional side pockets. Extremely lightweight and suitable for beach vacations, summer lunches, or smart-casual office wear.",
      category: "Apparel",
      subcategory: "Trousers",
      price: 1299,
      attributes: {
        color: "Off-White",
        pattern: "Plain",
        material: "Linen-Cotton Blend"
      },
      imageUrls: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80"]
    },
    status: "needs_review",
    rejectionReason: null
  },
  {
    _id: "prod_003",
    batchId: "batch_664df08b4efc8942e88a01a2",
    sellerId: "seller_1",
    rawInput: {
      title: "Floral print maxi dress red",
      category: "Dresses",
      price: 1599,
      imageUrls: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80"]
    },
    aiGenerated: {
      title: "Summer Red Floral Print A-Line Maxi Dress",
      description: "Elevate your summer fashion with this vibrant red maxi dress. Detailed with an all-over floral print, short flutter sleeves, and a flattering self-tie waist belt. Soft Georgette fabric wraps around you beautifully with a gentle fluid drape.",
      bulletPoints: [
        "Premium flowy Georgette fabric with soft inner lining",
        "Attractive all-over floral design on a bright red base",
        "Flutter sleeves and crossover V-neck wrap design",
        "Flattering A-line silhouette with tiered hem details"
      ],
      extractedAttributes: {
        color: "Crimson Red",
        pattern: "Floral Print",
        material: "Georgette Polyester"
      },
      suggestedCategory: "Apparel",
      suggestedSubcategory: "Dresses",
      confidenceScore: 0.55 // Low confidence - flags needs_review highlight
    },
    finalData: {
      title: "Summer Red Floral Print A-Line Maxi Dress",
      description: "Elevate your summer fashion with this vibrant red maxi dress. Detailed with an all-over floral print, short flutter sleeves, and a flattering self-tie waist belt. Soft Georgette fabric wraps around you beautifully with a gentle fluid drape.",
      category: "Apparel",
      subcategory: "Dresses",
      price: 1599,
      attributes: {
        color: "Crimson Red",
        pattern: "Floral Print",
        material: "Georgette Polyester"
      },
      imageUrls: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80"]
    },
    status: "needs_review",
    rejectionReason: "Confidence score below threshold (0.6). Automated category match is uncertain."
  },
  {
    _id: "prod_004",
    batchId: "batch_664df08b4efc8942e88a01a2",
    sellerId: "seller_1",
    rawInput: {
      title: "Leather handbag black",
      category: "Handbags",
      price: 2499,
      imageUrls: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80"]
    },
    aiGenerated: {
      title: "Classic Black Leather Shoulder Handbag for Women",
      description: "A timeless accessory crafted from textured vegan leather. Features a spacious main zippered compartment, multiple internal pockets, and sturdy shoulder handles. Polished gold-tone metallic accents add a sophisticated touch to your everyday look.",
      bulletPoints: [
        "High-grade textured Vegan Leather offering long-lasting durability",
        "Spacious main compartment with twin zippered internal divisions",
        "Elegant gold-plated hardware closures and details",
        "Fixed drop shoulder straps and removable crossbody strap"
      ],
      extractedAttributes: {
        color: "Charcoal Black",
        pattern: "Textured Solid",
        material: "Vegan PU Leather"
      },
      suggestedCategory: "Accessories",
      suggestedSubcategory: "Handbags",
      confidenceScore: 0.96
    },
    finalData: {
      title: "Classic Black Leather Shoulder Handbag for Women",
      description: "A timeless accessory crafted from textured vegan leather. Features a spacious main zippered compartment, multiple internal pockets, and sturdy shoulder handles. Polished gold-tone metallic accents add a sophisticated touch to your everyday look.",
      category: "Accessories",
      subcategory: "Handbags",
      price: 2499,
      attributes: {
        color: "Charcoal Black",
        pattern: "Textured Solid",
        material: "Vegan PU Leather"
      },
      imageUrls: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80"]
    },
    status: "needs_review",
    rejectionReason: null
  }
];

export const mockCategorySchemas = [
  {
    categoryName: "Apparel",
    requiredFields: ["title", "price", "size", "color"],
    attributeOptions: {
      size: ["XS", "S", "M", "L", "XL", "XXL"],
      material: ["Cotton", "Linen", "Polyester", "Georgette", "Silk", "Wool"],
      pattern: ["Solid", "Striped", "Floral Print", "Checked", "Plain"]
    }
  },
  {
    categoryName: "Accessories",
    requiredFields: ["title", "price", "color"],
    attributeOptions: {
      material: ["Vegan PU Leather", "Genuine Leather", "Canvas", "Nylon", "Metal"],
      color: ["Charcoal Black", "Tan Brown", "Royal Blue", "Crimson Red", "Gold", "Silver"]
    }
  }
];
