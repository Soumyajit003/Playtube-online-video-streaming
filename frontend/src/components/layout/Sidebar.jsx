import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ThumbsUp, 
  History, 
  PlaySquare, 
  Layers, 
  Users, 
  LogOut,
  Hash,
  LayoutDashboard,
  Heart
} from 'lucide-react';
import useAuthStore from '../../app/store';

const Sidebar = () => {
  const { logout, user } = useAuthStore();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Heart, label: 'Liked Videos', path: '/liked-videos' },
    { icon: History, label: 'History', path: '/history' },
    { icon: PlaySquare, label: 'My Channel', path: user ? `/channel/${user.username}` : '/login' },
    { icon: Layers, label: 'Playlists', path: '/playlists' },
    { icon: Users, label: 'Subscriptions', path: '/subscriptions' },
    { icon: Hash, label: 'Tweets', path: '/tweets' },
  ];

  if (user) {
    menuItems.push({ icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' });
  }

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-background border-r border-white/10 hidden md:flex flex-col p-4 z-30">
      <div className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'text-text-secondary hover:bg-white/5 hover:text-white'}
            `}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {user && (
        <button
          onClick={logout}
          className="flex items-center gap-4 px-4 py-3 text-text-secondary hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all duration-200 mt-auto"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      )}
    </aside>
  );
};

export default Sidebar;
