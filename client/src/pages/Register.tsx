import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError } from '../redux/slices/authSlice';
import type { AppDispatch, RootState } from '../redux/store';
import { getPostAuthRedirect } from '../lib/authRedirect';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { ShieldCheck } from 'lucide-react';
import type { IRegister } from '../types/user.types';

export function Register() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getPostAuthRedirect(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    dispatch(clearAuthError());
    const registration: IRegister = {
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      confirmPassword,
    };
    const result = await dispatch(registerUser(registration));
    if (registerUser.fulfilled.match(result)) {
      navigate(getPostAuthRedirect(result.payload.user));
    }
  };

  return (
    <PageTransition>
      <div className="container px-4 py-8 min-h-[80vh] flex flex-col justify-center max-w-screen-xl mx-auto">
        <div className="w-full max-w-md mx-auto flex flex-col items-center relative">
          <form
            onSubmit={handleRegister}
            className="w-full bg-card border rounded-xl shadow-lg p-6 sm:p-8 z-10 relative mt-4"
          >
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-6 w-6 bg-blue-600 rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-sm leading-none">
                    N
                  </span>
                </div>
                <span className="font-bold text-xl text-blue-600">
                  Sheger Gebeya
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-2">Create an account</h1>
              <p className="text-sm text-muted-foreground text-center">
                Join thousands of shoppers for a premium experience.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            {formError && (
              <div
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V15.33H7.898v-3.33h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.876h2.773l-.443 3.33h-2.33v6.549C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                Apple
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Separator className="flex-1" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Or continue with email
              </span>
              <Separator className="flex-1" />
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-left">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </span>
                  <Input
                    name="fullName"
                    autoComplete="name"
                    className="pl-9"
                    placeholder="Alex Johnson"
                    required
                    minLength={5}
                    maxLength={50}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-left">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <Input
                    name="email"
                    autoComplete="email"
                    type="email"
                    className="pl-9"
                    placeholder="alex@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-left">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </span>
                  <Input
                    name="password"
                    autoComplete="new-password"
                    type="password"
                    className="pl-9"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-left">
                    Confirm Password
                  </label>
                  <Input
                    name="confirmPassword"
                    autoComplete="new-password"
                    type="password"
                    placeholder="Re-enter your password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Must be at least 8 characters with a mix of letters, numbers,
                  and symbols.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 mb-6 bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 text-left">
              <input
                type="checkbox"
                id="newsletter"
                className="rounded border-blue-300 dark:border-blue-700 mt-1"
                defaultChecked
              />
              <label htmlFor="newsletter" className="text-sm">
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  Subscribe to our newsletter
                </span>
                <span className="block text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                  Get early access to drops, exclusive discounts, and fashion
                  inspiration.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base shadow-md"
            >
              {isLoading ? "Creating Account..." : "Create Account"}{" "}
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Button>

            <div className="mt-6 text-center text-sm border-t pt-6">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:underline"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground text-center">
              <ShieldCheck className="h-3 w-3" /> Your data is protected by
              industry-standard encryption.
            </div>
          </form>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-50 dark:from-blue-900/20 to-transparent -z-10 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="mt-12 text-center text-xs text-muted-foreground max-w-sm mx-auto flex justify-between items-center w-full max-w-md">
          <p>
            By creating an account, you agree to Nexa
            <br />
            <a href="#" className="underline hover:text-foreground">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>
            .
          </p>
          <div className="border px-3 py-1 rounded-full flex items-center bg-card shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></span>{" "}
            SECURE CONNECTION
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
