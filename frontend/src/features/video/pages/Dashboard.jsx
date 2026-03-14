import React, { useEffect, useState, useRef, useCallback } from 'react';
import { LayoutDashboard, Video, Eye, Users, Heart, CheckCircle, Clock } from 'lucide-react';
import axiosInstance from '../../../services/axiosInstance';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Loader } from '../../../components/ui/Loader';
import { Button } from '../../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, videosRes] = await Promise.all([
          axiosInstance.get('/dashboard/stats'),
          axiosInstance.get('/dashboard/videos?page=1&limit=10')
        ]);
        setStats(statsRes.data.data);
        setVideos(videosRes.data.data.docs || []);
        setHasNextPage(videosRes.data.data.hasNextPage);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchMoreVideos = async () => {
    if (!hasNextPage || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      const res = await axiosInstance.get(`/dashboard/videos?page=${nextPage}&limit=10`);
      setVideos((prev) => [...prev, ...(res.data.data.docs || [])]);
      setHasNextPage(res.data.data.hasNextPage);
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

  if (isLoading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;

  const statCards = [
    { label: 'Total Videos', value: stats?.totalVideos || 0, icon: Video, color: 'text-primary' },
    { label: 'Total Views', value: stats?.totalViews || 0, icon: Eye, color: 'text-secondary' },
    { label: 'Total Subscribers', value: stats?.totalSubscribers || 0, icon: Users, color: 'text-accent' },
    { label: 'Total Likes', value: stats?.totalLikes || 0, icon: Heart, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Channel Dashboard</h1>
          <p className="text-text-secondary mt-1">Manage your content and track performance</p>
        </div>
        <Link to="/upload">
          <Button variant="primary" size="md" className="gap-2">
            <Video size={18} />
            Upload New Video
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <GlassCard key={stat.label} className="p-6 flex items-center gap-6">
            <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-text-secondary text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold">Your Videos</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left bg-white/5 backdrop-blur-md">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Video</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Upload Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Rating</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {videos.map((video, index) => (
                <tr 
                  ref={videos.length === index + 1 ? lastVideoElementRef : null}
                  key={video._id} 
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      video.isPublished 
                        ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                    }`}>
                      {video.isPublished ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {video.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={video.thumbnail} alt="" className="h-10 w-16 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold text-sm line-clamp-1">{video.title}</p>
                        <p className="text-xs text-text-secondary">{video.views} views</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <Heart size={14} className="text-red-500" fill="currentColor" />
                      {video.likesCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary hover:text-white"
                      onClick={() => navigate(`/edit-video/${video._id}`)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isFetchingMore && (
            <div className="flex justify-center p-4">
              <Loader size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
