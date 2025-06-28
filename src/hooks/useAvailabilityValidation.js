import { useState, useCallback } from 'react';

export const useAvailabilityValidation = () => {
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);

  const validateTimeSlot = useCallback((slot, daySlots, slotId = null) => {
    const validationErrors = [];
    const validationWarnings = [];

    // Check if end time is after start time
    if (slot.startTime >= slot.endTime) {
      validationErrors.push({
        type: 'time_order',
        slotId,
        title: 'Invalid Time Range',
        description: 'End time must be after start time',
        suggestion: 'Adjust the end time to be later than the start time',
        fixable: true,
        fix: { endTime: addHour(slot.startTime) }
      });
    }

    // Check for overlapping slots
    const overlapping = daySlots.find(existingSlot => {
      if (existingSlot.id === slotId) return false;
      
      return (
        (slot.startTime >= existingSlot.startTime && slot.startTime < existingSlot.endTime) ||
        (slot.endTime > existingSlot.startTime && slot.endTime <= existingSlot.endTime) ||
        (slot.startTime <= existingSlot.startTime && slot.endTime >= existingSlot.endTime)
      );
    });

    if (overlapping) {
      validationErrors.push({
        type: 'overlap',
        slotId,
        title: 'Time Slot Overlap',
        description: `Overlaps with slot ${formatTime(overlapping.startTime)} - ${formatTime(overlapping.endTime)}`,
        suggestion: 'Adjust the time to avoid overlap',
        fixable: false
      });
    }

    // Check for very short slots (less than 30 minutes)
    const duration = getSlotDuration(slot.startTime, slot.endTime);
    if (duration < 30) {
      validationWarnings.push({
        type: 'short_duration',
        slotId,
        title: 'Short Time Slot',
        description: `Duration is only ${duration} minutes`,
        suggestion: 'Consider extending the slot to at least 30 minutes'
      });
    }

    // Check for very long slots (more than 3 hours)
    if (duration > 180) {
      validationWarnings.push({
        type: 'long_duration',
        slotId,
        title: 'Long Time Slot',
        description: `Duration is ${Math.floor(duration / 60)} hours ${duration % 60} minutes`,
        suggestion: 'Consider breaking this into smaller slots'
      });
    }

    // Check for unusual hours (before 5 AM or after 10 PM)
    const startHour = parseInt(slot.startTime.split(':')[0]);
    const endHour = parseInt(slot.endTime.split(':')[0]);
    
    if (startHour < 5 || endHour > 22) {
      validationWarnings.push({
        type: 'unusual_hours',
        slotId,
        title: 'Unusual Hours',
        description: 'Slot is outside typical training hours (5 AM - 10 PM)',
        suggestion: 'Verify this timing is intentional'
      });
    }

    return { errors: validationErrors, warnings: validationWarnings };
  }, []);

  const validateFullSchedule = useCallback((availability) => {
    const allErrors = [];
    const allWarnings = [];

    Object.entries(availability).forEach(([dayId, slots]) => {
      slots.forEach(slot => {
        const { errors: slotErrors, warnings: slotWarnings } = validateTimeSlot(
          slot, 
          slots, 
          slot.id
        );
        allErrors.push(...slotErrors);
        allWarnings.push(...slotWarnings);
      });

      // Check for day-specific issues
      if (slots.length === 0) {
        allWarnings.push({
          type: 'no_availability',
          dayId,
          title: `No availability on ${dayId}`,
          description: 'Consider adding some time slots for this day'
        });
      }

      // Check for gaps in schedule
      const sortedSlots = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
      for (let i = 0; i < sortedSlots.length - 1; i++) {
        const gap = getTimeDifference(sortedSlots[i].endTime, sortedSlots[i + 1].startTime);
        if (gap > 240) { // More than 4 hours
          allWarnings.push({
            type: 'large_gap',
            dayId,
            title: `Large gap on ${dayId}`,
            description: `${Math.floor(gap / 60)} hour gap between ${formatTime(sortedSlots[i].endTime)} and ${formatTime(sortedSlots[i + 1].startTime)}`,
            suggestion: 'Consider adding slots to fill this gap'
          });
        }
      }
    });

    setErrors(allErrors);
    setWarnings(allWarnings);

    return { errors: allErrors, warnings: allWarnings, isValid: allErrors.length === 0 };
  }, [validateTimeSlot]);

  const fixError = useCallback((error, updateFunction) => {
    if (error.fixable && error.fix) {
      updateFunction(error.slotId, error.fix);
      setErrors(prev => prev.filter(e => e !== error));
    }
  }, []);

  const dismissWarning = useCallback((warningIndex) => {
    setWarnings(prev => prev.filter((_, index) => index !== warningIndex));
  }, []);

  const clearValidation = useCallback(() => {
    setErrors([]);
    setWarnings([]);
  }, []);

  return {
    errors,
    warnings,
    validateTimeSlot,
    validateFullSchedule,
    fixError,
    dismissWarning,
    clearValidation
  };
};

// Utility functions
const addHour = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const newHour = hours + 1;
  return `${String(newHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getSlotDuration = (startTime, endTime) => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  return endTotalMinutes - startTotalMinutes;
};

const getTimeDifference = (time1, time2) => {
  const [hours1, minutes1] = time1.split(':').map(Number);
  const [hours2, minutes2] = time2.split(':').map(Number);
  
  const totalMinutes1 = hours1 * 60 + minutes1;
  const totalMinutes2 = hours2 * 60 + minutes2;
  
  return totalMinutes2 - totalMinutes1;
};