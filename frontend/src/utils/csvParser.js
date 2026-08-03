import Papa from 'papaparse';

/**
 * Validates a single product row parsed from CSV.
 * Returns { isValid: boolean, errors: string[], data: object }
 */
export const validateProductRow = (row, rowIndex) => {
  const errors = [];
  
  // Clean values from whitespace
  const title = row.title?.trim() || row.Title?.trim();
  const priceRaw = row.price || row.Price;
  const category = row.category?.trim() || row.Category?.trim();
  const imageUrlsRaw = row.imageUrls || row.image_urls || row.image || row.Image;

  // 1. Title Validation
  if (!title) {
    errors.push('Title is a required field.');
  } else if (title.length < 5) {
    errors.push('Title is too short (minimum 5 characters).');
  }

  // 2. Price Validation
  const price = Number(priceRaw);
  if (priceRaw === undefined || priceRaw === '') {
    errors.push('Price is a required field.');
  } else if (isNaN(price)) {
    errors.push('Price must be a valid number.');
  } else if (price <= 0) {
    errors.push('Price must be greater than zero.');
  }

  // 3. Category Validation
  if (!category) {
    errors.push('Category is a required field.');
  }

  // 4. Image Validation (Soft warning - won't fail validation, but flags warning)
  const warnings = [];
  if (!imageUrlsRaw || imageUrlsRaw.trim() === '') {
    warnings.push('No product image link specified. Vision extraction will be skipped.');
  }

  return {
    rowIndex,
    isValid: errors.length === 0,
    errors,
    warnings,
    data: {
      title: title || '',
      price: isNaN(price) ? 0 : price,
      category: category || '',
      imageUrls: imageUrlsRaw ? imageUrlsRaw.split(',').map(url => url.trim()).filter(Boolean) : []
    }
  };
};

/**
 * Parses a CSV file using Papaparse and validates each row.
 * Returns a Promise resolving to { parsedData: Array, summary: Object }
 */
export const parseAndValidateCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV Parse Error: ${results.errors[0].message}`));
          return;
        }

        const rows = results.data;
        const validatedRows = rows.map((row, index) => validateProductRow(row, index + 1));

        const totalRows = validatedRows.length;
        const validRows = validatedRows.filter(r => r.isValid);
        const invalidRows = validatedRows.filter(r => !r.isValid);

        resolve({
          rows: validatedRows,
          summary: {
            totalRows,
            validCount: validRows.length,
            invalidCount: invalidRows.length,
            hasErrors: invalidRows.length > 0
          }
        });
      },
      error: (err) => {
        reject(err);
      }
    });
  });
};
