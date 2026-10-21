// Uses native Node fetch

async function verifyAuth() {
  const baseUrl = 'http://localhost:5000/api/auth/login';

  const testCredentials = [
    {
      description: 'Eshwar valid login',
      email: 'cheshwar4400@gmail.com',
      password: 'Eshwar@4400',
      expectedStatus: 200,
    },
    {
      description: 'Hari valid login',
      email: 'hari@sayfix.com',
      password: 'Hari@7898',
      expectedStatus: 200,
    },
    {
      description: 'Teja Naidu valid login',
      email: 'gtejanaidu.info@gmail.com',
      password: 'Teja@4858#%',
      expectedStatus: 200,
    },
    {
      description: 'Old admin rejected',
      email: 'admin@flexio.internal',
      password: 'AdminPass123!',
      expectedStatus: 401,
    },
    {
      description: 'Wrong password rejected',
      email: 'cheshwar4400@gmail.com',
      password: 'WrongPassword!',
      expectedStatus: 401,
    },
  ];

  console.log('Testing authentication against backend...');

  for (const tc of testCredentials) {
    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tc.email, password: tc.password }),
      });

      const data = await res.json() as any;
      const passed = res.status === tc.expectedStatus;
      console.log(
        `[${passed ? 'PASS' : 'FAIL'}] ${tc.description} (${tc.email}): HTTP ${res.status} - ${data.message || (data.token ? 'JWT token generated' : 'OK')}`
      );
    } catch (err) {
      console.error(`Error testing ${tc.email}:`, err);
    }
  }
}

verifyAuth();
