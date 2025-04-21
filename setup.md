
# Authentication System Guide

## Setup

1. **Clone the repository**

2. **Set up the environment variables**:
   Create a `.env` file in the backend directory with:
   ```
   # Authentication
   SECRET_KEY=your_secret_key_here
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # Database
   MONGO_URL=your_mongodb_url
   ```

3. **Create and activate virtual environment**:
   ```
   cd backend
   uv venv
   source .venv/bin/activate
   ```

4. **Install dependencies**:
   ```
   uv pip install fastapi motor "python-jose[cryptography]" "passlib[bcrypt]" python-multipart "pydantic[email]" python-dotenv uvicorn
   ```

5. **Run the server**:
   ```
   uvicorn main:app --reload
   ```

## API Usage

### 1. Registration
Register a new user with:

```
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "password123",
    "phone": "1234567890"
  }'
```

Response:
```
{
  "email": "user@example.com",
  "username": "username",
  "phone": "1234567890",
  "id": "generated_id_here"
}
```

### 2. Login
Get an authentication token with:

```
curl -X POST "http://localhost:8000/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password123"
```

Response:
```
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Accessing Protected Routes
Include the token in the Authorization header:

```
curl -X GET "http://localhost:8000/any-protected-route" \
  -H "Authorization: Bearer your_token_here"
```

For example, to get your user info:
```
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer your_token_here"
```

### 4. Using in Frontend Applications

In JavaScript/React applications:
```
// Registration
async function registerUser(userData) {
  const response = await fetch('http://localhost:8000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return await response.json();
}

// Login
async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await fetch('http://localhost:8000/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData
  });
  return await response.json();
}

// Using the token for protected routes
async function fetchProtectedResource(token) {
  const response = await fetch('http://localhost:8000/protected-route', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}
```

All routes in the API require authentication except for:
- `/` (welcome message)
- `/auth/register` (user registration)  
- `/auth/token` (login)
