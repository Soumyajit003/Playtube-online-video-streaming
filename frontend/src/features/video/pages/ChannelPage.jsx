import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance';
import { Loader } from '../../../components/ui/Loader';
import { Button } from '../../../components/ui/Button';
import VideoCard from '../../../components/ui/VideoCard';

const ChannelPage = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChannelData = async () => {
      setIsLoading(true);
      try {
        const [channelRes, videosRes] = await Promise.all([
          axiosInstance.get(`/users/c/${username}`),
          axiosInstance.get(`/videos`, { params: { userId: username } }) // Adjust if backend uses ID or username
        ]);
        setChannel(channelRes.data.data);
        setVideos(videosRes.data.data.docs || []);
      } catch (error) {
        console.error('Error fetching channel data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChannelData();
  }, [username]);

  if (isLoading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;
  if (!channel) return <div className="text-center py-20">Channel not found</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Cover Image */}
      <div className="relative h-48 md:h-80 w-full rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl">
        {channel.coverImage ? (
          <img src={channel.coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-background to-primary/20" />
        )}
      </div>

      {/* Channel Info */}
      <div className="flex flex-col md:flex-row items-start md:items-end gap-6 px-4 -mt-12 md:-mt-16">
        <img 
          src={channel.avatar} 
          alt={channel.username} 
          className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-background bg-background shadow-2xl object-cover" 
        />
        <div className="flex-1 pb-4">
          <h1 className="text-3xl font-bold">{channel.fullname}</h1>
          <p className="text-text-secondary">@{channel.username} • {channel.subscribersCount} subscribers</p>
        </div>
        <div className="pb-4">
          <Button variant={channel.isSubscribed ? 'secondary' : 'primary'} className="rounded-full px-8">
            {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
          </Button>
        </div>
      </div>

      {/* Tabs Placeholder */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex gap-8 text-sm font-semibold text-text-secondary px-4">
          <span className="text-primary border-b-2 border-primary pb-4">Videos</span>
          <span className="hover:text-white cursor-pointer transition-colors">Playlists</span>
          <span className="hover:text-white cursor-pointer transition-colors">Tweets</span>
          <span className="hover:text-white cursor-pointer transition-colors">About</span>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
        {videos.length > 0 ? (
          videos.map((video) => (
            <VideoCard 
              key={video._id} 
              video={{
                ...video,
                ownerDetails: video.ownerDetails || { 
                  username: channel.username, 
                  avatar: channel.avatar 
                }
              }} 
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-text-secondary">No videos uploaded yet</div>
        )}
      </div>
    </div>
  );
};

export default ChannelPage;
