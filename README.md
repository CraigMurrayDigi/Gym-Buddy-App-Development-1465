# 🏋️‍♂️ Gym Buddy App

A comprehensive fitness social platform that connects workout enthusiasts, allowing them to schedule workouts, find gym buddies, and share their fitness journey.

## ✨ Features

### 🔐 Authentication & Profiles
- **User Registration & Login** with Supabase Auth
- **Profile Setup** with location and gym selection
- **Admin Dashboard** for platform management
- **Role-based Access Control** (User/Admin)

### 🔍 Member Discovery
- **Advanced Search** by location, gym, and activity status
- **Member Profiles** with workout history and media
- **Active Workout Display** showing current scheduled sessions
- **Detailed User Information** including completed workouts count

### 💪 Workout Management
- **Schedule Workouts** with date, time, and type selection
- **Join Others' Workouts** and build connections
- **Workout Types**: Cardio, Strength Training, CrossFit, Yoga, Pilates, HIIT, etc.
- **Location-based Gym Selection**

### 📱 Social Features
- **In-app Chat System** for direct communication
- **Workout Media Upload** (photos and videos)
- **Real-time Messaging** between gym buddies
- **Community Sharing** of fitness achievements

### 🛠 Admin Features
- **Location Management** - Add/remove cities
- **Gym Management** - Add/remove gyms per location
- **Platform Statistics** - Users, workouts, locations, gyms
- **Content Moderation** capabilities

## 🚀 Technology Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **State Management**: React Context API
- **Routing**: React Router v6
- **Icons**: React Icons (Feather)
- **Notifications**: React Hot Toast
- **File Upload**: Supabase Storage

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd gym-buddy-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create environment variables:

```bash
# Create .env file in root directory
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the database setup script (provided in `/database/setup.sql`)

5. **Start the development server**
```bash
npm run dev
```

## 🗄️ Database Schema

### Core Tables
- **profiles_gym2024**: User profiles and settings
- **locations_gym2024**: Available cities/locations
- **gyms_gym2024**: Gym facilities per location
- **workouts_gym2024**: Scheduled workout sessions
- **workout_participants_gym2024**: Workout joiners/participants

### Social Features
- **chats_gym2024**: Chat conversations
- **chat_participants_gym2024**: Chat members
- **messages_gym2024**: Chat messages
- **workout_media_gym2024**: User-uploaded workout media

## 🔑 Key Features Explained

### Member Search & Discovery
Users can search for gym members based on:
- **Location**: Find people in their city
- **Gym**: Connect with members of the same gym
- **Active Workouts**: See who has upcoming sessions
- **Profile Information**: View workout history and achievements

### Workout Scheduling
- **Date & Time Selection**: Plan future workout sessions
- **Workout Type Categories**: Choose from 10+ workout types
- **Gym Selection**: Pick from location-specific gyms
- **Notes & Details**: Add additional workout information
- **Buddy System**: Allow others to join your workouts

### Media Sharing
- **Photo Uploads**: Share workout photos
- **Video Uploads**: Upload workout videos
- **File Management**: Organize and title your media
- **Public Gallery**: View other members' workout media

### Admin Dashboard
Administrators can:
- **Manage Locations**: Add/remove cities
- **Manage Gyms**: Add gyms to specific locations
- **View Statistics**: Monitor platform usage
- **Content Oversight**: Manage user-generated content

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional design
- **Smooth Animations**: Framer Motion transitions
- **Intuitive Navigation**: Easy-to-use menu system
- **Real-time Updates**: Live chat and notifications
- **Accessibility**: ARIA labels and keyboard navigation

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Authentication Required**: Protected routes and actions
- **Role-based Permissions**: Admin vs. user capabilities
- **Input Validation**: Client and server-side validation
- **File Upload Security**: Type and size restrictions

## 📱 Mobile Experience

- **Touch-friendly Interface**: Optimized for mobile devices
- **Responsive Grid Layouts**: Adapts to screen sizes
- **Mobile Navigation**: Bottom tab bar for easy access
- **Swipe Gestures**: Intuitive mobile interactions
- **Fast Loading**: Optimized performance

## 🚀 Deployment

The app can be deployed to:
- **Vercel** (recommended for React apps)
- **Netlify**
- **AWS Amplify**
- **Any static hosting service**

Make sure to set environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ for the fitness community**