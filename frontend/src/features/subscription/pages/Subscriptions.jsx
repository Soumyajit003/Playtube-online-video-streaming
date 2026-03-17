import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSubscribedChannels, toggleSubscription } from '../api/subscription.api';
import { Loader } from '../../../components/ui/Loader';
import { Button } from '../../../components/ui/Button';
import { GlassCard } from '../../../components/ui/GlassCard';
import useAuthStore from '../../../app/store';

const Subscriptions = () => {
  const { user } = useAuthStore();
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscriptions = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await getSubscribedChannels(user._id);
      setChannels(response.data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setIsLoading(true); // Wait, should be false
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  const handleUnsubscribe = async (channelId) => {
    try {
      // Optimistic update
      setChannels(prev => prev.filter(c => c.subscribedChannel._id !== channelId));
      await toggleSubscription(channelId);
    } catch (error) {
      console.error('Error unsubscribing:', error);
      // Re-fetch on error to sync state
      fetchSubscriptions();
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Subscriptions
        </h1>
        <p className="text-text-secondary">{channels.length} Channels</p>
      </div>

      {channels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {channels.map((sub) => {
            const channel = sub.subscribedChannel;
            return (
              <GlassCard key={sub._id} className="p-6 flex items-center gap-6 group hover:border-primary/30 transition-all duration-500">
                <Link to={`/channel/${channel.username}`} className="flex-shrink-0 relative">
                  <img 
                    src={channel.avatar} 
                    alt={channel.username} 
                    className="h-20 w-20 rounded-full border-2 border-white/10 group-hover:border-primary/50 transition-colors object-cover" 
                  />
                  <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/channel/${channel.username}`}>
                    <h3 className="text-lg font-bold truncate hover:text-primary transition-colors">
                      {channel.fullname}
                    </h3>
                  </Link>
                  <p className="text-sm text-text-secondary truncate">@{channel.username}</p>
                  <p className="text-xs text-text-secondary mt-1">{channel.subscribersCount || 0} subscribers</p>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="rounded-full px-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleUnsubscribe(channel._id)}
                >
                  Unsubscribe
                </Button>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <span className="text-4xl text-text-secondary">📺</span>
          </div>
          <p className="text-text-secondary text-lg">You haven't subscribed to any channels yet</p>
          <Link to="/">
            <Button variant="primary" className="rounded-full px-8">Discover Content</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
