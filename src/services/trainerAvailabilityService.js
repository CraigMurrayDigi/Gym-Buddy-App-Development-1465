import supabase from '../lib/supabase';

class TrainerAvailabilityService {
  // Get trainer's weekly availability
  async getTrainerAvailability(trainerId) {
    try {
      const { data, error } = await supabase
        .from('trainer_availability_gym2024')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;

      // Group by day of week
      const availabilityByDay = {};
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

      // Initialize all days
      dayNames.forEach(day => {
        availabilityByDay[day] = [];
      });

      // Group availability slots by day
      data?.forEach(slot => {
        const dayName = dayNames[slot.day_of_week];
        availabilityByDay[dayName].push({
          id: slot.id,
          startTime: slot.start_time,
          endTime: slot.end_time,
          available: slot.is_available,
          booked: false // Will be determined by checking bookings
        });
      });

      return { data: availabilityByDay, error: null };
    } catch (error) {
      console.error('Error fetching trainer availability:', error);
      return { data: null, error: error.message };
    }
  }

  // Get trainer availability for a specific date with booking status
  async getTrainerAvailabilityForDate(trainerId, date) {
    try {
      const { data, error } = await supabase
        .rpc('get_trainer_availability_for_date', {
          p_trainer_id: trainerId,
          p_date: date
        });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching trainer availability for date:', error);
      return { data: [], error: error.message };
    }
  }

  // Save trainer's availability
  async saveTrainerAvailability(trainerId, availabilityData) {
    try {
      // First, delete existing availability for this trainer
      const { error: deleteError } = await supabase
        .from('trainer_availability_gym2024')
        .delete()
        .eq('trainer_id', trainerId);

      if (deleteError) throw deleteError;

      // Prepare data for insertion
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const insertData = [];

      Object.entries(availabilityData).forEach(([dayName, slots]) => {
        const dayOfWeek = dayNames.indexOf(dayName.toLowerCase());
        if (dayOfWeek === -1) return;

        slots.forEach(slot => {
          insertData.push({
            trainer_id: trainerId,
            day_of_week: dayOfWeek,
            start_time: slot.startTime,
            end_time: slot.endTime,
            is_available: slot.available
          });
        });
      });

      // Insert new availability
      if (insertData.length > 0) {
        const { data, error } = await supabase
          .from('trainer_availability_gym2024')
          .insert(insertData)
          .select();

        if (error) throw error;
        return { data, error: null };
      }

      return { data: [], error: null };
    } catch (error) {
      console.error('Error saving trainer availability:', error);
      return { data: null, error: error.message };
    }
  }

  // Book a session
  async bookSession(trainerId, clientId, bookingDate, startTime, endTime, hourlyRate) {
    try {
      // Check for conflicts
      const { data: conflictCheck } = await supabase
        .rpc('check_booking_conflict', {
          p_trainer_id: trainerId,
          p_booking_date: bookingDate,
          p_start_time: startTime,
          p_end_time: endTime
        });

      if (conflictCheck) {
        throw new Error('This time slot is already booked');
      }

      // Calculate session duration and total amount
      const startDateTime = new Date(`2000-01-01T${startTime}`);
      const endDateTime = new Date(`2000-01-01T${endTime}`);
      const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
      const totalAmount = durationHours * hourlyRate;

      // Create booking
      const { data, error } = await supabase
        .from('trainer_bookings_gym2024')
        .insert([{
          trainer_id: trainerId,
          client_id: clientId,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          total_amount: totalAmount,
          status: 'confirmed'
        }])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error booking session:', error);
      return { data: null, error: error.message };
    }
  }

  // Get trainer's bookings
  async getTrainerBookings(trainerId, startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('trainer_bookings_gym2024')
        .select(`
          *,
          client:profiles_gym2024!trainer_bookings_gym2024_client_id_fkey(
            id, name, email
          )
        `)
        .eq('trainer_id', trainerId)
        .order('booking_date')
        .order('start_time');

      if (startDate) {
        query = query.gte('booking_date', startDate);
      }
      if (endDate) {
        query = query.lte('booking_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching trainer bookings:', error);
      return { data: [], error: error.message };
    }
  }

  // Get client's bookings
  async getClientBookings(clientId) {
    try {
      const { data, error } = await supabase
        .from('trainer_bookings_gym2024')
        .select(`
          *,
          trainer:personal_trainers_gym2024!trainer_bookings_gym2024_trainer_id_fkey(
            id, business_name, hourly_rate,
            user:profiles_gym2024!personal_trainers_gym2024_user_id_fkey(name)
          )
        `)
        .eq('client_id', clientId)
        .order('booking_date', { ascending: false })
        .order('start_time');

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching client bookings:', error);
      return { data: [], error: error.message };
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId, status, trainerId = null) {
    try {
      let query = supabase
        .from('trainer_bookings_gym2024')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      // If trainerId provided, ensure trainer can only update their own bookings
      if (trainerId) {
        query = query.eq('trainer_id', trainerId);
      }

      const { data, error } = await query.select().single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating booking status:', error);
      return { data: null, error: error.message };
    }
  }

  // Get trainer profile with ratings
  async getTrainerProfile(trainerId) {
    try {
      // Get trainer profile
      const { data: trainerData, error: trainerError } = await supabase
        .from('personal_trainers_gym2024')
        .select(`
          *,
          user:profiles_gym2024!personal_trainers_gym2024_user_id_fkey(
            name, email
          )
        `)
        .eq('id', trainerId)
        .single();

      if (trainerError) throw trainerError;

      // Get ratings
      const { data: ratingData } = await supabase
        .rpc('calculate_trainer_rating', { p_trainer_id: trainerId });

      const rating = ratingData?.[0] || { average_rating: 0, review_count: 0 };

      return {
        data: {
          ...trainerData,
          rating: parseFloat(rating.average_rating),
          reviewCount: rating.review_count
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching trainer profile:', error);
      return { data: null, error: error.message };
    }
  }

  // Add trainer review
  async addTrainerReview(trainerId, clientId, bookingId, rating, comment) {
    try {
      const { data, error } = await supabase
        .from('trainer_reviews_gym2024')
        .insert([{
          trainer_id: trainerId,
          client_id: clientId,
          booking_id: bookingId,
          rating,
          comment
        }])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error adding trainer review:', error);
      return { data: null, error: error.message };
    }
  }

  // Get trainer reviews
  async getTrainerReviews(trainerId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('trainer_reviews_gym2024')
        .select(`
          *,
          client:profiles_gym2024!trainer_reviews_gym2024_client_id_fkey(
            name
          )
        `)
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching trainer reviews:', error);
      return { data: [], error: error.message };
    }
  }
}

export default new TrainerAvailabilityService();