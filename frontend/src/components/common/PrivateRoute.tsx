import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../data/SpotifyAuth';

interface PrivateRouteProps {
  element: React.ComponentType;
  path: string;
  exact?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element: Component }) => {
  const accessToken = getAccessToken();
  return accessToken ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
