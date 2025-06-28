import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});

  const workoutTypes = [
    'Cardio',
    'Strength Training',
    'CrossFit',
    'Yoga',
    'Pilates',
    'HIIT',
    'Cycling',
    'Swimming',
    'Boxing',
    'Dance Fitness'
  ];

  // Demo data as fallback
  const DEMO_LOCATIONS = [
    { id: '1', name: 'New York' },
    { id: '2', name: 'Los Angeles' },
    { id: '3', name: 'Chicago' },
    { id: '4', name: 'Houston' },
    { id: '5', name: 'Phoenix' }
  ];

  const DEMO_GYMS = [
    { id: '1', name: 'Fitness First NYC', location_id: '1', locations_gym2024: { name: 'New York' } },
    { id: '2', name: 'Equinox Manhattan', location_id: '1', locations_gym2024: { name: 'New York' } },
    { id: '3', name: 'Planet Fitness Times Square', location_id: '1', locations_gym2024: { name: 'New York' } },
    { id: '4', name: 'Gold\'s Gym Venice', location_id: '2', locations_gym2024: { name: 'Los Angeles' } },
    { id: '5', name: 'Equinox West Hollywood', location_id: '2', locations_gym2024: { name: 'Los Angeles' } },
    { id: '6', name: '24 Hour Fitness', location_id: '2', locations_gym2024: { name: 'Los Angeles' } },
    { id: '7', name: 'LA Fitness Chicago', location_id: '3', locations_gym2024: { name: 'Chicago' } },
    { id: '8', name: 'Anytime Fitness Chicago', location_id: '3', locations_gym2024: { name: 'Chicago' } }
  ];

  const DEMO_WORKOUTS = [
    {
      id: '1',
      user_id: 'demo-user-12345',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      time: '18:00',
      type: 'Strength Training',
      gym: 'Fitness First NYC',
      location: 'New York',
      notes: 'Upper body focus - chest, shoulders, triceps',
      status: 'active',
      profiles_gym2024: { name: 'Demo User', location: 'New York', gym: 'Fitness First NYC' },
      workout_participants_gym2024: []
    },
    {
      id: '2',
      user_id: 'other-user-1',
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
      time: '07:00',
      type: 'Cardio',
      gym: 'Fitness First NYC',
      location: 'New York',
      notes: 'Morning cardio session - treadmill and bike',
      status: 'active',
      profiles_gym2024: { name: 'Sarah Johnson', location: 'New York', gym: 'Fitness First NYC' },
      workout_participants_gym2024: []
    },
    {
      id: '3',
      user_id: 'other-user-2',
      date: new Date(Date.now() + 259200000).toISOString().split('T')[0], // 3 days from now
      time: '19:30',
      type: 'Yoga',
      gym: 'Equinox Manhattan',
      location: 'New York',
      notes: 'Relaxing evening yoga session',
      status: 'active',
      profiles_gym2024: { name: 'Mike Chen', location: 'New York', gym: 'Equinox Manhattan' },
      workout_participants_gym2024: []
    }
  ];

  useEffect(() => {
    console.log('DataContext: Initializing, fetching all data');
    fetchLocations();
    fetchGyms();
    fetchWorkouts();
    fetchUsers();
    fetchChats();
  }, []);

  const fetchLocations = async () => {
    try {
      console.log('DataContext: Fetching locations...');
      
      // Always set demo data first to ensure page works
      setLocations(DEMO_LOCATIONS);
      
      if (!supabase || typeof supabase.from !== 'function') {
        console.log('DataContext: Supabase not configured, using demo data');
        return;
      }

      const { data, error } = await supabase
        .from('locations_gym2024')
        .select('*')
        .order('name');

      if (error) {
        console.error('DataContext: Error fetching locations:', error);
        if (error.code !== 'PGRST116') {
          // Keep demo data on error
          return;
        }
      }

      console.log('DataContext: Locations fetched from DB:', data?.length || 0);
      
      if (data && data.length > 0) {
        // Combine demo and DB data
        const combinedLocations = [...DEMO_LOCATIONS];
        data.forEach(dbLocation => {
          if (!combinedLocations.find(demo => demo.name === dbLocation.name)) {
            combinedLocations.push(dbLocation);
          }
        });
        setLocations(combinedLocations);
      }
    } catch (error) {
      console.error('DataContext: Error in fetchLocations:', error);
      // Keep demo data on error
    }
  };

  const fetchGyms = async () => {
    try {
      console.log('DataContext: Fetching gyms...');
      
      // Always set demo data first to ensure page works
      setGyms(DEMO_GYMS);
      
      if (!supabase || typeof supabase.from !== 'function') {
        console.log('DataContext: Supabase not configured, using demo data');
        return;
      }

      const { data, error } = await supabase
        .from('gyms_gym2024')
        .select(`
          *,
          locations_gym2024(name)
        `)
        .order('name');

      if (error) {
        console.error('DataContext: Error fetching gyms:', error);
        if (error.code !== 'PGRST116') {
          // Keep demo data on error
          return;
        }
      }

      console.log('DataContext: Gyms fetched from DB:', data?.length || 0);
      
      if (data && data.length > 0) {
        // Combine demo and DB data
        const combinedGyms = [...DEMO_GYMS];
        data.forEach(dbGym => {
          if (!combinedGyms.find(demo => demo.name === dbGym.name)) {
            combinedGyms.push(dbGym);
          }
        });
        setGyms(combinedGyms);
      }
    } catch (error) {
      console.error('DataContext: Error in fetchGyms:', error);
      // Keep demo data on error
    }
  };

  const fetchWorkouts = async () => {
    try {
      console.log('DataContext: Fetching workouts...');
      
      // Always set demo data first
      setWorkouts(DEMO_WORKOUTS);
      
      if (!supabase || typeof supabase.from !== 'function') {
        console.log('DataContext: Supabase not configured, using demo data');
        return;
      }

      const { data, error } = await supabase
        .from('workouts_gym2024')
        .select(`
          *,
          profiles_gym2024(name, location, gym),
          workout_participants_gym2024(profiles_gym2024(id, name))
        `)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        console.error('DataContext: Error fetching workouts:', error);
        if (error.code !== 'PGRST116') {
          return;
        }
      }

      console.log('DataContext: Workouts fetched from DB:', data?.length || 0);
      
      if (data && data.length > 0) {
        // Combine with demo data
        setWorkouts([...DEMO_WORKOUTS, ...data]);
      }
    } catch (error) {
      console.error('DataContext: Error in fetchWorkouts:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      if (!supabase || typeof supabase.from !== 'function') {
        setUsers([]);
        return;
      }

      const { data, error } = await supabase
        .from('profiles_gym2024')
        .select('*')
        .eq('role', 'user')
        .order('name');

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('DataContext: Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchChats = async () => {
    try {
      if (!supabase || typeof supabase.from !== 'function') {
        setChats([]);
        return;
      }

      const { data, error } = await supabase
        .from('chats_gym2024')
        .select(`
          *,
          chat_participants_gym2024(profiles_gym2024(id, name)),
          messages_gym2024(content, created_at, sender_id)
        `)
        .order('updated_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setChats(data || []);
    } catch (error) {
      console.error('DataContext: Error fetching chats:', error);
      setChats([]);
    }
  };

  const searchMembers = async (filters) => {
    try {
      if (!supabase || typeof supabase.from !== 'function') {
        return { data: [], error: null };
      }

      let query = supabase
        .from('profiles_gym2024')
        .select(`
          *,
          workouts_gym2024!workouts_gym2024_user_id_fkey(
            id, date, time, type, status
          ),
          workout_media_gym2024(url, type, title)
        `)
        .eq('role', 'user');

      if (filters.location) {
        query = query.eq('location', filters.location);
      }

      if (filters.gym) {
        query = query.eq('gym', filters.gym);
      }

      if (filters.hasActiveWorkout) {
        query = query.gte('workouts_gym2024.date', new Date().toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('DataContext: Search error:', error);
      return { data: [], error: error.message };
    }
  };

  const addWorkout = async (workoutData) => {
    try {
      console.log('DataContext: Adding workout:', workoutData);
      
      // Add to local state immediately for demo
      const newWorkout = {
        id: Date.now().toString(),
        ...workoutData,
        status: 'active',
        created_at: new Date().toISOString(),
        profiles_gym2024: {
          name: workoutData.userName || 'User',
          location: workoutData.location,
          gym: workoutData.gym
        },
        workout_participants_gym2024: []
      };

      setWorkouts(prev => [newWorkout, ...prev]);

      // Try to save to database
      if (supabase && typeof supabase.from === 'function') {
        try {
          const { data, error } = await supabase
            .from('workouts_gym2024')
            .insert([{
              user_id: workoutData.user_id,
              date: workoutData.date,
              time: workoutData.time,
              type: workoutData.type,
              gym: workoutData.gym,
              location: workoutData.location,
              notes: workoutData.notes
            }])
            .select()
            .single();

          if (!error && data) {
            console.log('DataContext: Workout saved to database:', data);
            setWorkouts(prev => prev.map(w => w.id === newWorkout.id ? data : w));
          }
        } catch (dbError) {
          console.log('DataContext: Database save failed, keeping local workout');
        }
      }

      return { workout: newWorkout, error: null };
    } catch (error) {
      console.error('DataContext: Add workout error:', error);
      return { workout: null, error: error.message };
    }
  };

  const joinWorkout = async (workoutId, userId) => {
    try {
      // Update local state immediately
      setWorkouts(prev => prev.map(workout => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            workout_participants_gym2024: [
              ...workout.workout_participants_gym2024,
              { profiles_gym2024: { id: userId, name: 'User' } }
            ]
          };
        }
        return workout;
      }));

      // Try to save to database
      if (supabase && typeof supabase.from === 'function') {
        try {
          const { error } = await supabase
            .from('workout_participants_gym2024')
            .insert([{ workout_id: workoutId, user_id: userId }]);

          if (error) {
            console.log('DataContext: Database join failed, keeping local update');
          }
        } catch (dbError) {
          console.log('DataContext: Database unavailable, keeping local update');
        }
      }

      return { error: null };
    } catch (error) {
      console.error('DataContext: Join workout error:', error);
      return { error: error.message };
    }
  };

  const startChat = async (participantIds) => {
    try {
      const newChat = {
        id: Date.now().toString(),
        type: 'direct',
        created_at: new Date().toISOString(),
        participants: participantIds.map(id => ({ id, name: 'User' }))
      };

      setChats(prev => [newChat, ...prev]);

      if (supabase && typeof supabase.from === 'function') {
        try {
          const { data: chat, error: chatError } = await supabase
            .from('chats_gym2024')
            .insert([{ type: 'direct' }])
            .select()
            .single();

          if (!chatError && chat) {
            const participants = participantIds.map(userId => ({
              chat_id: chat.id,
              user_id: userId
            }));

            await supabase
              .from('chat_participants_gym2024')
              .insert(participants);
          }
        } catch (dbError) {
          console.log('DataContext: Database chat creation failed, keeping local chat');
        }
      }

      return { chat: newChat, error: null };
    } catch (error) {
      console.error('DataContext: Start chat error:', error);
      return { chat: null, error: error.message };
    }
  };

  const sendMessage = async (chatId, senderId, content) => {
    try {
      const newMessage = {
        id: Date.now().toString(),
        chat_id: chatId,
        sender_id: senderId,
        content,
        created_at: new Date().toISOString()
      };

      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), newMessage]
      }));

      if (supabase && typeof supabase.from === 'function') {
        try {
          await supabase
            .from('messages_gym2024')
            .insert([{ chat_id: chatId, sender_id: senderId, content }]);

          await supabase
            .from('chats_gym2024')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', chatId);
        } catch (dbError) {
          console.log('DataContext: Database message failed, keeping local message');
        }
      }

      return { error: null };
    } catch (error) {
      console.error('DataContext: Send message error:', error);
      return { error: error.message };
    }
  };

  const uploadWorkoutMedia = async (userId, file, title, type) => {
    try {
      if (!supabase || typeof supabase.storage !== 'object') {
        return { media: null, error: 'Supabase storage not configured' };
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `workout-media/${userId}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gym-buddy-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gym-buddy-media')
        .getPublicUrl(fileName);

      // Save media record to database
      const { data, error } = await supabase
        .from('workout_media_gym2024')
        .insert([{
          user_id: userId,
          url: publicUrl,
          title,
          type,
          file_name: fileName
        }])
        .select()
        .single();

      if (error) throw error;

      return { media: data, error: null };
    } catch (error) {
      console.error('DataContext: Upload media error:', error);
      return { media: null, error: error.message };
    }
  };

  const getWorkoutStats = async () => {
    try {
      if (!supabase || typeof supabase.from !== 'function') {
        return {
          totalUsers: 1,
          totalWorkouts: DEMO_WORKOUTS.length,
          totalLocations: DEMO_LOCATIONS.length,
          totalGyms: DEMO_GYMS.length,
          error: null
        };
      }

      const [usersResult, workoutsResult, locationsResult, gymsResult] = await Promise.all([
        supabase.from('profiles_gym2024').select('id', { count: 'exact' }).eq('role', 'user'),
        supabase.from('workouts_gym2024').select('id', { count: 'exact' }),
        supabase.from('locations_gym2024').select('id', { count: 'exact' }),
        supabase.from('gyms_gym2024').select('id', { count: 'exact' })
      ]);

      return {
        totalUsers: usersResult.count || 1,
        totalWorkouts: workoutsResult.count || DEMO_WORKOUTS.length,
        totalLocations: locationsResult.count || DEMO_LOCATIONS.length,
        totalGyms: gymsResult.count || DEMO_GYMS.length,
        error: null
      };
    } catch (error) {
      console.error('DataContext: Get stats error:', error);
      return {
        totalUsers: 1,
        totalWorkouts: DEMO_WORKOUTS.length,
        totalLocations: DEMO_LOCATIONS.length,
        totalGyms: DEMO_GYMS.length,
        error: error.message
      };
    }
  };

  const value = {
    locations,
    gyms,
    workouts,
    users,
    chats,
    messages,
    workoutTypes,
    searchMembers,
    addWorkout,
    joinWorkout,
    startChat,
    sendMessage,
    uploadWorkoutMedia,
    getWorkoutStats,
    fetchLocations,
    fetchGyms,
    fetchWorkouts,
    fetchUsers,
    fetchChats
  };

  console.log('DataContext: Providing context with data:', {
    locationsCount: locations.length,
    gymsCount: gyms.length,
    workoutsCount: workouts.length
  });

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};