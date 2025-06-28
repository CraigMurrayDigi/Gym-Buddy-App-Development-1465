import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestProvider } from '@questlabs/react-sdk';
import '@questlabs/react-sdk/dist/style.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { StripeProvider } from './contexts/StripeContext';
import questConfig from './config/questConfig';

// Pages
import LandingPage from './pages/LandingPage';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import WorkoutSchedule from './pages/WorkoutSchedule';
import FindBuddies from './pages/FindBuddies';
import SearchMembers from './pages/SearchMembers';
import MemberProfile from './pages/MemberProfile';
import UserProfile from './pages/UserProfile';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import MediaUpload from './pages/MediaUpload';
import AdminDashboard from './pages/AdminDashboard';
import GymDashboard from './pages/GymDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import GymDirectory from './pages/GymDirectory';
import GymDetails from './pages/GymDetails';

// Components
import LoadingSpinner from './components/LoadingSpinner';
import FeedbackButton from './components/FeedbackButton';

import './App.css';

function ProtectedRoute({ children, requireAuth = true, requireCompleteProfile = true }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/signin" replace />;
  }

  if (!requireAuth && user) {
    // Redirect based on account type when accessing public pages
    if (user.account_type === 'gym_owner') {
      return <Navigate to="/gym-dashboard" replace />;
    } else if (user.account_type === 'personal_trainer') {
      return <Navigate to="/trainer-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (requireAuth && requireCompleteProfile && user && !user.profile_complete) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  console.log('App render - User:', user?.email, 'Account Type:', user?.account_type, 'Loading:', loading, 'Initialized:', isInitialized);

  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const showFeedbackButton = user && (
    user.profile_complete ||
    window.location.hash.includes('/dashboard') ||
    window.location.hash.includes('/trainer-dashboard') ||
    window.location.hash.includes('/gym-dashboard') ||
    window.location.hash.includes('/profile') ||
    window.location.hash.includes('/schedule') ||
    window.location.hash.includes('/find-buddies') ||
    window.location.hash.includes('/chat') ||
    window.location.hash.includes('/search-members') ||
    window.location.hash.includes('/admin') ||
    window.location.hash.includes('/gym-directory') ||
    window.location.hash.includes('/gym/')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute requireAuth={false}>
              <LandingPage />
            </ProtectedRoute>
          } />
          
          <Route path="/signup" element={
            <ProtectedRoute requireAuth={false}>
              <SignUp />
            </ProtectedRoute>
          } />
          
          <Route path="/signin" element={
            <ProtectedRoute requireAuth={false}>
              <SignIn />
            </ProtectedRoute>
          } />
          
          <Route path="/profile-setup" element={
            <ProtectedRoute requireCompleteProfile={false}>
              <ProfileSetup />
            </ProtectedRoute>
          } />

          {/* User Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/schedule" element={
            <ProtectedRoute>
              <WorkoutSchedule />
            </ProtectedRoute>
          } />
          
          <Route path="/find-buddies" element={
            <ProtectedRoute>
              <FindBuddies />
            </ProtectedRoute>
          } />
          
          <Route path="/search-members" element={
            <ProtectedRoute>
              <SearchMembers />
            </ProtectedRoute>
          } />
          
          <Route path="/member/:memberId" element={
            <ProtectedRoute>
              <MemberProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/profile/:userId" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/chat/:buddyId?" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/upload-media" element={
            <ProtectedRoute>
              <MediaUpload />
            </ProtectedRoute>
          } />

          {/* Gym Directory Routes */}
          <Route path="/gym-directory" element={
            <ProtectedRoute>
              <GymDirectory />
            </ProtectedRoute>
          } />
          
          <Route path="/gym/:gymId" element={
            <ProtectedRoute>
              <GymDetails />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              {user?.role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to={
                  user?.account_type === 'gym_owner' 
                    ? '/gym-dashboard' 
                    : user?.account_type === 'personal_trainer'
                    ? '/trainer-dashboard'
                    : '/dashboard'
                } />
              )}
            </ProtectedRoute>
          } />

          {/* Gym Owner Routes */}
          <Route path="/gym-dashboard" element={
            <ProtectedRoute>
              {user?.account_type === 'gym_owner' ? (
                <GymDashboard />
              ) : (
                <Navigate to={
                  user?.account_type === 'personal_trainer'
                    ? '/trainer-dashboard'
                    : '/dashboard'
                } />
              )}
            </ProtectedRoute>
          } />

          {/* Personal Trainer Routes */}
          <Route path="/trainer-dashboard" element={
            <ProtectedRoute>
              {user?.account_type === 'personal_trainer' ? (
                <TrainerDashboard />
              ) : (
                <Navigate to={
                  user?.account_type === 'gym_owner'
                    ? '/gym-dashboard'
                    : '/dashboard'
                } />
              )}
            </ProtectedRoute>
          } />
        </Routes>
      </AnimatePresence>

      {/* Global Feedback Button - Only show on authenticated pages */}
      {showFeedbackButton && <FeedbackButton />}

      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <QuestProvider
      apiKey={questConfig.APIKEY}
      entityId={questConfig.ENTITYID}
      apiType="PRODUCTION"
    >
      <AuthProvider>
        <DataProvider>
          <StripeProvider>
            <Router>
              <AppContent />
            </Router>
          </StripeProvider>
        </DataProvider>
      </AuthProvider>
    </QuestProvider>
  );
}

export default App;