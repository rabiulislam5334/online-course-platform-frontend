'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  BookOpen, User, Mail, Lock, CheckCircle, 
  GraduationCap, PenTool, Eye, EyeOff, ArrowRight 
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input, Label, Spinner } from '@/components/ui';
// import { Input, Label, Spinner } from '@/components/ui/index';

const schema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Student', 'Instructor']),
});

type RegisterFormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'Student' },
  });

  const role = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      await api.post('/auth/register', data);
      setDone(true);
      toast.success('Registration request sent!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Success State View
  if (done) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-2xl"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Registration Submitted!</h2>
        <p className="text-muted-foreground mb-8">
          Thank you for joining <span className="text-primary font-semibold">Skillora</span>. 
          Your account is pending admin approval. You will be notified once you can sign in.
        </p>
        <Button asChild size="lg" className="w-full">
          <Link href="/auth/login">Back to Login</Link>
        </Button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Join the Skillora learning community</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Picker */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Join as a</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'Student', icon: <GraduationCap className="h-4 w-4" /> },
                  { value: 'Instructor', icon: <PenTool className="h-4 w-4" /> },
                ].map(({ value, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('role', value as 'Student' | 'Instructor')}
                    className={`flex items-center justify-center gap-2 rounded-xl border h-11 text-sm font-semibold transition-all ${
                      role === value
                        ? 'border-primary bg-primary/10 text-primary shadow-inner shadow-primary/5'
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {icon} {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input {...register('full_name')} id="full_name" placeholder="John Doe" className="pl-10 h-11 focus-visible:ring-primary" />
              </div>
              {errors.full_name && <p className="text-[10px] font-medium text-destructive">{errors.full_name.message}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input {...register('email')} id="email" type="email" placeholder="you@example.com" className="pl-10 h-11 focus-visible:ring-primary" />
              </div>
              {errors.email && <p className="text-[10px] font-medium text-destructive">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  {...register('password')} 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Min 6 characters" 
                  className="pl-10 pr-10 h-11 focus-visible:ring-primary" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] font-medium text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 gap-2 shadow-lg shadow-primary/20 mt-2">
              {loading ? <Spinner className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? 'Registering...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-bold">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}