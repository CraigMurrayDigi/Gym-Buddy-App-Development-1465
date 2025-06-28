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

  // Demo users data
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
    // Check for existing session
    const checkSession = async () => {
      try {
        // Check for demo user in localStorage first
        const storedUser = localStorage.getItem('demo_user');
        if (storedUser) {
          console.log('Found demo user in localStorage');
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setLoading(false);
          return;
        }

        // Check Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
        } else if (session?.user) {
          console.log('Found existing Supabase session:', session.user.email);
          await fetchUserProfile(session.user.id, session.user.email);
        } else {
          console.log('No existing session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in via Supabase:', session.user.email);
        await fetchUserProfile(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out from Supabase');
        // Don't clear demo user here
        if (user && !DEMO_USERS[user.email]) {
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId, userEmail) => {
    try {
      console.log('Fetching profile for user:', userId, userEmail);
      const { data, error } = await supabase
        .from('profiles_gym2024')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        console.log('Profile found:', data);
        setUser(data);
      } else {
        console.log('No profile found, creating basic user object');
        const basicUser = {
          id: userId,
          email: userEmail,
          name: userEmail.split('@')[0] || 'User',
          location: '',
          gym: '',
          profile_complete: false,
          role: 'user',
          account_type: 'user'
        };
        setUser(basicUser);

        // Try to create profile in database
        try {
          console.log('Attempting to create profile in database');
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles_gym2024')
            .insert([basicUser])
            .select()
            .single();

          if (!insertError && newProfile) {
            console.log('Profile created successfully:', newProfile);
            setUser(newProfile);
          } else {
            console.log('Could not create profile in database, using local profile:', insertError);
          }
        } catch (insertError) {
          console.log('Could not create profile in database, using local profile:', insertError);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const basicUser = {
        id: userId,
        email: userEmail,
        name: userEmail.split('@')[0] || 'User',
        location: '',
        gym: '',
        profile_complete: false,
        role: 'user',
        account_type: 'user'
      };
      setUser(basicUser);
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      console.log('Signing up user:', email, 'Account type:', userData.account_type);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            account_type: userData.account_type || 'user'
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { user: null, error: error.message };
      }

      if (data.user) {
        console.log('User created:', data.user.email);
        // Create profile immediately for the new user
        const profileData = {
          id: data.user.id,
          email: data.user.email,
          name: userData.name,
          location: '',
          gym: '',
          profile_complete: false,
          role: 'user',
          account_type: userData.account_type || 'user'
        };

        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles_gym2024')
            .insert([profileData])
            .select()
            .single();

          if (!profileError && profile) {
            console.log('Profile created for new user:', profile);
            setUser(profile);

            // Handle different account types
            if (userData.account_type === 'gym_owner' && userData.gym_data) {
              try {
                const gymAccountData = {
                  user_id: data.user.id,
                  business_name: userData.gym_data.businessName,
                  business_email: userData.gym_data.businessEmail,
                  phone: userData.gym_data.phone,
                  address: userData.gym_data.address,
                  city: userData.gym_data.city,
                  state: userData.gym_data.state,
                  zip_code: userData.gym_data.zipCode,
                  website: userData.gym_data.website,
                  description: userData.gym_data.description,
                  verified: false
                };

                const { data: gymAccount, error: gymError } = await supabase
                  .from('gym_accounts_gym2024')
                  .insert([gymAccountData])
                  .select()
                  .single();

                if (gymError) {
                  console.error('Error creating gym account:', gymError);
                } else {
                  console.log('Gym account created:', gymAccount);
                }
              } catch (gymError) {
                console.error('Error creating gym account:', gymError);
              }
            } else if (userData.account_type === 'personal_trainer' && userData.trainer_data) {
              try {
                const trainerData = {
                  user_id: data.user.id,
                  business_name: userData.trainer_data.businessName,
                  specializations: userData.trainer_data.specializations,
                  certifications: userData.trainer_data.certifications,
                  experience_years: userData.trainer_data.experienceYears,
                  hourly_rate: userData.trainer_data.hourlyRate,
                  bio: userData.trainer_data.bio,
                  phone: userData.trainer_data.phone,
                  website: userData.trainer_data.website,
                  instagram: userData.trainer_data.instagram,
                  location: userData.trainer_data.location,
                  gym_affiliations: userData.trainer_data.gymAffiliations,
                  services_offered: userData.trainer_data.servicesOffered,
                  is_accepting_clients: userData.trainer_data.isAcceptingClients,
                  verified: false
                };

                const { data: trainerProfile, error: trainerError } = await supabase
                  .from('personal_trainers_gym2024')
                  .insert([trainerData])
                  .select()
                  .single();

                if (trainerError) {
                  console.error('Error creating trainer profile:', trainerError);
                } else {
                  console.log('Trainer profile created:', trainerProfile);
                }
              } catch (trainerError) {
                console.error('Error creating trainer profile:', trainerError);
              }
            }
          } else {
            console.log('Profile creation failed, using basic user data:', profileError);
            setUser(profileData);
          }
        } catch (profileError) {
          console.log('Profile creation failed, using basic user data:', profileError);
          setUser(profileData);
        }

        return { user: data.user, error: null };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { user: null, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('Attempting sign in for:', email);

      // Handle demo accounts
      if (DEMO_USERS[email]) {
        const demoUser = DEMO_USERS[email];
        // Check password for demo accounts
        const validPasswords = {
          'test@example.com': 'password123',
          'admin@gymbuddy.com': 'admin123',
          'moderator@gymbuddy.com': 'moderator123',
          'gym@example.com': 'gym123',
          'trainer@example.com': 'trainer123'
        };

        if (password === validPasswords[email]) {
          console.log('Demo account login successful:', email);
          setUser(demoUser);
          localStorage.setItem('demo_user', JSON.stringify(demoUser));
          return { user: demoUser, error: null };
        } else {
          return { user: null, error: 'Invalid password for demo account' };
        }
      }

      // Handle regular Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        return { user: null, error: error.message };
      }

      console.log('Sign in successful:', data.user?.email);
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
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
      console.error('Sign out error:', error);
      return { error: error.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (!user) return { user: null, error: 'No user logged in' };

      console.log('Updating profile:', profileData);
      
      // Update local user state immediately
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);

      // Update demo user in localStorage
      if (DEMO_USERS[user.email]) {
        localStorage.setItem('demo_user', JSON.stringify(updatedUser));
        return { user: updatedUser, error: null };
      }

      // Try to update in database for real users
      try {
        const { data, error } = await supabase
          .from('profiles_gym2024')
          .update(profileData)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          console.log('Database update failed, keeping local update:', error);
        } else {
          console.log('Profile updated in database:', data);
          setUser(data);
        }
      } catch (dbError) {
        console.log('Database unavailable, keeping local update');
      }

      return { user: updatedUser, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { user: null, error: error.message };
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
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};