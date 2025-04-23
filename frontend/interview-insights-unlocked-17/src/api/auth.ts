// src/api/auth.ts
import api from './client';

export interface Credentials { email: string; password: string; }
export interface RegisterData extends Credentials {
  username: string;
  // phone?: string; // phone removed as per previous request
}

// Response type for token endpoints
export interface TokenResponse {
    access_token: string;
    token_type: string;
}


export async function login(data: Credentials): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.append('username', data.email); // Backend expects 'username' for OAuth2 form
  body.append('password', data.password);

  const res = await api.post<TokenResponse>(
    '/auth/token',
    body.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  // Let the calling component/hook handle setting the token in localStorage
  return res.data;
}

export async function register(data: RegisterData) {
   // Backend returns User model upon successful registration
  return api.post('/auth/register', data);
}

export async function currentUser() {
  // Backend returns User model
  return api.get('/auth/me');
}

// --- ADD googleSignIn function BACK ---
export async function googleSignIn(googleToken: string): Promise<TokenResponse> {
    console.log("Sending Google ID token to backend...");
    const response = await api.post<TokenResponse>(
        '/auth/google', // The endpoint we created in the backend
        { credential: googleToken } // Send as JSON matching GoogleToken Pydantic model
    );
    // Let the calling component/hook handle setting the token in localStorage
    return response.data;
}
// --- END ADDING googleSignIn function ---

export function logout() {
  localStorage.removeItem('token');
  // Consider adding window.location.reload() or redirect logic if needed after logout
}