import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Upload, User, Mail, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { GlassCard } from '../../../components/ui/GlassCard';
import useAuthStore from '../../../app/store';

const Signup = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { register: registerUser, isLoading, error: authError } = useAuthStore();
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('fullname', data.fullname);
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    if (data.avatar[0]) formData.append('avatar', data.avatar[0]);
    if (data.coverImage?.[0]) formData.append('coverImage', data.coverImage[0]);

    const result = await registerUser(formData);
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full" />

      <GlassCard className="max-w-lg w-full p-8 z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-secondary/20 rounded-2xl mb-4 border border-secondary/20">
            <Video className="text-secondary h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-text-secondary mt-2">Join the Playtube community today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Cover Image Upload */}
          <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10 bg-white/5 mb-4 group">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
                Add Channel Cover
              </div>
            )}
            <label 
              htmlFor="cover-upload" 
              className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="text-xs bg-primary px-3 py-1 rounded-full text-white font-medium flex items-center gap-2">
                <Upload size={12} /> Change Cover
              </span>
              <input 
                id="cover-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                {...register('coverImage', { 
                  onChange: handleCoverChange
                })} 
              />
            </label>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary transition-all bg-white/5">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-text-secondary">
                    <User size={40} />
                  </div>
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-primary p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform"
              >
                <Upload size={14} className="text-white" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  {...register('avatar', { 
                    required: 'Avatar is required',
                    onChange: handleAvatarChange
                  })} 
                />
              </label>
            </div>
            {errors.avatar && <p className="text-xs text-red-500 mt-2">{errors.avatar.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              {...register('fullname', { required: 'Full name is required' })}
              error={errors.fullname?.message}
            />
            <Input
              label="Username"
              placeholder="johndoe123"
              {...register('username', { required: 'Username is required' })}
              error={errors.username?.message}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            error={errors.password?.message}
          />

          {authError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
              {authError}
            </div>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full py-6 text-lg">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-text-secondary">
          <span>Already have an account? </span>
          <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default Signup;
