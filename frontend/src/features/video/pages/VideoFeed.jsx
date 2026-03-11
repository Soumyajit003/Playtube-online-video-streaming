import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance';
import { Loader } from '../../../components/ui/Loader';
import VideoCard from '../../../components/ui/VideoCard';

const VideoFeed = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/videos', {
          params: { query }
        });
        setVideos(response.data.data.docs);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [query]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">No videos found</h2>
        <p className="text-text-secondary mt-2">Try searching for something else!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
};

export default VideoFeed;
