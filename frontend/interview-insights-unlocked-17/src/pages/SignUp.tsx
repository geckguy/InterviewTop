import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// Removed Checkbox import
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { register as registerApi, RegisterData } from "@/api/auth";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Removed confirmPassword state
  // const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  // Removed acceptTerms state
  // const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Removed password match check
    // if (password !== confirmPassword) { ... }

    // Removed terms acceptance check
    // if (!acceptTerms) { ... }

    // Basic validation (keep these or add more as needed)
    if (username.length < 3) {
      toast({
        title: "Error",
        description: "Username must be at least 3 characters long.",
        variant: "destructive",
      });
      return;
    }
     if (password.length < 8) {
       toast({
         title: "Error",
         description: "Password must be at least 8 characters long.",
         variant: "destructive",
       });
       return;
     }


    setIsLoading(true);

    try {
      const registerData: RegisterData = {
        email,
        password,
        username,
      };
      await registerApi(registerData);

      toast({
        title: "Success!",
        description: "Your account has been created. Please sign in.",
      });
      navigate("/signin");

    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || "Registration failed. Please check your details and try again.";
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
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
            <CardDescription>Share and explore interview experiences</CardDescription>
          </CardHeader>
          <CardContent>
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
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                 <p className="text-xs text-gray-500">Must be at least 8 characters.</p>
              </div>

              {/* --- REMOVED Confirm Password --- */}
              {/*
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password*</Label>
                ... Input ...
              </div>
              */}

              {/* --- REMOVED Terms acceptance --- */}
              {/*
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="terms" ... />
                <label htmlFor="terms" ...> ... </label>
              </div>
              */}

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-brand-purple hover:bg-brand-purple-dark mt-4" disabled={isLoading}>
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
          </CardContent>
          {/* --- REMOVED Footer with terms links --- */}
           {/*
          <CardFooter className="flex justify-center mt-2">
             <p className="text-xs text-gray-500 text-center"> ... </p>
          </CardFooter>
           */}
        </Card>
      </div>
    </div>
  );
};

export default SignUp;