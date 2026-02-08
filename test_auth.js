
async function testAuth() {
    console.log('Starting auth test v2...');
    const loginUrl = 'http://localhost:5000/api/auth/login';

    // Use the email created in previous run if possible, or new one.
    // Since I don't know the exact email, I'll register a new one.
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';

    try {
        // Register first
        await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'TestUser', email, password })
        });

        // Login
        const loginRes = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        console.log(`Login status: ${loginRes.status}`);

        // Check headers for cookies
        const setCookie = loginRes.headers.get('set-cookie');
        if (setCookie) {
            console.log('Set-Cookie header found:', setCookie);
        } else {
            console.log('No Set-Cookie header found.');
        }

        const loginData = await loginRes.json();
        console.log('Top level keys:', Object.keys(loginData));

        if (loginData.user) {
            console.log('User object keys:', Object.keys(loginData.user));
            console.log('User object dump:', JSON.stringify(loginData.user, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testAuth();
