import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { BrandIcon } from '@/components/BrandIcon';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long');

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    try {
      emailSchema.parse(formData.email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(formData.password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }
    
    if (!isLogin && formData.fullName) {
      try {
        nameSchema.parse(formData.fullName);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.fullName = e.errors[0].message;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in.');
            setIsLogin(true);
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome to BetterMe! 🎉');
          navigate('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-info/10 blur-3xl -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-info mb-6 shadow-2xl relative group"
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-info opacity-0 group-hover:opacity-20 blur-lg transition-opacity"
            />
            <BrandIcon className="w-12 h-12 relative z-10" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary via-primary/80 to-info bg-clip-text text-transparent mb-2">BetterMe</h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {isLogin ? '🎯 Welcome back! Ready to continue your journey?' : '🚀 Start improving yourself today.'}
          </p>
        </motion.div>

        {/* Auth Form */}
        <motion.div 
          className="glass rounded-3xl p-7 sm:p-8 border border-primary/10 shadow-2xl backdrop-blur-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                    Full Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange('fullName')}
                      className={`pl-12 h-12 rounded-xl bg-secondary/40 border-2 border-secondary/60 hover:border-secondary/80 focus:border-primary focus:bg-secondary/60 transition-all duration-200 font-medium ${
                        errors.fullName ? 'border-destructive focus:border-destructive' : ''
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <motion.p 
                      className="text-xs text-destructive flex items-center gap-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      ✕ {errors.fullName}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange('email')}
                  className={`pl-12 h-12 rounded-xl bg-secondary/40 border-2 border-secondary/60 hover:border-secondary/80 focus:border-primary focus:bg-secondary/60 transition-all duration-200 font-medium ${
                    errors.email ? 'border-destructive focus:border-destructive' : ''
                  }`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <motion.p 
                  className="text-xs text-destructive flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ✕ {errors.email}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange('password')}
                  className={`pl-12 pr-12 h-12 rounded-xl bg-secondary/40 border-2 border-secondary/60 hover:border-secondary/80 focus:border-primary focus:bg-secondary/60 transition-all duration-200 font-medium ${
                    errors.password ? 'border-destructive focus:border-destructive' : ''
                  }`}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground group-focus-within:text-primary transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>
              {errors.password && (
                <motion.p 
                  className="text-xs text-destructive flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ✕ {errors.password}
                </motion.p>
              )}
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full h-12 gap-2 text-sm font-semibold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 bg-gradient-to-r from-primary to-info hover:from-primary/90 hover:to-info/90"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <div className="mt-6 pt-5 border-t border-border/30">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-all duration-200 py-2 rounded-lg hover:bg-secondary/50"
            >
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <motion.span 
                    className="text-primary font-semibold"
                    whileHover={{ x: 2 }}
                  >
                    Sign up
                  </motion.span>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <motion.span 
                    className="text-primary font-semibold"
                    whileHover={{ x: 2 }}
                  >
                    Sign in
                  </motion.span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p 
          className="text-center text-xs text-muted-foreground mt-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          ✨ By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Auth;
