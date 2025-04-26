# Fixing Google OAuth Authentication

## The Problem
You're experiencing the following error with Google Authentication:
```
Access blocked: Authorization Error
The OAuth client was not found.
Error 401: invalid_client
```

## Root Cause
This issue occurs because the application doesn't have a valid Google OAuth Client ID configured. The application is trying to use either:
1. An environment variable `VITE_GOOGLE_CLIENT_ID` that doesn't exist
2. The fallback value `YOUR_CLIENT_ID_FALLBACK` which is not a valid Client ID

## Solution

### 1. Create or update a Google OAuth Client ID
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen if prompted
6. For Application type, select "Web application"
7. Add authorized JavaScript origins:
   - For local development: `http://localhost:5173` (or your Vite dev server URL)
   - For production: Your actual domain
8. Add authorized redirect URIs (if needed)
9. Click "Create" and note your Client ID

### 2. Create a .env file in the frontend
Create a file named `.env` in the `frontend/interview-insights-unlocked-17` directory with the following content:
```
VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_GOOGLE_CLIENT_ID
```
Replace `YOUR_ACTUAL_GOOGLE_CLIENT_ID` with the Client ID you obtained from Google Cloud Console.

### 3. Update the backend configuration (if needed)
Make sure the backend has the same Client ID configured:
```
# In backend/.env or through your environment variables
GOOGLE_CLIENT_ID=YOUR_ACTUAL_GOOGLE_CLIENT_ID
```

### 4. Restart your application
After setting up the environment variables, restart both your frontend and backend servers.

## Additional Troubleshooting
- Check that your Google Cloud project has the "Google+ API" or "Google People API" enabled
- Verify that your OAuth consent screen is properly configured
- Make sure your application isn't running in an incognito window or with privacy blockers that could interfere with OAuth
- Check the browser console for additional error messages 