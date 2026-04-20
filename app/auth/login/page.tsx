'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BookOpen, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input, Label, Spinner } from '@/components/ui/index';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.push('/');
    } catch (e: any) {
      toast.error(e.message || 'Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm space-y-6"
      >
        {/* Logo & Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20"
            >
              <BookOpen className="h-6 w-6 text-primary" />
            </motion.div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-1">Please enter your details to sign in</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  {...register('email')} 
                  id="email"
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10 h-11 focus-visible:ring-primary" 
                />
              </div>
              {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  {...register('password')} 
                  id="password"
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  className="pl-10 pr-10 h-11 focus-visible:ring-primary" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-medium text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 gap-2 shadow-lg shadow-primary/20 mt-2">
              {isLoading ? <Spinner className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline font-bold">
              Register now
            </Link>
          </div>
        </div>

        {/* Demo Credentials Hint */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg border border-border bg-secondary/30 p-3 text-center"
        >
          <p className="text-[11px] text-muted-foreground font-mono">
            <span className="text-primary font-bold">Admin Demo:</span> admin@platform.com / password
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}