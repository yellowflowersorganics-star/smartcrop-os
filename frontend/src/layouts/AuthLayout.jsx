import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-800">🌱 CropWise</h1>
          <p className="text-primary-600 mt-2">Universal IoT Platform for Agriculture</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

