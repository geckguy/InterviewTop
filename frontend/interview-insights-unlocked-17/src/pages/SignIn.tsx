import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { login as loginApi } from '@/api/auth';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'; // Import Google components
import { googleSignIn as googleSignInApi } from '@/api/auth'; // Import the new backend API function

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // Loading state for Google

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth(); // Get login function from context
  const location = useLocation();

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const loginResponse = await loginApi({ email, password });
      if (loginResponse && loginResponse.access_token) {
          login(loginResponse.access_token); // Use login from auth context
          toast({ title: 'Logged in!', description: 'Welcome back.' });
          const dest = (location.state as any)?.from?.pathname || '/dashboard';
          navigate(dest, { replace: true });
      } else {
          throw new Error("Login failed: No access token received.");
      }
    } catch (err: any) {
      console.error("Email/Pass Login Error:", err);
      toast({
        title: 'Login Error',
        description: err?.response?.data?.detail ?? 'Invalid email or password.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Google Sign In Handlers ---
  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    console.log("Google Login Success:", credentialResponse);
    setIsGoogleLoading(true);
    if (!credentialResponse.credential) {
        console.error("Google credential not found in response.");
        toast({ title: "Google Sign-In Error", description: "Credential missing from Google's response.", variant: "destructive" });
        setIsGoogleLoading(false);
        return;
    }

    try {
        // Send the Google ID token (credential) to your backend
        const backendResponse = await googleSignInApi(credentialResponse.credential);

        if (backendResponse && backendResponse.access_token) {
             // Use the access token from *your* backend to log the user in
            login(backendResponse.access_token); // Use login from auth context
            toast({ title: 'Logged in with Google!', description: 'Welcome!' });
            const dest = (location.state as any)?.from?.pathname || '/dashboard';
            navigate(dest, { replace: true });
        } else {
             throw new Error("Google Sign-In failed: No access token received from backend.");
        }
    } catch (error: any) {
        console.error("Backend Google Sign-In Error:", error);
        toast({
            title: 'Google Sign-In Error',
            description: error?.response?.data?.detail ?? 'Could not sign in with Google. Please try again.',
            variant: 'destructive',
        });
    } finally {
         setIsGoogleLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    console.error("Google Login Failed");
    toast({
      title: 'Google Sign-In Error',
      description: 'Google Sign-In failed. Please try again.',
      variant: 'destructive',
    });
    setIsGoogleLoading(false); // Ensure loading state is reset
  };
  // --- End Google Sign In Handlers ---


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold text-brand-purple dark:text-[#7E69AB]">
            InterviewLog
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link to="/signup" className="font-medium text-brand-purple hover:text-brand-purple-dark dark:text-brand-purple-light dark:hover:text-brand-purple">
              create a new account
            </Link>
          </p>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Welcome back</CardTitle>
            <CardDescription className="dark:text-gray-400">Enter your credentials or sign in with Google</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Email/Password Form */}
            <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  disabled={isLoading || isGoogleLoading} 
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="dark:text-gray-200">Password</Label>
                  {/* <Link to="/forgot-password" ...>Forgot password?</Link> */}
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    disabled={isLoading || isGoogleLoading}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 dark:text-gray-300 dark:hover:bg-gray-600" 
                    onClick={() => setShowPassword(!showPassword)} 
                    aria-label={showPassword ? "Hide password" : "Show password"} 
                    disabled={isLoading || isGoogleLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => { if (typeof checked === 'boolean') { setRememberMe(checked); } }} 
                  disabled={isLoading || isGoogleLoading}
                  className="dark:border-gray-500 dark:data-[state=checked]:bg-brand-purple-light dark:data-[state=checked]:border-brand-purple-light"
                />
                <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300">Remember me</label>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white dark:bg-[#7E69AB] dark:text-white dark:hover:bg-[#6d5a95]" 
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><LogIn className="h-4 w-4" /> Sign in</span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-600"></div>
              <span className="mx-4 flex-shrink text-sm text-gray-500 dark:text-gray-400">OR</span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-600"></div>
            </div>

            {/* Google Sign In Button */}
             <div className="flex justify-center">
                {isGoogleLoading ? (
                     <Button 
                       variant="outline" 
                       className="w-full dark:border-gray-600 dark:text-gray-300" 
                       disabled
                     >
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                     </Button>
                ) : (
                     <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={handleGoogleLoginError}
                        useOneTap // Optional: Enable One Tap sign-in prompt
                        shape="pill" // Optional: Button shape
                        width="320px" // Optional: Adjust width
                        theme={isLoading ? "filled_black" : "outline"} // Use dynamic theme based on loading state
                      />
                )}
             </div>
             {/* End Google Sign In Button */}

          </CardContent>
          {/* <CardFooter> ... </CardFooter> */}
        </Card>
      </div>
    </div>
  );
};

export default SignIn;