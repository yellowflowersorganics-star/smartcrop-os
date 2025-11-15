# CropWise - Frontend Dashboard

Modern web dashboard for CropWise built with React, Vite, and Tailwind CSS.

## 🚀 Features

- **Farm Management**: Create and monitor multiple farms
- **Zone Control**: Manage growing zones with different crops
- **Crop Recipes**: Browse, create, and assign crop recipes
- **Real-time Monitoring**: Live environmental data and alerts
- **Device Management**: Register and configure IoT devices
- **Analytics**: Yield predictions and performance metrics
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **TanStack Query**: Data fetching and caching
- **Zustand**: State management
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization
- **Lucide React**: Icon library
- **Axios**: HTTP client

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── layouts/          # Layout components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── stores/           # Zustand stores
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json
```

## 🎨 UI Components

### Layouts
- `MainLayout`: Main dashboard layout with sidebar
- `AuthLayout`: Login/register layout

### Pages
- `Dashboard`: Overview and statistics
- `Farms`: Farm management
- `Zones`: Zone management and monitoring
- `CropRecipes`: Recipe browser and editor
- `Devices`: Device registration and status
- `Analytics`: Performance insights
- `Settings`: User preferences

## 🔐 Authentication

Uses JWT token stored in localStorage via Zustand persist middleware.

```javascript
const { login, logout, isAuthenticated } = useAuthStore();
```

## 📡 API Integration

API services are organized in `src/services/api.js`:

```javascript
import { farmService, zoneService, recipeService } from './services/api';

// Example usage
const farms = await farmService.getAll();
```

## 🎨 Styling

Uses Tailwind CSS with custom utilities defined in `src/index.css`:

```jsx
<div className="card">
  <button className="btn btn-primary">Click me</button>
</div>
```

## 📊 Data Fetching

Uses TanStack Query for server state management:

```javascript
const { data, isLoading } = useQuery({
  queryKey: ['farms'],
  queryFn: () => farmService.getAll(),
});
```

## 🚢 Deployment

### Docker

```bash
docker build -t cropwise-frontend .
docker run -p 8080:80 cropwise-frontend
```

### Static Hosting

```bash
npm run build
# Deploy the dist/ directory to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Azure Static Web Apps
```

## 📝 License

MIT License

