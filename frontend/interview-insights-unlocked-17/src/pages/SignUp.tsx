// --- START OF FILE SignUp.tsx ---
// (Updated with Google Sign-In functionality)

import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Added useLocation
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Icons
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
// Import necessary auth functions
import { register as registerApi, RegisterData, googleSignIn as googleSignInApi } from "@/api/auth";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'; // Import Google components

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for email/password signup
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // Loading state for Google signup/signin

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth(); // Get login function from context for Google Sign-In
  const location = useLocation(); // Get location for redirect after Google sign-in

  // --- Email/Password Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (username.length < 3) {
      toast({ title: "Error", description: "Username must be at least 3 characters.", variant: "destructive" });
      return;
    }
     if (password.length < 8) {
       toast({ title: "Error", description: "Password must be at least 8 characters.", variant: "destructive" });
       return;
     }

    setIsLoading(true); // Start email/password loading
    setIsGoogleLoading(false); // Ensure Google loading is off

    try {
      const registerData: RegisterData = { email, password, username };
      await registerApi(registerData);

      toast({ title: "Success!", description: "Account created. Please sign in." });
      navigate("/signin"); // Redirect to sign-in after successful registration

    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || "Registration failed. Please check details.";
      toast({ title: "Registration Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false); // Stop email/password loading
    }
  };

  // --- Google Sign In/Up Handlers ---
  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
      console.log("Google Sign-Up/In Success:", credentialResponse);
      setIsGoogleLoading(true); // Start Google loading
      setIsLoading(false); // Ensure email/password loading is off

      if (!credentialResponse.credential) {
          toast({ title: "Google Sign-In Error", description: "Credential missing from Google's response.", variant: "destructive" });
          setIsGoogleLoading(false);
          return;
      }

      try {
          // Call the backend endpoint which handles both new and existing Google users
          const backendResponse = await googleSignInApi(credentialResponse.credential);

          if (backendResponse && backendResponse.access_token) {
              // Use the token from *our* backend to log the user in
              login(backendResponse.access_token);
              toast({ title: 'Signed in with Google!', description: 'Welcome!' });
              // Redirect to dashboard or the page the user intended to visit
              const dest = (location.state as any)?.from?.pathname || '/dashboard';
              navigate(dest, { replace: true });
          } else {
              throw new Error("Google Sign-In failed: No access token received from backend.");
          }
      } catch (error: any) {
          console.error("Backend Google Sign-In/Up Error:", error);
          toast({
              title: 'Google Sign-In Error',
              description: error?.response?.data?.detail ?? 'Could not sign in or sign up with Google.',
              variant: 'destructive',
          });
      } finally {
          setIsGoogleLoading(false); // Stop Google loading
      }
  };

  const handleGoogleLoginError = () => {
      console.error("Google Login Failed on Frontend");
      toast({
        title: 'Google Sign-In Error',
        description: 'The Google Sign-In process failed. Please try again.',
        variant: 'destructive',
      });
      setIsGoogleLoading(false); // Ensure loading state is reset
  };
  // --- End Google Sign In Handlers ---

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold text-brand-purple">
            InterviewInsights
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/signin" className="font-medium text-brand-purple hover:text-brand-purple-dark">
              Sign in
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Join InterviewInsights</CardTitle>
            <CardDescription>Enter details below or sign up with Google</CardDescription> {/* Updated description */}
          </CardHeader>
          <CardContent>
            {/* --- Email/Password Form --- */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div className="space-y-2">
                <Label htmlFor="username">Username*</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  disabled={isLoading || isGoogleLoading} // Disable if any loading is active
                />
                 <p className="text-xs text-gray-500">Must be at least 3 characters.</p>
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || isGoogleLoading} // Disable if any loading is active
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password*</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading || isGoogleLoading} // Disable if any loading is active
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading || isGoogleLoading} // Disable if any loading is active
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                 <p className="text-xs text-gray-500">Must be at least 8 characters.</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-brand-purple hover:bg-brand-purple-dark mt-4"
                disabled={isLoading || isGoogleLoading} // Disable if any loading is active
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </span>
                )}
              </Button>
            </form>
            {/* --- End Email/Password Form --- */}

            {/* --- Divider --- */}
            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 flex-shrink text-sm text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* --- Google Sign In/Up Button --- */}
             <div className="flex justify-center">
                {isGoogleLoading ? (
                     // Show loading state specific to Google
                     <Button variant="outline" className="w-full" disabled>
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Google Sign-In...
                     </Button>
                ) : (
                     // Show the Google Login button
                     <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={handleGoogleLoginError}
                        useOneTap // Enable One Tap prompt
                        shape="pill" // Button shape
                        width="320px" // Adjust width as needed
                        theme="outline" // Theme
                        disabled={isLoading} // Disable if email/pass form is submitting
                        context="signup" // Indicate context for Google Analytics etc.
                      />
                )}
             </div>
             {/* --- End Google Sign In/Up Button --- */}

          </CardContent>
          {/* Removed CardFooter */}
        </Card>
      </div>
    </div>
  );
};

export default SignUp;