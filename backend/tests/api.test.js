import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../app.js';
import { classifyCategory } from '../services/aiService.js';

test('GET /api/health - Health check endpoint verification', async () => {
  const response = await request(app)
    .get('/api/health')
    .expect('Content-Type', /json/)
    .expect(200);

  assert.strictEqual(response.body.status, 'healthy');
  assert.strictEqual(response.body.service, 'bulk-uploader-backend-api');
  assert.ok(response.body.timestamp);
});

test('Unit Test - classifyCategory fallback matches keywords correctly', async () => {
  // Test fallback keyword classification for "mouse"
  const mouseResult = await classifyCategory('Gaming Mouse Pro', 'High precision wireless mouse');
  assert.strictEqual(mouseResult.category, 'Electronics');
  assert.strictEqual(mouseResult.subcategory, 'Mice');
  assert.strictEqual(mouseResult.confidence, 0.98);

  // Test fallback keyword classification for "watch"
  const watchResult = await classifyCategory('Luxury Smartwatch', 'Premium leather strap watch');
  assert.strictEqual(watchResult.category, 'Accessories');
  assert.strictEqual(watchResult.subcategory, 'Watches');
  assert.strictEqual(watchResult.confidence, 0.92);
});
