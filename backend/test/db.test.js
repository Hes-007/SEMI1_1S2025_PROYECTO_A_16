const { testConnection } = require('../src/config/database');

describe('Database Connection', () => {
  test('should connect to the database successfully', async () => {
    const result = await testConnection();
    expect(result).toBe(true);
  });
});