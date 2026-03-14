import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance';
import { Loader } from '../../../components/ui/Loader';
import VideoCard from '../../../components/ui/VideoCard';

const VideoFeed = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  useEffect(() => {
    const fetchInitialVideos = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/videos', {
          params: { query, page: 1, limit: 12 }
        });
        setVideos(response.data.data.docs || []);
        setHasNextPage(response.data.data.hasNextPage);
        setPage(1);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Reset state before fetching
    setVideos([]);
    fetchInitialVideos();
  }, [query]);

  const fetchMoreVideos = async () => {
    if (!hasNextPage || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      const response = await axiosInstance.get('/videos', {
        params: { query, page: nextPage, limit: 12 }
      });
      setVideos((prev) => [...prev, ...(response.data.data.docs || [])]);
      setHasNextPage(response.data.data.hasNextPage);
      setPage(nextPage);
    } catch (error) {
      console.error('Error fetching more videos:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const observer = useRef();
  const lastVideoElementRef = useCallback(node => {
    if (isLoading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchMoreVideos();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingMore, hasNextPage, page]);

  if (isLoading && videos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  if (videos.length === 0 && !isLoading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">No videos found</h2>
        <p className="text-text-secondary mt-2">Try searching for something else!</p>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {videos.map((video, index) => {
          if (videos.length === index + 1) {
            return (
              <div ref={lastVideoElementRef} key={video._id}>
                <VideoCard video={video} />
              </div>
            );
          } else {
            return <VideoCard key={video._id} video={video} />;
          }
        })}
      </div>
      
      {isFetchingMore && (
        <div className="flex justify-center mt-10">
          <Loader size="md" />
        </div>
      )}
    </div>
  );
};

export default VideoFeed;
