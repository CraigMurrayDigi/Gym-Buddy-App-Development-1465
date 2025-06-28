import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import SessionCard from '../components/SessionCard';
import SessionBookingModal from '../components/SessionBookingModal';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiUsers, FiDollarSign, FiPlus, FiFilter, FiSearch } = FiIcons;

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const { user } = useAuth();

  // Demo sessions data
  const DEMO_SESSIONS = [
    {
      id: 'session-1',
      date: '2024-01-25',
      time: '10:00',
      duration: 60,
      sessionType: 'Personal Training',
      status: 'confirmed',
      clientName: 'Sarah Johnson',
      trainerName: 'Marcus Rodriguez',
      location: 'Trainer Location',
      totalCost: 85,
      notes: 'Focus on upper body strength and form correction'
    },
    {
      id: 'session-2',
      date: '2024-01-24',
      time: '14:00',
      duration: 45,
      sessionType: 'Fitness Assessment',
      status: 'pending',
      clientName: 'Mike Chen',
      trainerName: 'Emily Davis',
      location: 'Client Location',
      totalCost: 60,
      notes: 'Initial assessment for new client'
    },
    {
      id: 'session-3',
      date: '2024-01-20',
      time: '16:00',
      duration: 60,
      sessionType: 'Personal Training',
      status: 'completed',
      clientName: 'Lisa Rodriguez',
      trainerName: 'David Thompson',
      location: 'Trainer Location',
      totalCost: 80,
      notes: 'Great progress on deadlift form'
    }
  ];

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, selectedTab, statusFilter, searchTerm]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSessions(DEMO_SESSIONS);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = [...sessions];

    // Filter by tab
    const now = new Date();
    if (selectedTab === 'upcoming') {
      filtered = filtered.filter(session => 
        new Date(`${session.date}T${session.time}`) >= now
      );
    } else if (selectedTab === 'past') {
      filtered = filtered.filter(session => 
        new Date(`${session.date}T${session.time}`) < now
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(session =>
        session.clientName?.toLowerCase().includes(searchLower) ||
        session.trainerName?.toLowerCase().includes(searchLower) ||
        session.sessionType?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredSessions(filtered);
  };

  const handleSessionAction = async (action, session) => {
    try {
      switch (action) {
        case 'accept':
          setSessions(prev => prev.map(s => 
            s.id === session.id ? { ...s, status: 'confirmed' } : s
          ));
          toast.success('Session accepted');
          break;
        
        case 'decline':
          setSessions(prev => prev.map(s => 
            s.id === session.id ? { ...s, status: 'cancelled' } : s
          ));
          toast.success('Session declined');
          break;
        
        case 'cancel':
          if (window.confirm('Are you sure you want to cancel this session?')) {
            setSessions(prev => prev.map(s => 
              s.id === session.id ? { ...s, status: 'cancelled' } : s
            ));
            toast.success('Session cancelled');
          }
          break;
        
        case 'message':
          toast.success(`Opening chat with ${user?.account_type === 'personal_trainer' ? session.clientName : session.trainerName}`);
          break;
        
        case 'reschedule':
          toast.success('Reschedule feature coming soon');
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action} session`);
    }
  };

  const getStats = () => {
    const upcoming = sessions.filter(s => new Date(`${s.date}T${s.time}`) >= new Date()).length;
    const pending = sessions.filter(s => s.status === 'pending').length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const totalRevenue = sessions
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + (s.totalCost || 0), 0);

    return { upcoming, pending, completed, totalRevenue };
  };

  const stats = getStats();

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: sessions.filter(s => new Date(`${s.date}T${s.time}`) >= new Date()).length },
    { id: 'past', label: 'Past', count: sessions.filter(s => new Date(`${s.date}T${s.time}`) < new Date()).length },
    { id: 'all', label: 'All Sessions', count: sessions.length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <SafeIcon icon={FiCalendar} className="text-4xl text-blue-600 mb-4 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Management</h1>
          <p className="text-gray-600">Manage your training sessions and bookings</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <SafeIcon icon={FiCalendar} className="text-3xl text-blue-600 mb-2 mx-auto" />
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <div className="text-gray-600">Upcoming Sessions</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <SafeIcon icon={FiClock} className="text-3xl text-yellow-600 mb-2 mx-auto" />
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-gray-600">Pending Approval</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <SafeIcon icon={FiUsers} className="text-3xl text-green-600 mb-2 mx-auto" />
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-gray-600">Completed</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <SafeIcon icon={FiDollarSign} className="text-3xl text-purple-600 mb-2 mx-auto" />
            <div className="text-2xl font-bold text-purple-600">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-gray-600">Total Revenue</div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    selectedTab === tab.id 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or session type..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <SafeIcon icon={FiFilter} className="absolute left-3 top-3 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {user?.account_type !== 'personal_trainer' && (
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiPlus} />
                <span>Book Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sessions...</p>
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                userType={user?.account_type === 'personal_trainer' ? 'trainer' : 'client'}
                onAccept={(session) => handleSessionAction('accept', session)}
                onDecline={(session) => handleSessionAction('decline', session)}
                onCancel={(session) => handleSessionAction('cancel', session)}
                onMessage={(session) => handleSessionAction('message', session)}
                onReschedule={(session) => handleSessionAction('reschedule', session)}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <SafeIcon icon={FiCalendar} className="text-6xl text-gray-300 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sessions Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria.' 
                : 'No sessions scheduled yet.'}
            </p>
            {user?.account_type !== 'personal_trainer' && (
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Book Your First Session
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <SessionBookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          trainer={selectedTrainer}
          onBookingComplete={(booking) => {
            // Add new booking to sessions
            setSessions(prev => [...prev, { ...booking, id: `session-${Date.now()}` }]);
            setShowBookingModal(false);
          }}
        />
      )}
    </div>
  );
};

export default SessionManagement;