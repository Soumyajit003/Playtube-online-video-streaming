import React, { useEffect, useState } from 'react';
import { getLikedVideos } from '../../likes/api/likeApi';
import VideoCard from '../../../components/ui/VideoCard';
import { Loader } from '../../../components/ui/Loader';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Heart } from 'lucide-react';

const LikedVideos = () => {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLikedVideos = async () => {
            try {
                setIsLoading(true);
                const response = await getLikedVideos();
                // Backend now returns a flat array of video objects
                setVideos(response.data || []);
            } catch (err) {
                console.error('Error fetching liked videos:', err);
                setError(err.message || 'Failed to load liked videos');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLikedVideos();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader size="xl" />
                <p className="mt-4 text-text-secondary animate-pulse">Fetching your favorite videos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
                <GlassCard className="p-8 border-red-500/20">
                    <p className="text-red-400 font-medium">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 text-primary hover:underline"
                    >
                        Try Again
                    </button>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                    <Heart className="text-red-500 fill-red-500" size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Liked Videos
                    </h1>
                    <p className="text-text-secondary mt-1">{videos.length} videos</p>
                </div>
            </header>

            {videos.length === 0 ? (
                <GlassCard className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                        <Heart size={40} className="text-white/20" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">You haven't liked any videos yet</h2>
                    <p className="text-text-secondary max-w-md mx-auto">
                        Your liked videos will appear here for you to watch whenever you want.
                    </p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LikedVideos;
