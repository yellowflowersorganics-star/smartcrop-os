import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

export default function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthData } = useAuthStore();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        navigate('/login?error=' + error);
        return;
      }

      if (!token) {
        navigate('/login?error=no_token');
        return;
      }

      try {
        // Set token in API client
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch user data
        const response = await api.get('/auth/me');
        const user = response.data.data;

        // Update auth store
        setAuthData(user, token);

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Google auth error:', error);
        navigate('/login?error=auth_failed');
      }
    };

    handleGoogleAuth();
  }, [searchParams, navigate, setAuthData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in with Google...</p>
      </div>
    </div>
  );
}

