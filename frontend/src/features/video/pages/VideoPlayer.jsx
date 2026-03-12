import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Share2, UserPlus, Heart } from 'lucide-react';
import axiosInstance from '../../../services/axiosInstance';
import { Button } from '../../../components/ui/Button';
import { Loader } from '../../../components/ui/Loader';
import { GlassCard } from '../../../components/ui/GlassCard';
import useAuthStore from '../../../app/store';
import { toggleVideoLike } from '../../likes/api/likeApi';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const { user: currentUser } = useAuthStore();
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const lastViewedVideoId = useRef(null);

  useEffect(() => {
    const fetchVideo = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/videos/${videoId}`);
        const videoData = response.data.data;
        setVideo(videoData);
        setIsLiked(videoData.isLiked);
        setLikesCount(videoData.likesCount);
      } catch (error) {
        console.error('Error fetching video:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideo();
  }, [videoId]);

  const handleLike = async () => {
    if (!currentUser) {
      console.warn('User must be logged in to like');
      // If there's a toast utility, it would be good to use it here.
      // For now, we'll just log it.
      return;
    }
    
    // Store previous values for rollback
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    
    // Optimistic UI update
    setIsLiked(!previousIsLiked);
    setLikesCount(prev => previousIsLiked ? prev - 1 : prev + 1);

    try {
      const response = await toggleVideoLike(videoId);
      // If backend returns the actual new state, we could sync it here
      // but the optimistic update already handled the toggle.
      // Some backends might return the NEW isLiked state.
      if (response?.data && typeof response.data.isLiked === 'boolean') {
        setIsLiked(response.data.isLiked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Rollback on error
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
    }
  };

  // Dedicated effect for view increment with useRef guard to prevent double-counting in StrictMode
  useEffect(() => {
    if (videoId && lastViewedVideoId.current !== videoId) {
      // Mark as viewed IMMEDIATELY
      lastViewedVideoId.current = videoId;
      
      const incrementView = async () => {
        try {
          await axiosInstance.patch(`/videos/v/${videoId}/view`);
        } catch (error) {
          console.error('Error incrementing view:', error);
          // Optional: reset if you want to allow retry on error
          // lastViewedVideoId.current = null;
        }
      };
      incrementView();
    }
  }, [videoId]);

  if (isLoading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;
  if (!video) return <div className="text-center py-20">Video not found</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Player Container */}
        <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
          <video 
            src={video.videoFile} 
            controls 
            autoPlay
            className="w-full h-full"
            poster={video.thumbnail}
          />
        </div>

        {/* Video Info */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{video.title}</h1>
          
          <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/10">
            <div className="flex items-center gap-4">
              <Link to={`/channel/${video.owner[0]?.username}`}>
                <img src={video.owner[0]?.avatar} alt="" className="h-12 w-12 rounded-full border border-primary/20" />
              </Link>
              <div>
                <Link to={`/channel/${video.owner[0]?.username}`}>
                  <h3 className="font-semibold">{video.owner[0]?.username}</h3>
                </Link>
                <p className="text-sm text-text-secondary">{video.owner[0]?.subscriberCount} subscribers</p>
              </div>
              <Button variant="primary" size="sm" className="ml-4 rounded-full px-6">
                Subscribe
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className={`rounded-full gap-2 px-6 transition-colors duration-300 ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
                onClick={handleLike}
              >
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'scale-110' : ''} />
                <span className="font-semibold">{likesCount} Likes</span>
              </Button>
              <Button variant="secondary" size="sm" className="rounded-full gap-2 px-4">
                <Share2 size={18} />
                Share
              </Button>
            </div>
          </div>

          <GlassCard className="p-4 bg-white/5 rounded-2xl">
            <p className="text-sm font-semibold mb-2">
              {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
            </p>
            <p className="whitespace-pre-wrap text-text-secondary leading-relaxed">
              {video.description}
            </p>
          </GlassCard>
        </div>

        {/* Comments Placeholder */}
        <div className="space-y-6 pt-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare size={20} className="text-primary" />
            Comments
          </h2>
          {/* Comment list would go here */}
          <div className="p-10 text-center border border-dashed border-white/10 rounded-2xl text-text-secondary">
            Comment system coming soon...
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="font-bold text-lg">Recommended Videos</h3>
        {/* Recommendation list placeholder */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 group cursor-pointer">
              <div className="w-40 aspect-video rounded-xl bg-white/5 overflow-hidden flex-shrink-0 border border-white/5">
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">Recommended Video Title {i}</h4>
                <p className="text-xs text-text-secondary">Channel Name</p>
                <p className="text-xs text-text-secondary">1.2M views • 2 days ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
