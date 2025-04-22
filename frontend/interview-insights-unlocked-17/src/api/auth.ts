import api from './client';

export interface Credentials { email: string; password: string; }
export interface RegisterData extends Credentials {
  username: string; phone?: string;
}

export async function login(data: Credentials) {
  const body = new URLSearchParams();
  body.append('username', data.email);
  body.append('password', data.password);

  const res = await api.post(
    '/auth/token',
    body.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  localStorage.setItem('token', res.data.access_token);
  return res.data;
}

export async function register(data: RegisterData) {
  return api.post('/auth/register', data);
}

export async function currentUser() {
  return api.get('/auth/me');
}

export function logout() {
  localStorage.removeItem('token');
}
