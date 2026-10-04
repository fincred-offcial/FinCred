/**
 * FinCred Production Smoke Test Suite
 * Verifies all critical API endpoints, authentication flows, security guards,
 * and JSON safety guarantees before deployment.
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

async function runSmokeTests() {
  console.log(`\n🚀 Starting FinCred Production Smoke Tests against ${BASE_URL}...\n`);
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      process.stdout.write(`Testing: ${name}... `);
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err: any) {
      console.log(`❌ FAIL: ${err.message}`);
      failed++;
    }
  }

  // 1. Health Check
  await test('GET /api/health returns healthy JSON', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || data.status !== 'ok') throw new Error(`Unexpected payload: ${JSON.stringify(data)}`);
  });

  // 2. Check Mobile
  await test('POST /api/auth/check-mobile responds with JSON', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/check-mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber: '9876543210' })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (typeof data.isRegistered !== 'boolean') throw new Error('Missing isRegistered boolean');
  });

  // 3. Customer Mobile Continue
  let customerToken = '';
  await test('POST /api/customer/continue handles Indian mobile', async () => {
    const res = await fetch(`${BASE_URL}/api/customer/continue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543210' })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.data?.mobile) throw new Error('Invalid continue response');
  });

  // 4. Invalid Mobile Number validation
  await test('POST /api/customer/continue rejects invalid numbers with JSON 400', async () => {
    const res = await fetch(`${BASE_URL}/api/customer/continue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '123' })
    });
    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false || data.error?.code !== 'INVALID_REQUEST') {
      throw new Error(`Unexpected error format: ${JSON.stringify(data)}`);
    }
  });

  // 5. Customer OTP Verification
  await test('POST /api/auth/verify-otp authenticates and returns signed token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber: '9876543210', otp: '123456' })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.token) throw new Error('Missing customer token');
    customerToken = data.token;
  });

  // 6. Customer Profile with Auth Token
  await test('GET /api/customer/profile with token returns profile data', async () => {
    const res = await fetch(`${BASE_URL}/api/customer/profile`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.data?.fullName) throw new Error('Missing customer profile');
  });

  // 7. Customer Profile without Auth Token
  await test('GET /api/customer/profile without token returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/customer/profile`);
    if (res.status !== 401) throw new Error(`Expected status 401, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error('Expected success: false');
  });

  // 8. Admin Login (Success)
  let adminToken = '';
  await test('POST /api/admin/login authenticates valid credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'FIN-CRED', password: 'Goluyadav@1' })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.token) throw new Error('Missing admin token');
    adminToken = data.token;
  });

  // 9. Admin Login (Failure)
  await test('POST /api/admin/login rejects invalid credentials with 401 JSON', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'FIN-CRED', password: 'WrongPassword' })
    });
    if (res.status !== 401) throw new Error(`Expected status 401, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false || data.error?.code !== 'INVALID_CREDENTIALS') {
      throw new Error(`Unexpected error format: ${JSON.stringify(data)}`);
    }
  });

  // 10. Admin Data with Auth Token
  await test('GET /api/admin/data with admin token returns statistics and leads', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/data`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.data?.stats) throw new Error('Missing admin stats in payload');
  });

  // 11. Admin Data without Auth Token
  await test('GET /api/admin/data without token returns 401 JSON', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/data`);
    if (res.status !== 401) throw new Error(`Expected status 401, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error('Expected success: false');
  });

  // 12. Unknown Route JSON 404
  await test('GET /api/unknown-endpoint returns JSON 404 with code API_NOT_FOUND', async () => {
    const res = await fetch(`${BASE_URL}/api/unknown-endpoint`);
    if (res.status !== 404) throw new Error(`Expected status 404, got ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) throw new Error('Content-Type is not application/json');
    const data = await res.json();
    if (data.success !== false || data.error?.code !== 'API_NOT_FOUND') {
      throw new Error(`Unexpected error payload: ${JSON.stringify(data)}`);
    }
  });

  console.log(`\n==============================================`);
  console.log(`Smoke Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`==============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSmokeTests().catch(err => {
  console.error('Fatal smoke test runner error:', err);
  process.exit(1);
});
