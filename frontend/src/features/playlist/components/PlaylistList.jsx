import React, { useEffect, useState } from 'react';
import { Layers, Plus, PlayCircle } from 'lucide-react';
import axiosInstance from '../../../services/axiosInstance';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Button } from '../../../components/ui/Button';
import { Loader } from '../../../components/ui/Loader';
import { Link } from 'react-router-dom';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/playlists/user'); // Adjust route as needed
        setPlaylists(response.data.data);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  if (isLoading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Collections</h1>
          <p className="text-text-secondary mt-1">Organize your favorite videos</p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus size={18} />
          New Playlist
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <GlassCard key={playlist._id} className="p-0 flex flex-col group cursor-pointer overflow-hidden border-white/10 hover:border-primary/50 transition-all">
              <div className="relative aspect-video bg-white/5">
                {playlist.videos?.[0] ? (
                  <img src={playlist.videos[0].thumbnail} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-background/80 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle size={32} className="text-primary" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 left-0 bg-background/80 backdrop-blur-md p-2 flex justify-between items-center">
                  <span className="text-xs font-semibold px-2">{playlist.videos?.length || 0} videos</span>
                  <Layers size={14} className="mr-2" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold group-hover:text-primary transition-colors">{playlist.name}</h3>
                <p className="text-sm text-text-secondary mt-1 line-clamp-1">{playlist.description}</p>
                <p className="text-xs text-text-secondary mt-2">Updated {new Date(playlist.updatedAt).toLocaleDateString()}</p>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <Layers size={48} className="mx-auto text-text-secondary mb-4 opacity-20" />
            <h3 className="text-xl font-bold">No playlists created</h3>
            <p className="text-text-secondary mt-2">Create your first playlist to organize your content</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlists;
