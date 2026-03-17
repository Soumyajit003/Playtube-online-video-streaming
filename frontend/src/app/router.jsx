import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from './store';

import Home from '../features/video/pages/VideoFeed';
import Login from '../features/auth/pages/Login';
import Signup from '../features/auth/pages/Signup';
import VideoPlayer from '../features/video/pages/VideoPlayer';
import Dashboard from '../features/video/pages/Dashboard';
import Tweets from '../features/tweet/pages/Tweets';
import Upload from '../features/video/pages/VideoUpload';
import EditVideo from '../features/video/pages/EditVideo';
import Channel from '../features/video/pages/ChannelPage';
import Playlists from '../features/playlist/components/PlaylistList';
import Subscriptions from '../features/subscription/pages/Subscriptions';
import LikedVideos from '../features/video/pages/LikedVideos';
import History from '../features/video/pages/History';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return null; // Or a loader
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'watch/:videoId',
        element: <VideoPlayer />,
      },
      {
        path: 'channel/:username',
        element: <Channel />,
      },
      {
        path: 'subscriptions',
        element: <ProtectedRoute><Subscriptions /></ProtectedRoute>,
      },
      {
        path: 'liked-videos',
        element: <ProtectedRoute><LikedVideos /></ProtectedRoute>,
      },
      {
        path: 'history',
        element: <ProtectedRoute><History /></ProtectedRoute>,
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: 'upload',
        element: <ProtectedRoute><Upload /></ProtectedRoute>,
      },
      {
        path: 'edit-video/:videoId',
        element: <ProtectedRoute><EditVideo /></ProtectedRoute>,
      },
      {
        path: 'tweets',
        element: <Tweets />,
      },
      {
        path: 'playlists',
        element: <Playlists />,
      }
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
]);

export default router;
