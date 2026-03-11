import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './app/router';
import useAuthStore from './app/store';
import { FullPageLoader } from './components/ui/Loader';
import './styles/globals.css';

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="bg-background min-h-screen text-white">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
