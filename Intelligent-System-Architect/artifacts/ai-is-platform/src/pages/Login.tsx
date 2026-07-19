import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuthLogin } from '@workspace/api-client-react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Brain, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [, navigate] = useLocation();
  const { refetch } = useAuth();
  const { mutate: login, isPending } = useAuthLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    login(
      { data: { email, password } },
      {
        onSuccess: () => {
          refetch();
          navigate('/ml-playground');
        },
        onError: (err: any) => {
          setErrorMsg(err.data?.error ?? 'Invalid email or password');
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden relative">
      {/* Abstract Background - Left Half */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-card/30 border-r border-border/50 items-center justify-center">
        <div className="absolute inset-0 bg-background/50 z-10 backdrop-blur-[100px]" />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/40 blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -80, 0], y: [0, 100, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-accent/30 blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-900/40 blur-[150px]" 
        />
        
        <div className="z-20 p-12 text-center max-w-lg">
          <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/50 mx-auto mb-8">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">AI-IS Platform</h2>
          <p className="text-muted-foreground text-lg">
            Secure access to advanced machine learning models and dataset analysis tools.
          </p>
        </div>
      </div>

      {/* Login Form - Right Half */}
      <div className="flex-1 flex items-center justify-center p-8 z-10 relative">
        <div className="w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 rounded-2xl">
          <div className="text-center">
            <div className="md:hidden w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50 mx-auto mb-6">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your research account</p>
          </div>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/30 text-destructive-foreground p-3 rounded-lg flex items-center gap-2 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-input border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-mono text-sm"
                    placeholder="researcher@institute.edu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="password">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 bg-input border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-mono text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || !email || !password}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
