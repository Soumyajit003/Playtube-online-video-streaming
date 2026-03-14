import React, { useState, useRef } from 'react';
import { X, Camera, Lock, User, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import axiosInstance from '../../../services/axiosInstance';
import toast from 'react-hot-toast';

const EditProfileModal = ({ isOpen, onClose, channel, onUpdateSuccess }) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(channel?.fullname || '');
  const [avatarObj, setAvatarObj] = useState({ file: null, preview: channel?.avatar });
  const [coverObj, setCoverObj] = useState({ file: null, preview: channel?.coverImage });

  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      if (type === 'avatar') {
        setAvatarObj({ file, preview });
      } else {
        setCoverObj({ file, preview });
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let isSuccess = true;

    try {
      // 1. Update Full Name if changed
      if (fullName !== channel.fullname) {
        await axiosInstance.patch('/users/update-account', { fullName });
      }

      // 2. Update Avatar if changed
      if (avatarObj.file) {
        const formData = new FormData();
        formData.append('avatar', avatarObj.file);
        await axiosInstance.patch('/users/update-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // 3. Update Cover Image if changed
      if (coverObj.file) {
        const formData = new FormData();
        formData.append('coverImage', coverObj.file);
        await axiosInstance.patch('/users/update-cover', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Profile updated successfully!');
      onUpdateSuccess(); // Trigger refresh on parent
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
      isSuccess = false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axiosInstance.post('/users/change-password', {
        oldPassword,
        newPassword
      });
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 border-b border-white/10 gap-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'profile' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-white'}`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'password' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-white'}`}
          >
            Password
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'profile' ? (
            <form onSubmit={handleUpdateProfile} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                  <ImageIcon size={16} /> Cover Image
                </label>
                <div
                  className="relative h-32 w-full rounded-xl overflow-hidden border-2 border-dashed border-white/20 group cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                  onClick={() => coverInputRef.current?.click()}
                >
                  {coverObj.preview ? (
                    <img src={coverObj.preview} alt="Cover Preview" className="w-full h-full object-cover" />
                  ) : null}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="mb-2" />
                    <span className="text-sm font-medium">Change Cover</span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={coverInputRef}
                  onChange={(e) => handleImageChange(e, 'cover')}
                />
              </div>

              {/* Avatar Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                  <User size={16} /> Avatar
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div
                    className="relative w-24 h-24 shrink-0 rounded-full overflow-hidden border-2 border-dashed border-white/20 group cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {avatarObj.preview ? (
                      <img src={avatarObj.preview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} />
                    </div>
                  </div>
                  <div className="text-sm text-text-secondary">
                    <p>Recommended: Square image, at least 400x400px.</p>
                    <p>Max size: 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={avatarInputRef}
                    onChange={(e) => handleImageChange(e, 'avatar')}
                  />
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="pt-4 flex justify-end gap-4 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={isLoading} isLoading={isLoading}>
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                  <Lock size={16} /> Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                  <Lock size={16} /> New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-4 border-t border-white/10 mt-8">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={isLoading} isLoading={isLoading}>
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
