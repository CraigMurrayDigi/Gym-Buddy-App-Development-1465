import supabase from './supabase';

/**
 * Safely run a Supabase query with proper error handling
 * @param {string} query - SQL query to execute
 * @returns {Promise<any>} - Query result or throws error
 */
export const runSupabaseQuery = async (query) => {
  try {
    console.log('Supabase Query:', query);
    
    if (!supabase || typeof supabase.rpc !== 'function') {
      throw new Error('Supabase client not available');
    }
    
    // Use Supabase RPC to execute raw SQL
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_query: query 
    });
    
    if (error) {
      console.error('Supabase Query Error:', error);
      throw new Error(error.message || 'Database query failed');
    }
    
    console.log('Supabase Query Result:', data);
    return data;
  } catch (error) {
    console.error('runSupabaseQuery Error:', error);
    throw error;
  }
};

/**
 * Get Supabase credentials and connection status
 * @returns {Promise<object>} - Connection info and credentials
 */
export const getSupabaseCredentials = async () => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('profiles_gym2024')
      .select('count')
      .limit(1);
    
    return {
      connected: !error,
      error: error?.message,
      url: supabase.supabaseUrl,
      key: supabase.supabaseKey?.substring(0, 20) + '...',
      testResult: data
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      url: null,
      key: null
    };
  }
};

/**
 * Connect to Supabase project with validation
 * @param {string} organizationNameOrId - Organization name or ID
 * @param {string} projectNameOrId - Project name or ID  
 * @returns {Promise<object>} - Connection result
 */
export const connectSupabaseProject = async (organizationNameOrId, projectNameOrId) => {
  try {
    // This would typically validate and connect to a specific Supabase project
    // For now, we'll return the current connection status
    const credentials = await getSupabaseCredentials();
    
    if (credentials.connected) {
      return {
        success: true,
        message: 'Already connected to Supabase project',
        projectId: projectNameOrId,
        organizationId: organizationNameOrId,
        credentials
      };
    } else {
      throw new Error('Failed to connect to Supabase project');
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};