import React, { useEffect, useState } from 'react';
import { Hash, Send, Trash2, Heart, MessageSquare } from 'lucide-react';
import axiosInstance from '../../../services/axiosInstance';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Button } from '../../../components/ui/Button';
import { Loader } from '../../../components/ui/Loader';
import useAuthStore from '../../../app/store';

const Tweets = () => {
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const fetchTweets = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/tweets/timeline');
      setTweets(response.data.data);
    } catch (error) {
      console.error('Error fetching tweets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  const handlePostTweet = async (e) => {
    e.preventDefault();
    if (!newTweet.trim()) return;

    setIsSubmitting(true);
    try {
      await axiosInstance.post('/tweets', { content: newTweet });
      setNewTweet('');
      fetchTweets();
    } catch (error) {
      console.error('Error posting tweet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    try {
      await axiosInstance.delete(`/tweets/${tweetId}`);
      setTweets(tweets.filter(t => t._id !== tweetId));
    } catch (error) {
      console.error('Error deleting tweet:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Feed</h1>
        <p className="text-text-secondary mt-1">Short updates and thoughts from creators</p>
      </div>

      {user && (
        <GlassCard className="p-6">
          <form onSubmit={handlePostTweet} className="space-y-4">
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all resize-none h-24"
              placeholder="What's on your mind?"
              value={newTweet}
              onChange={(e) => setNewTweet(e.target.value)}
            />
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSubmitting} disabled={!newTweet.trim()} className="gap-2 px-8">
                <Send size={18} />
                Post Tweet
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader size="md" /></div>
        ) : tweets.length === 0 ? (
          <div className="text-center py-20 text-text-secondary">No tweets yet :)</div>
        ) : (
          tweets.map((tweet) => (
            <GlassCard key={tweet._id} className="p-6 flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <img src={tweet.owner.avatar} alt="" className="h-12 w-12 rounded-full border border-primary/20 object-cover flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{tweet.owner.username}</h4>
                    <p className="text-xs text-text-secondary">{new Date(tweet.createdAt).toLocaleString()}</p>
                  </div>
                  {user?._id === tweet.owner._id && (
                    <button 
                      onClick={() => handleDeleteTweet(tweet._id)}
                      className="text-text-secondary hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <p className="text-white leading-relaxed">{tweet.content}</p>
                <div className="flex gap-6 pt-2">
                  <button className="flex items-center gap-2 text-text-secondary hover:text-red-500 transition-colors">
                    <Heart size={18} />
                    <span className="text-sm">0</span>
                  </button>
                  <button className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors">
                    <MessageSquare size={18} />
                    <span className="text-sm">0</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Tweets;
