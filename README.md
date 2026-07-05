# Professional Portfolio Website

A cutting-edge professional portfolio website with an advanced, secure admin dashboard that provides comprehensive content management and interactive user experience.

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, Framer Motion, Three.js
- **Backend**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: Secure session-based authentication
- **UI Components**: Shadcn UI, Radix UI
- **State Management**: React Query
- **Styling**: Tailwind CSS with custom animations

## Features

- Responsive design optimized for all devices
- Interactive 3D elements with Three.js
- Smooth animations with Framer Motion
- Secure admin dashboard for content management
- Real-time analytics and user tracking
- Blog management system
- Project showcase with filtering
- Skills categorization and management
- Contact form with admin notifications
- SEO optimized

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/portfolio-website.git
cd portfolio-website
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
DATABASE_URL=your_mongodb_connection_string
SESSION_SECRET=your_secure_session_secret
NODE_ENV=development
```

5. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Deployment

### Environment Variables Required

- `DATABASE_URL`: MongoDB connection string
- `SESSION_SECRET`: Secure session secret key
- `NODE_ENV`: Set to 'production' for production deployment
- `PORT`: Port number (automatically set by hosting platforms)

### Deploy to Render

1. Push code to GitHub
2. Connect GitHub repository to Render
3. Configure build settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables in Render dashboard
5. Deploy

### Deploy to Other Platforms

The application is configured to work with:
- Render
- Heroku
- Railway
- DigitalOcean App Platform
- Any Node.js hosting platform

## Scripts

- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm run build` - Build for production
- `npm run lint` - Run linting

# Professional Portfolio Website

A cutting-edge, full-stack portfolio application with an advanced admin dashboard, featuring real-time content management, comprehensive analytics, and optimized deployment for production environments.

## 🚀 Features

### Frontend
- **Modern React Architecture**: TypeScript, Vite, Tailwind CSS
- **Interactive Design**: Framer Motion animations, Three.js 3D elements
- **Responsive Layout**: Mobile-first design with cross-device compatibility
- **Performance Optimized**: Lazy loading, code splitting, image optimization
- **SEO Ready**: Meta tags, sitemap generation, structured data

### Backend
- **Secure API**: Express.js with comprehensive authentication
- **Real-time Updates**: Socket.IO for live content synchronization
- **Database Integration**: MongoDB with Mongoose ODM
- **Admin Dashboard**: Complete content management system
- **Security Features**: Rate limiting, CORS protection, input validation

### Deployment
- **Production Ready**: Optimized builds for Render deployment
- **Keep-Alive Service**: Prevents free tier sleeping
- **Health Monitoring**: Built-in health checks and performance metrics
- **Auto-scaling**: Configured for cloud deployment platforms

## 🏗️ Project Structure

```
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Route-based page components
│   │   ├── lib/              # Utility libraries and configurations
│   │   └── hooks/            # Custom React hooks
│   ├── public/               # Static assets
│   └── dist/                 # Production build output
├── server/                   # Express backend application
│   ├── index.ts              # Main server entry point
│   ├── auth.ts               # Authentication middleware
│   ├── config.ts             # Environment configuration
│   ├── db.ts                 # Database connection
│   ├── routes.ts             # API route definitions
│   ├── security.ts           # Security middleware
│   ├── storage.ts            # Database operations
│   ├── production.ts         # Production optimizations
│   └── vite.ts               # Development server integration
├── shared/                   # Shared types and schemas
│   └── schema.ts             # Database models and validation
├── scripts/                  # Deployment and maintenance scripts
│   ├── keep-alive.js         # External keep-alive service
│   └── health-check.sh       # Health monitoring script
├── uploads/                  # User-uploaded files storage
└── dist/                     # Server production build
```

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
# Admin Panel: http://localhost:5000/admin
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment

### Render Deployment (Recommended)
1. **Connect Repository**: Link your GitHub repository to Render
2. **Configure Service**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Health Check Path: `/health`
3. **Environment Variables**:
   - `NODE_ENV=production`
   - `MONGODB_URI=your-mongodb-connection-string`
   - `SESSION_SECRET=your-secure-random-string`

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
# Edit .env with your actual values
```

## 🔐 Security Features

- **Authentication**: Secure session-based admin authentication
- **Password Security**: bcrypt hashing with salt rounds
- **Rate Limiting**: API endpoint protection with admin exemptions
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive request validation with Zod
- **XSS Prevention**: Content security policies and sanitization
- **HTTPS Enforcement**: Automatic SSL in production environments

## 📊 Performance Optimizations

- **Frontend**: Vite bundling, code splitting, lazy loading
- **Backend**: Connection pooling, caching strategies, compression
- **Database**: Indexed queries, aggregation pipelines, connection reuse
- **Assets**: Image optimization, static file compression, CDN ready
- **Monitoring**: Health checks, performance metrics, error tracking

## 🛠️ Technology Stack

### Frontend Technologies
- **React 18**: Latest React with concurrent features
- **TypeScript**: Type-safe development environment
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Advanced animation library
- **Three.js**: 3D graphics and interactive elements
- **React Query**: Server state management
- **Wouter**: Lightweight routing solution

### Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Socket.IO**: Real-time bidirectional communication
- **Sharp**: High-performance image processing
- **Multer**: File upload handling middleware

### Development Tools
- **Vite**: Next-generation frontend tooling
- **ESBuild**: Fast JavaScript/TypeScript bundler
- **TypeScript**: Static type checking
- **Prettier**: Code formatting
- **ESLint**: Code linting and quality

## 📁 Key Components

### Admin Dashboard
- **Content Management**: Edit all website sections
- **Media Upload**: Image optimization and management
- **User Analytics**: Real-time visitor tracking
- **Blog Management**: Create and manage blog posts
- **Skills Organization**: Categorized skill management
- **Project Showcase**: Portfolio project management

### Public Portfolio
- **Hero Section**: Animated introduction with CTAs
- **About Section**: Personal information and background
- **Skills Display**: Categorized technical proficiencies
- **Project Portfolio**: Detailed project showcases
- **Experience Timeline**: Professional experience history
- **Contact Form**: Integrated communication system

## 🔄 Real-time Features

- **Live Content Updates**: Instant synchronization across devices
- **Admin Notifications**: Real-time dashboard alerts
- **Visitor Analytics**: Live user interaction tracking
- **Content Preview**: Real-time editing with instant preview
- **Socket.IO Integration**: Bidirectional real-time communication

## 📈 Monitoring & Analytics

- **Health Endpoints**: `/health` for service monitoring
- **Performance Metrics**: Memory usage, uptime tracking
- **Error Logging**: Comprehensive error handling and logging
- **User Analytics**: Page views, interaction tracking
- **Database Monitoring**: Connection status and query performance

## 🔧 Maintenance

### Regular Tasks
- **Dependency Updates**: Monthly package updates
- **Security Patches**: Immediate security update application
- **Database Backups**: Regular MongoDB Atlas backups
- **Performance Monitoring**: Weekly performance reviews
- **SSL Certificate**: Automatic renewal through hosting provider

### Health Checks
```bash
# Check application health
curl https://your-app.onrender.com/health

# Run local health check
./scripts/health-check.sh http://localhost:5000
```

## 🤝 Contributing

1. **Fork Repository**: Create your own fork
2. **Feature Branch**: Create feature-specific branches
3. **Code Standards**: Follow TypeScript and React best practices
4. **Testing**: Ensure all features work correctly
5. **Pull Request**: Submit comprehensive pull requests

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🆘 Support

For issues, questions, or contributions:
- **Repository Issues**: GitHub issue tracker
- **Documentation**: Check deployment guides in repository
- **Community**: React and Node.js community resources

---

**Production URL**: `https://your-app.onrender.com`  
**Admin Dashboard**: `https://your-app.onrender.com/admin`  
**Health Check**: `https://your-app.onrender.com/health` is private and proprietary.

## Support

For support or questions, please contact the development team.