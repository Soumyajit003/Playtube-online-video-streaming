import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Mail, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { GlassCard } from '../../../components/ui/GlassCard';
import useAuthStore from '../../../app/store';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, isLoading, error: authError } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full" />

      <GlassCard className="max-w-md w-full p-8 z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/20 rounded-2xl mb-4 border border-primary/20">
            <Video className="text-primary h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-text-secondary mt-2">Sign in to your Playtube account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              error={errors.email?.message}
            />
          </div>

          <div className="relative">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message}
            />
          </div>

          {authError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
              {authError}
            </div>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full py-6 text-lg">
            Sign In
          </Button>
        </form>

        <div className="mt-8 text-center text-text-secondary">
          <span>Don't have an account? </span>
          <Link to="/signup" className="text-primary hover:underline font-medium">Create one</Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default Login;
