/**
 * This is a mock implementation of the @react-oauth/google package
 * to allow the application to run without actually installing the package.
 */

// Mock credential response type
export interface CredentialResponse {
  credential?: string;
  select_by?: string;
}

// Mock Google login component
export const GoogleLogin = (props: any) => {
  console.warn('GoogleLogin component is mocked and will not actually function');
  return null; // Return nothing when rendered
};

// Mock GoogleOAuthProvider
export const GoogleOAuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.warn('GoogleOAuthProvider is mocked and will not actually function');
  return children; // Just render the children without any actual OAuth functionality
};

// Add any other exports that might be used from the package
export const useGoogleLogin = () => {
  console.warn('useGoogleLogin hook is mocked and will not actually function');
  return () => console.warn('Mock Google login function called');
};

export const googleLogout = () => {
  console.warn('googleLogout function is mocked and will not actually function');
};

export const useGoogleOneTapLogin = () => {
  console.warn('useGoogleOneTapLogin hook is mocked and will not actually function');
  return { error: null, loading: false };
}; 