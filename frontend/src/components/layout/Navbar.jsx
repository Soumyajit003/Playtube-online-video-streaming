import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Video } from 'lucide-react';
import useAuthStore from '../../app/store';
import { Button } from '../ui/Button';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?query=${searchQuery}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/10 px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Video className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">PLAYTUBE</span>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl mx-4">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder="Search videos..."
            className="pl-10 h-10 bg-white/5 border-white/10 rounded-full focus:bg-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
        </form>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/upload">
              <Button variant="primary" size="sm" className="hidden md:flex gap-2">
                <Video className="h-4 w-4" />
                Upload
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="h-8 w-8 rounded-full border border-primary/50 object-cover cursor-pointer hover:opacity-80 transition-opacity"
              />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

// Internal Import fix: Need to use Input from relative path
import { Input } from '../ui/Input';

export default Navbar;
