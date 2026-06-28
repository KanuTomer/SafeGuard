const DEFAULT_BASE_URL = 'https://safeguard-bi4x.onrender.com';

const cliArgs = process.argv.slice(2);
const cliBaseUrl = cliArgs.find((arg) => !arg.startsWith('--'));
const baseUrl = (process.env.SAFEGUARD_API_URL || cliBaseUrl || DEFAULT_BASE_URL).replace(
  /\/$/,
  ''
);
const includeEvidenceUpload =
  process.env.SAFEGUARD_SMOKE_UPLOAD_EVIDENCE === 'true' || cliArgs.includes('--include-evidence');

const uniqueValue = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const testUser = {
  name: 'SafeGuard Smoke Test',
  email: `smoke-${uniqueValue}@example.com`,
  password: 'Password123',
};

const state = {
  emergencyId: null,
  token: null,
};

const requestJson = async (method, path, body, token) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  let payload;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || response.statusText || 'Request failed';
    throw new Error(`${method} ${path} failed with ${response.status}: ${message}`);
  }

  return payload;
};

const requestMultipart = async (method, path, formData, token) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  let payload;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || response.statusText || 'Request failed';
    throw new Error(`${method} ${path} failed with ${response.status}: ${message}`);
  }

  return payload;
};

const runStep = async (label, action) => {
  process.stdout.write(`- ${label}... `);
  const result = await action();
  console.log('ok');
  return result;
};

const runSmokeTest = async () => {
  console.log(`SafeGuard deployment smoke test: ${baseUrl}`);

  await runStep('Health endpoint responds', async () => {
    const response = await requestJson('GET', '/api/health');

    if (!response.success || response.data?.status !== 'ok') {
      throw new Error('Health response did not include expected status');
    }
  });

  await runStep('Registers a unique test user', async () => {
    const response = await requestJson('POST', '/api/auth/register', testUser);
    state.token = response.data?.token;

    if (!state.token) {
      throw new Error('Register response did not include a JWT');
    }
  });

  await runStep('Reads the protected current-user endpoint', async () => {
    const response = await requestJson('GET', '/api/auth/me', null, state.token);

    if (response.data?.user?.email !== testUser.email) {
      throw new Error('Current user response did not match the smoke test user');
    }
  });

  await runStep('Creates an emergency session', async () => {
    const response = await requestJson(
      'POST',
      '/api/emergencies',
      {
        initialLocation: {
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 25,
          timestamp: new Date().toISOString(),
        },
      },
      state.token
    );

    state.emergencyId = response.data?.emergency?.id;

    if (!state.emergencyId) {
      throw new Error('Emergency response did not include an id');
    }
  });

  await runStep('Adds a location point', async () => {
    const response = await requestJson(
      'POST',
      `/api/emergencies/${state.emergencyId}/locations`,
      {
        latitude: 28.6145,
        longitude: 77.2101,
        accuracy: 18,
        recordedAt: new Date().toISOString(),
      },
      state.token
    );

    if (!response.data?.location?.id) {
      throw new Error('Location response did not include an id');
    }
  });

  if (includeEvidenceUpload) {
    await runStep('Uploads image evidence to Cloudinary', async () => {
      const tinyPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
        'base64'
      );
      const formData = new FormData();
      formData.append('notes', 'Deployment smoke test evidence');
      formData.append('file', new Blob([tinyPng], { type: 'image/png' }), 'smoke-test.png');

      const response = await requestMultipart(
        'POST',
        `/api/emergencies/${state.emergencyId}/evidence`,
        formData,
        state.token
      );

      if (!response.data?.evidence?.cloudinaryPublicId) {
        throw new Error('Evidence response did not include a Cloudinary public id');
      }
    });
  }

  await runStep('Ends the emergency session', async () => {
    const response = await requestJson(
      'PATCH',
      `/api/emergencies/${state.emergencyId}/end`,
      null,
      state.token
    );

    if (response.data?.emergency?.status !== 'ended') {
      throw new Error('Emergency was not marked ended');
    }
  });

  console.log(`Smoke test passed for ${testUser.email}`);

  if (!includeEvidenceUpload) {
    console.log('Evidence upload skipped. Add --include-evidence to test Cloudinary.');
  }
};

runSmokeTest().catch((error) => {
  console.error(`Smoke test failed: ${error.message}`);
  process.exit(1);
});
