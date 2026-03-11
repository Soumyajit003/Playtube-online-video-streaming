import React from 'react';
import { Link } from 'react-router-dom';

const VideoCard = ({ video }) => {
  // Handle different owner details structure if necessary
  const owner = video.ownerDetails || video.owner?.[0] || {};
  
  return (
    <div className="group cursor-pointer">
      <Link to={`/watch/${video._id}`}>
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 border border-white/5">
          <img 
            src={video.thumbnail} 
            alt={video.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs font-medium">
            {Math.floor(video.duration / 60)}:{Math.floor(video.duration % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </Link>
      
      <div className="flex gap-3 px-1">
        {owner.username && (
          <Link to={`/channel/${owner.username}`}>
            <img 
              src={owner.avatar} 
              alt={owner.username} 
              className="h-10 w-10 rounded-full object-cover border border-primary/20"
            />
          </Link>
        )}
        <div className="flex-1 overflow-hidden">
          <Link to={`/watch/${video._id}`}>
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
          </Link>
          {owner.username && (
            <Link to={`/channel/${owner.username}`}>
              <p className="text-sm text-text-secondary mt-1 hover:text-white transition-colors">
                {owner.username}
              </p>
            </Link>
          )}
          <p className="text-xs text-text-secondary mt-0.5">
            {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
