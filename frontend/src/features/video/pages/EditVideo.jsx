import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Image as ImageIcon, X, Save } from 'lucide-react';
import axiosInstance from '../../../services/axiosInstance';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Loader } from '../../../components/ui/Loader';

const EditVideo = () => {
  const { videoId } = useParams();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnail, setThumbnail] = useState(null);
  const [currentThumbnail, setCurrentThumbnail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axiosInstance.get(`/videos/${videoId}`);
        const video = response.data.data;
        setValue('title', video.title);
        setValue('description', video.description);
        setCurrentThumbnail(video.thumbnail);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching video details:', error);
        navigate('/dashboard');
      }
    };
    fetchVideo();
  }, [videoId, setValue, navigate]);

  const onSubmit = async (data) => {
    setIsUpdating(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }

    try {
      await axiosInstance.patch(`/videos/${videoId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (thumbnail) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating video:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Video</h1>
        <p className="text-text-secondary mt-1">Update your video details and thumbnail</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
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
              ) : currentThumbnail ? (
                <div className="relative aspect-video rounded-xl overflow-hidden group">
                  <img src={currentThumbnail} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-medium">Change Thumbnail</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-text-secondary">
                  <ImageIcon size={32} className="mb-2" />
                  <p className="text-sm">Upload New Thumbnail</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => setThumbnail(e.target.files[0])}
              />
            </label>
            <p className="text-xs text-text-secondary">Leave empty to keep current thumbnail</p>
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

          {isUpdating && thumbnail && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">
                  {uploadProgress < 100 ? 'Uploading Thumbnail...' : 'Processing...'}
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
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <Button variant="ghost" className="flex-1" type="button" onClick={() => navigate(-1)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="flex-1 gap-2" 
              type="submit" 
              isLoading={isUpdating}
              disabled={isUpdating}
            >
              <Save size={18} />
              Save Changes
            </Button>
          </div>
        </GlassCard>
      </form>
    </div>
  );
};

export default EditVideo;
