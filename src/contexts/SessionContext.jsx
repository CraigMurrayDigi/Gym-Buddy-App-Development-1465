import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();

  // Demo session types
  const SESSION_TYPES = [
    {
      id: 'personal-training',
      name: 'Personal Training',
      description: 'One-on-one training session',
      basePrice: 75,
      duration: [30, 45, 60, 90, 120]
    },
    {
      id: 'fitness-assessment',
      name: 'Fitness Assessment',
      description: 'Initial fitness evaluation and goal setting',
      basePrice: 60,
      duration: [60, 90]
    },
    {
      id: 'nutrition-consultation',
      name: 'Nutrition Consultation',
      description: 'Personalized nutrition planning',
      basePrice: 50,
      duration: [30, 45, 60]
    },
    {
      id: 'group-training',
      name: 'Small Group Training',
      description: 'Train with 2-3 people (price per person)',
      basePrice: 45,
      duration: [45, 60, 90]
    }
  ];

  useEffect(() => {
    if (user) {
      fetchUserSessions();
    }
  }, [user]);

  const fetchUserSessions = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from Supabase
      // For now, we'll use demo data
      const demoSessions = [
        {
          id: 'session-1',
          trainerId: 'trainer-1',
          clientId: user.id,
          date: '2024-01-25',
          time: '10:00',
          duration: 60,
          sessionType: 'personal-training',
          status: 'confirmed',
          totalCost: 75,
          location: 'trainer-location',
          notes: 'Focus on upper body strength',
          createdAt: new Date().toISOString(),
          trainerInfo: {
            name: 'Marcus Rodriguez',
            businessName: 'Strength & Performance',
            hourlyRate: 75
          }
        }
      ];

      setSessions(demoSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const bookSession = async (sessionData) => {
    setLoading(true);
    try {
      // Validate session data
      if (!sessionData.trainerId || !sessionData.date || !sessionData.time) {
        throw new Error('Missing required session information');
      }

      // Check if trainer is available
      const isAvailable = await checkTrainerAvailability(
        sessionData.trainerId,
        sessionData.date,
        sessionData.time,
        sessionData.duration
      );

      if (!isAvailable) {
        throw new Error('Trainer is not available at the selected time');
      }

      // Create session booking
      const newSession = {
        id: `session-${Date.now()}`,
        ...sessionData,
        clientId: user.id,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // In a real app, this would save to Supabase
      setSessions(prev => [...prev, newSession]);
      
      // Send notification to trainer (in a real app)
      await notifyTrainer(newSession);

      toast.success('Session booking request sent to trainer!');
      return { session: newSession, error: null };

    } catch (error) {
      console.error('Error booking session:', error);
      toast.error(error.message || 'Failed to book session');
      return { session: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const checkTrainerAvailability = async (trainerId, date, time, duration) => {
    try {
      // In a real app, this would check the trainer's calendar
      // For demo purposes, we'll assume availability
      const sessionDateTime = new Date(`${date}T${time}`);
      const now = new Date();
      
      // Check if it's in the future
      if (sessionDateTime <= now) {
        return false;
      }

      // Check business hours (9 AM - 8 PM)
      const hour = sessionDateTime.getHours();
      if (hour < 9 || hour > 20) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  const notifyTrainer = async (session) => {
    // In a real app, this would send a notification to the trainer
    console.log('Notifying trainer about new booking:', session);
  };

  const updateSessionStatus = async (sessionId, status, reason = '') => {
    setLoading(true);
    try {
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, status, updatedAt: new Date().toISOString() }
          : session
      ));

      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        // Notify the other party
        const message = status === 'confirmed' 
          ? 'Session confirmed!' 
          : status === 'cancelled'
          ? `Session cancelled. ${reason}`
          : `Session status updated to ${status}`;
        
        toast.success(message);
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating session status:', error);
      toast.error('Failed to update session status');
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const rescheduleSession = async (sessionId, newDate, newTime) => {
    setLoading(true);
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check availability for new time
      const isAvailable = await checkTrainerAvailability(
        session.trainerId,
        newDate,
        newTime,
        session.duration
      );

      if (!isAvailable) {
        throw new Error('Trainer is not available at the new time');
      }

      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, date: newDate, time: newTime, status: 'pending', updatedAt: new Date().toISOString() }
          : s
      ));

      toast.success('Reschedule request sent to trainer');
      return { error: null };

    } catch (error) {
      console.error('Error rescheduling session:', error);
      toast.error(error.message || 'Failed to reschedule session');
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const cancelSession = async (sessionId, reason = '') => {
    setLoading(true);
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check cancellation policy (24 hours notice)
      const sessionDateTime = new Date(`${session.date}T${session.time}`);
      const now = new Date();
      const hoursUntilSession = (sessionDateTime - now) / (1000 * 60 * 60);

      if (hoursUntilSession < 24) {
        const confirmCancel = window.confirm(
          'Cancelling with less than 24 hours notice may result in a cancellation fee. Continue?'
        );
        if (!confirmCancel) return { error: 'Cancellation aborted' };
      }

      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, status: 'cancelled', cancellationReason: reason, updatedAt: new Date().toISOString() }
          : s
      ));

      toast.success('Session cancelled successfully');
      return { error: null };

    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error(error.message || 'Failed to cancel session');
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getSessionsByStatus = (status) => {
    return sessions.filter(session => session.status === status);
  };

  const getUpcomingSessions = () => {
    const now = new Date();
    return sessions.filter(session => {
      const sessionDateTime = new Date(`${session.date}T${session.time}`);
      return sessionDateTime > now && session.status === 'confirmed';
    }).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
  };

  const getPastSessions = () => {
    const now = new Date();
    return sessions.filter(session => {
      const sessionDateTime = new Date(`${session.date}T${session.time}`);
      return sessionDateTime <= now;
    }).sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
  };

  const getSessionStats = () => {
    const total = sessions.length;
    const pending = sessions.filter(s => s.status === 'pending').length;
    const confirmed = sessions.filter(s => s.status === 'confirmed').length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const cancelled = sessions.filter(s => s.status === 'cancelled').length;
    
    const totalRevenue = sessions
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + (s.totalCost || 0), 0);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      totalRevenue
    };
  };

  const value = {
    sessions,
    loading,
    SESSION_TYPES,
    
    // Actions
    bookSession,
    updateSessionStatus,
    rescheduleSession,
    cancelSession,
    fetchUserSessions,
    
    // Getters
    getSessionsByStatus,
    getUpcomingSessions,
    getPastSessions,
    getSessionStats,
    
    // Utilities
    checkTrainerAvailability
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};