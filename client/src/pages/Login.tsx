import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/slices/authSlice';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, ShieldCheck, Lock, Globe } from 'lucide-react';

export function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginSuccess({
      id: '123',
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
    }));
    navigate('/');
  };

  return (
    <PageTransition>
      <div className="container px-4 py-8 min-h-[80vh] flex flex-col justify-center max-w-screen-xl mx-auto">
        <Link to="/" className="absolute top-24 left-8 flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to store
        </Link>
        
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-6">
            <div className="h-8 w-8 bg-blue-600 rounded-sm flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg leading-none">N</span>
            </div>
            <span className="font-bold text-2xl text-blue-600">Nexa Commerce</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground mb-8 text-center">Please enter your details to sign in to your account.</p>

          <form onSubmit={handleLogin} className="w-full bg-card border rounded-xl shadow-sm p-6 sm:p-8">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button type="button" variant="outline" className="w-full">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/></svg>
                Google
              </Button>
              <Button type="button" variant="outline" className="w-full">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V15.33H7.898v-3.33h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.876h2.773l-.443 3.33h-2.33v6.549C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
                Apple
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Or continue with email</span>
              <Separator className="flex-1" />
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-left">Email Address</label>
                <Input type="email" placeholder="name@company.com" required />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium">Password</label>
                  <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Input type="password" placeholder="••••••••" required />
                  <button type="button" className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6 text-left">
              <input type="checkbox" id="keep" className="rounded border-gray-300" />
              <label htmlFor="keep" className="text-sm">Keep me signed in for 30 days</label>
            </div>

            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base shadow-md">
              Sign In
            </Button>
            
            <div className="mt-6 text-center text-sm border-t pt-6">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="font-semibold text-blue-600 hover:underline">Create account</Link>
            </div>
          </form>
          
          <div className="mt-8 flex gap-6 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <span className="flex items-center"><ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Trusted</span>
            <span className="flex items-center"><Lock className="mr-1.5 h-3.5 w-3.5" /> Secure</span>
            <span className="flex items-center"><Globe className="mr-1.5 h-3.5 w-3.5" /> Global</span>
          </div>
          
          <p className="mt-8 text-xs text-muted-foreground text-center max-w-xs">
            By signing in, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
