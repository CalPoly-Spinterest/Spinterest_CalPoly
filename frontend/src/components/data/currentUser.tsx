import { useEffect, useState } from 'react';

export interface CurrentUser {
  display_name: string;
  email: string;
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  href: string;
  id: string;
  images: {
    height: number | null;
    url: string;
    width: number | null;
  }[];
  product: string;
  type: string;
  uri: string;
}

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/spotify/me`,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem('jwttoken')}`,
            },
          }
        );
        const data = await response.json();
        setCurrentUser(data);
      } catch (error) {
        console.error('Error fetching current user.', error);
      }
    };
    fetchCurrentUser();
  }, []);

  return currentUser;
};
