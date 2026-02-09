export async function login(email: string, pass: string) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, pass }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || data?.message || 'Login failed');
  }

  return data;
}

export function isLogged() {
  return !!localStorage.getItem('tworegi_token');
}
