import React, { useEffect, useState } from 'react';
import { getWatchHistory } from '../../auth/api/userApi';
import VideoCard from '../../../components/ui/VideoCard';
import { Loader } from '../../../components/ui/Loader';
import { GlassCard } from '../../../components/ui/GlassCard';
import { History as HistoryIcon, Clock } from 'lucide-react';

const History = () => {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setIsLoading(true);
                const response = await getWatchHistory();
                // Backend returns watchHistory as a flat array of video objects
                setVideos(response.data || []);
            } catch (err) {
                console.error('Error fetching watch history:', err);
                setError(err.message || 'Failed to load watch history');
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader size="xl" />
                <p className="mt-4 text-text-secondary animate-pulse">Fetching your watch history...</p>
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
                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                    <HistoryIcon className="text-primary" size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Watch History
                    </h1>
                    <p className="text-text-secondary mt-1">{videos.length} videos watched recently</p>
                </div>
            </header>

            {videos.length === 0 ? (
                <GlassCard className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                        <Clock size={40} className="text-white/20" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Your history is empty</h2>
                    <p className="text-text-secondary max-w-md mx-auto">
                        Videos you watch will show up here so you can easily find them again.
                    </p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <VideoCard key={`${video._id}-${Math.random()}`} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
