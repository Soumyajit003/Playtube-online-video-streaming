import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, Video as VideoIcon, Film, Image as ImageIcon, X } from 'lucide-react';
import axiosInstance from '../../../services/axiosInstance';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { GlassCard } from '../../../components/ui/GlassCard';

const VideoUpload = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    if (!videoFile || !thumbnail) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('videofile', videoFile);
    formData.append('thumbnail', thumbnail);

    try {
      await axiosInstance.post('/videos/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error uploading video:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Video</h1>
        <p className="text-text-secondary mt-1">Share your content with the world</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <GlassCard className="p-0 border-dashed border-2 bg-white/5 group hover:bg-white/10 transition-all cursor-pointer">
            <label className="flex flex-col items-center justify-center p-12 w-full h-full cursor-pointer">
              {videoFile ? (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-primary/20 rounded-full inline-block">
                    <VideoIcon className="text-primary h-12 w-12" />
                  </div>
                  <p className="font-semibold text-primary">{videoFile.name}</p>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); setVideoFile(null); }}>
                    Change File
                  </Button>
                </div>
              ) : (
                <>
                  <Upload size={48} className="text-text-secondary group-hover:text-primary transition-colors mb-4" />
                  <p className="font-semibold text-lg">Click to upload video</p>
                  <p className="text-sm text-text-secondary mt-2 text-center">
                    Drag and drop your video file here or browse
                  </p>
                </>
              )}
              <input 
                type="file" 
                accept="video/*" 
                className="hidden" 
                onChange={(e) => setVideoFile(e.target.files[0])}
              />
            </label>
          </GlassCard>

          <div className="space-y-4">
            <p className="font-semibold">Thumbnail</p>
            <label className="block border-2 border-dashed border-white/10 rounded-2xl p-4 bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
              {thumbnail ? (
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <img src={URL.createObjectURL(thumbnail)} alt="" className="w-full h-full object-cover" />
                  <button 
                    onClick={(e) => { e.preventDefault(); setThumbnail(null); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-text-secondary">
                  <ImageIcon size={32} className="mb-2" />
                  <p className="text-sm">Upload Thumbnail</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => setThumbnail(e.target.files[0])}
              />
            </label>
          </div>
        </div>

        <GlassCard className="p-6 space-y-6">
          <Input 
            label="Video Title" 
            placeholder="e.g. My Awesome Video" 
            {...register('title', { required: 'Title is required' })}
            error={errors.title?.message}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Description</label>
            <textarea 
              className="cyber-input w-full min-h-[150px] resize-none"
              placeholder="Tell viewers about your video..."
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">
                  {uploadProgress < 100 ? 'Uploading...' : 'Processing on server...'}
                </span>
                <span className="text-primary font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)] ${
                    uploadProgress === 100 ? 'bg-green-500 animate-pulse' : 'bg-primary'
                  }`}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {uploadProgress === 100 && (
                <p className="text-xs text-text-secondary animate-pulse">
                  This might take a moment while we process your video...
                </p>
              )}
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <Button variant="ghost" className="flex-1" type="button" onClick={() => navigate(-1)} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="flex-1" 
              type="submit" 
              isLoading={isUploading}
              disabled={!videoFile || !thumbnail || isUploading}
            >
              Publish Video
            </Button>
          </div>
        </GlassCard>
      </form>
    </div>
  );
};

export default VideoUpload;
