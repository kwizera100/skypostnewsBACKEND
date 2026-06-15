// End-to-end HTTP login test against the local backend.
const EMAIL = 'admin@iremee.com';
const PASSWORD = 'SkyPost@Admin2026';

(async () => {
  const res = await fetch('http://127.0.0.1:5055/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const text = await res.text();
  console.log('HTTP', res.status);
  console.log(text.slice(0, 200));
})();
