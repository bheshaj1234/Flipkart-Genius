import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

test('Excel Parsing Unit Test - xlsx workbook to JSON and CSV conversion', async () => {
  const sampleProducts = [
    { title: 'Wireless Ergonomic Keyboard', price: 2999, category: 'Electronics', imageUrls: 'https://example.com/k1.jpg' },
    { title: 'Cotton Summer T-Shirt', price: 799, category: 'Apparel', imageUrls: 'https://example.com/t1.jpg' }
  ];

  // Create an Excel workbook in memory
  const worksheet = XLSX.utils.json_to_sheet(sampleProducts);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Catalog');

  // Save to temporary test file
  const tempExcelPath = path.join(process.cwd(), 'temp_test_catalog.xlsx');
  XLSX.writeFile(workbook, tempExcelPath);

  assert.ok(fs.existsSync(tempExcelPath), 'Temp Excel file should exist');

  // Read workbook back and verify rows
  const readWorkbook = XLSX.readFile(tempExcelPath);
  const sheetName = readWorkbook.SheetNames[0];
  assert.strictEqual(sheetName, 'Catalog');

  const parsedRows = XLSX.utils.sheet_to_json(readWorkbook.Sheets[sheetName]);
  assert.strictEqual(parsedRows.length, 2);
  assert.strictEqual(parsedRows[0].title, 'Wireless Ergonomic Keyboard');
  assert.strictEqual(parsedRows[0].price, 2999);
  assert.strictEqual(parsedRows[1].title, 'Cotton Summer T-Shirt');

  // Verify CSV output conversion
  const csvString = XLSX.utils.sheet_to_csv(readWorkbook.Sheets[sheetName]);
  assert.ok(csvString.includes('Wireless Ergonomic Keyboard'));
  assert.ok(csvString.includes('Cotton Summer T-Shirt'));

  // Clean up
  if (fs.existsSync(tempExcelPath)) {
    fs.unlinkSync(tempExcelPath);
  }
});
