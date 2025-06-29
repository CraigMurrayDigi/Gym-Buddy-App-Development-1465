import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo users data (keep for demo accounts)
  const DEMO_USERS = {
    'test@example.com': {
      id: 'demo-user-12345',
      email: 'test@example.com',
      name: 'Demo User',
      location: 'New York',
      gym: 'Fitness First NYC',
      profile_complete: true,
      role: 'user',
      account_type: 'user',
      created_at: new Date().toISOString()
    },
    'admin@gymbuddy.com': {
      id: 'admin-user-12345',
      email: 'admin@gymbuddy.com',
      name: 'Admin User',
      location: 'New York',
      gym: 'Fitness First NYC',
      profile_complete: true,
      role: 'admin',
      account_type: 'user',
      created_at: new Date().toISOString()
    },
    'moderator@gymbuddy.com': {
      id: 'moderator-user-12345',
      email: 'moderator@gymbuddy.com',
      name: 'Moderator User',
      location: 'Los Angeles',
      gym: 'Gold\'s Gym Venice',
      profile_complete: true,
      role: 'moderator',
      account_type: 'user',
      created_at: new Date().toISOString()
    },
    'gym@example.com': {
      id: 'demo-gym-12345',
      email: 'gym@example.com',
      name: 'Gym Owner',
      location: 'New York',
      gym: 'Demo Fitness Center',
      profile_complete: true,
      role: 'user',
      account_type: 'gym_owner',
      created_at: new Date().toISOString(),
      gym_data: {
        businessName: 'Demo Fitness Center',
        businessEmail: 'gym@example.com',
        phone: '(555) 123-4567',
        address: '123 Fitness Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        website: 'https://demofitness.com',
        description: 'A modern fitness center with state-of-the-art equipment',
        verified: false
      }
    },
    'trainer@example.com': {
      id: 'demo-trainer-12345',
      email: 'trainer@example.com',
      name: 'Personal Trainer',
      location: 'New York',
      gym: 'Fitness First NYC',
      profile_complete: true,
      role: 'user',
      account_type: 'personal_trainer',
      created_at: new Date().toISOString(),
      trainer_data: {
        businessName: 'FitPro Training',
        specializations: ['Strength Training', 'Weight Loss'],
        certifications: ['NASM-CPT', 'CSCS'],
        experienceYears: 5,
        hourlyRate: 75.00,
        bio: 'Experienced personal trainer specializing in strength training and body transformation.',
        phone: '(555) 123-4567',
        location: 'New York',
        servicesOffered: ['Personal Training', 'Nutrition Coaching'],
        verified: false
      }
    }
  };

  useEffect(() => {
    checkSession();

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in via Supabase:', session.user.email);
        
        // Wait a moment for the database trigger to complete
        setTimeout(async () => {
          await fetchOrCreateUserProfile(session.user.id, session.user.email, session.user.user_metadata);
        }, 1000);
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out from Supabase');
        // Clear user unless it's a demo account
        if (user && !DEMO_USERS[user.email]) {
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      
      // Check for demo user in localStorage first
      const storedUser = localStorage.getItem('demo_user');
      if (storedUser) {
        console.log('📱 Found demo user in localStorage');
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setLoading(false);
        return;
      }

      // Check Supabase session
      console.log('🔍 Checking Supabase session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        setUser(null);
      } else if (session?.user) {
        console.log('✅ Found existing Supabase session for:', session.user.email);
        await fetchOrCreateUserProfile(session.user.id, session.user.email, session.user.user_metadata);
      } else {
        console.log('ℹ️ No existing session found');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Error checking session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrCreateUserProfile = async (userId, userEmail, userMetadata = {}) => {
    try {
      console.log('👤 Fetching/creating profile for:', userId, userEmail, userMetadata);
      
      // Try to fetch existing profile first
      console.log('🔍 Checking for existing profile...');
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles_gym2024')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error fetching profile:', fetchError);
        // Don't throw, continue to create profile
      }

      if (existingProfile) {
        console.log('✅ Existing profile found:', existingProfile.name);
        setUser(existingProfile);
        return existingProfile;
      }

      // Profile doesn't exist, create new one
      console.log('⚠️ No profile found, creating new profile for:', userEmail);
      
      const newProfileData = {
        id: userId,
        email: userEmail,
        name: userMetadata.name || userEmail.split('@')[0] || 'User',
        location: '',
        gym: '',
        profile_complete: false,
        role: 'user',
        account_type: userMetadata.account_type || 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('💾 Creating profile with data:', newProfileData);

      // Insert the new profile with detailed error handling
      const { data: createdProfile, error: createError } = await supabase
        .from('profiles_gym2024')
        .insert([newProfileData])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating profile:', createError);
        console.error('Create error details:', {
          message: createError.message,
          details: createError.details,
          hint: createError.hint,
          code: createError.code
        });
        
        // Try one more time with a simpler approach
        console.log('🔄 Retrying profile creation with minimal data...');
        const simpleProfile = {
          id: userId,
          email: userEmail,
          name: userMetadata.name || userEmail.split('@')[0] || 'User'
        };
        
        const { data: retryProfile, error: retryError } = await supabase
          .from('profiles_gym2024')
          .insert([simpleProfile])
          .select()
          .single();
          
        if (retryError) {
          console.error('❌ Retry also failed:', retryError);
          // Set user with local data as fallback
          console.log('⚠️ Using local profile data as fallback');
          setUser(newProfileData);
          return newProfileData;
        } else {
          console.log('✅ Profile created on retry:', retryProfile.name);
          setUser(retryProfile);
          return retryProfile;
        }
      } else {
        console.log('✅ Profile created successfully:', createdProfile.name);
        setUser(createdProfile);
        return createdProfile;
      }

    } catch (error) {
      console.error('❌ Error in fetchOrCreateUserProfile:', error);
      
      // Create basic user object as absolute fallback
      const fallbackUser = {
        id: userId,
        email: userEmail,
        name: userMetadata.name || userEmail.split('@')[0] || 'User',
        location: '',
        gym: '',
        profile_complete: false,
        role: 'user',
        account_type: userMetadata.account_type || 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('⚠️ Using fallback user data');
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      console.log('📝 Starting signup process for:', email, 'Account type:', userData.account_type);
      setLoading(true);

      // Validate inputs
      if (!email || !password || !userData.name) {
        throw new Error('Missing required fields');
      }

      const cleanEmail = email.toLowerCase().trim();
      
      // Check if Supabase is available
      if (!supabase) {
        throw new Error('Database connection not available');
      }

      // Test database connectivity before signup
      console.log('🧪 Testing database connectivity before signup...');
      try {
        const { error: testError } = await supabase
          .from('profiles_gym2024')
          .select('count', { count: 'exact', head: true });
        
        if (testError) {
          console.error('❌ Database test failed:', testError);
          // Continue anyway, might be permissions issue
        } else {
          console.log('✅ Database connectivity confirmed');
        }
      } catch (testErr) {
        console.error('❌ Database test error:', testErr);
        // Continue anyway
      }

      console.log('🔐 Creating Supabase auth user...');

      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: userData.name,
            account_type: userData.account_type || 'user'
          }
        }
      });

      if (authError) {
        console.error('❌ Supabase auth signup error:', authError);
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        console.error('❌ No user returned from signup');
        return { user: null, error: 'Failed to create user account' };
      }

      console.log('✅ Supabase auth user created:', authData.user.email);
      console.log('📧 User ID:', authData.user.id);
      console.log('👤 User metadata:', authData.user.user_metadata);

      // Important: Don't try to create profile manually here
      // Let the database trigger handle it, or the auth state change listener
      console.log('⏳ Waiting for database trigger or auth state change...');

      // The auth state change listener will handle profile creation
      return { user: authData.user, error: null };

    } catch (error) {
      console.error('❌ Signup process failed:', error);
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Attempting sign in for:', email);
      setLoading(true);

      const cleanEmail = email.toLowerCase().trim();

      // Handle demo accounts first
      if (DEMO_USERS[cleanEmail]) {
        const demoUser = DEMO_USERS[cleanEmail];
        const validPasswords = {
          'test@example.com': 'password123',
          'admin@gymbuddy.com': 'admin123',
          'moderator@gymbuddy.com': 'moderator123',
          'gym@example.com': 'gym123',
          'trainer@example.com': 'trainer123'
        };

        if (password === validPasswords[cleanEmail]) {
          console.log('✅ Demo account login successful:', cleanEmail);
          setUser(demoUser);
          localStorage.setItem('demo_user', JSON.stringify(demoUser));
          return { user: demoUser, error: null };
        } else {
          return { user: null, error: 'Invalid password for demo account' };
        }
      }

      // Handle real Supabase authentication
      console.log('🔍 Attempting Supabase authentication...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        console.error('❌ Supabase sign in error:', error);
        return { user: null, error: error.message };
      }

      if (data.user) {
        console.log('✅ Supabase sign in successful:', data.user.email);
        console.log('📧 User ID:', data.user.id);
        
        // Profile will be fetched by the auth state change listener
        // But let's also try to fetch it immediately
        await fetchOrCreateUserProfile(data.user.id, data.user.email, data.user.user_metadata);
        
        return { user: data.user, error: null };
      }

      return { user: null, error: 'Unknown sign in error' };
    } catch (error) {
      console.error('❌ Sign in process failed:', error);
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user');

      // Clear demo user
      if (user && DEMO_USERS[user.email]) {
        localStorage.removeItem('demo_user');
        setUser(null);
        return { error: null };
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
      }
      return { error };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return { error: error.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (!user) return { user: null, error: 'No user logged in' };

      console.log('📝 Updating profile for:', user.email);
      console.log('📝 Update data:', profileData);

      // Handle demo users
      if (DEMO_USERS[user.email]) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem('demo_user', JSON.stringify(updatedUser));
        console.log('✅ Demo user profile updated locally');
        return { user: updatedUser, error: null };
      }

      // For real users, update in database
      const updateData = {
        ...profileData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles_gym2024')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Database update error:', error);
        // Fall back to local update
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        return { user: updatedUser, error: null };
      }

      console.log('✅ Profile updated successfully in database');
      setUser(data);
      return { user: data, error: null };
    } catch (error) {
      console.error('❌ Update profile error:', error);
      return { user: null, error: error.message };
    }
  };

  const createGymAccount = async (userId, gymData) => {
    try {
      console.log('🏢 Creating gym account for user:', userId);
      
      const gymAccountData = {
        user_id: userId,
        business_name: gymData.businessName,
        business_email: gymData.businessEmail,
        phone: gymData.phone,
        address: gymData.address,
        city: gymData.city,
        state: gymData.state,
        zip_code: gymData.zipCode,
        website: gymData.website,
        description: gymData.description,
        verified: false,
        subscription_plan: 'basic',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: gymAccount, error: gymError } = await supabase
        .from('gym_accounts_gym2024')
        .insert([gymAccountData])
        .select()
        .single();

      if (gymError) {
        console.error('❌ Error creating gym account:', gymError);
      } else {
        console.log('✅ Gym account created:', gymAccount.business_name);
      }
    } catch (error) {
      console.error('❌ Error in createGymAccount:', error);
    }
  };

  const createTrainerAccount = async (userId, trainerData) => {
    try {
      console.log('🏋️ Creating trainer account for user:', userId);
      
      const trainerAccountData = {
        user_id: userId,
        business_name: trainerData.businessName,
        specializations: trainerData.specializations,
        certifications: trainerData.certifications,
        experience_years: trainerData.experienceYears,
        hourly_rate: trainerData.hourlyRate,
        bio: trainerData.bio,
        phone: trainerData.phone,
        website: trainerData.website,
        instagram: trainerData.instagram,
        location: trainerData.location,
        gym_affiliations: trainerData.gymAffiliations,
        services_offered: trainerData.servicesOffered,
        is_accepting_clients: trainerData.isAcceptingClients ?? true,
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: trainerAccount, error: trainerError } = await supabase
        .from('personal_trainers_gym2024')
        .insert([trainerAccountData])
        .select()
        .single();

      if (trainerError) {
        console.error('❌ Error creating trainer account:', trainerError);
      } else {
        console.log('✅ Trainer account created:', trainerAccount.business_name);
      }
    } catch (error) {
      console.error('❌ Error in createTrainerAccount:', error);
    }
  };

  const uploadMedia = async (file, bucket, folder = '') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        return { url: null, error: error.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Upload error:', error);
      return { url: null, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    uploadMedia,
    fetchUserProfile: fetchOrCreateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};