import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { sessionAPI, availabilityAPI } from '../../services/api';
import { format, addDays, startOfWeek, isSameDay, isAfter, isBefore } from 'date-fns';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const SessionBookingModal = ({ isOpen, onClose, teacher, skill, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Date, 2: Time, 3: Duration, 4: Confirm
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [duration, setDuration] = useState(60); // minutes
  const [availability, setAvailability] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    if (isOpen && teacher) {
      fetchWeeklyAvailability();
    }
  }, [isOpen, teacher]);

  useEffect(() => {
    if (selectedDate) {
      fetchDaySlots();
    }
  }, [selectedDate]);

  const fetchWeeklyAvailability = async () => {
    try {
      const response = await availabilityAPI.getTeacherAvailability(teacher._id);
      if (response.data.availability && response.data.availability.length > 0) {
        setAvailability(response.data.availability);
      } else {
        // Set default availability for all days if API returns empty
        const defaultAvailability = [0, 1, 2, 3, 4, 5, 6].map(day => ({
          dayOfWeek: day,
          isActive: true
        }));
        setAvailability(defaultAvailability);
      }
    } catch (error) {
      console.error('Fetch availability error:', error);
      // Set default availability for all days if none exists
      const defaultAvailability = [0, 1, 2, 3, 4, 5, 6].map(day => ({
        dayOfWeek: day,
        isActive: true
      }));
      setAvailability(defaultAvailability);
    }
  };

  const fetchDaySlots = async () => {
    try {
      setLoading(true);
      const response = await availabilityAPI.getAvailableSlots(teacher._id, {
        date: selectedDate.toISOString(),
        duration
      });
      setAvailableSlots(response.data.availableSlots);
    } catch (error) {
      console.error('Fetch slots error:', error);
      // Generate default time slots (9 AM to 5 PM)
      const defaultSlots = [];
      for (let hour = 9; hour < 17; hour++) {
        defaultSlots.push({
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
        });
      }
      setAvailableSlots(defaultSlots);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  };

  const isDateAvailable = (date) => {
    const dayOfWeek = date.getDay();
    return availability.some(avail => avail.dayOfWeek === dayOfWeek && avail.isActive);
  };

  const handleDateSelect = (date) => {
    if (!isAfter(date, new Date()) && !isSameDay(date, new Date())) {
      toast.error('Please select a future date');
      return;
    }

    if (!isDateAvailable(date)) {
      toast.error('Teacher is not available on this date');
      return;
    }

    setSelectedDate(date);
    setSelectedTime(null);
    setStep(2);
  };

  const handleTimeSelect = (timeSlot) => {
    setSelectedTime(timeSlot);
    setStep(3);
  };

  const calculateTokens = () => {
    const hourlyRate = skill?.tokensPerHour || 50; // Use skill's rate or default 50 tokens/hour
    return Math.ceil((duration / 60) * hourlyRate);
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);

      // Combine date and time
      const [hours, minutes] = selectedTime.startTime.split(':');
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const bookingData = {
        teacherId: teacher._id, // Booking with this teacher
        skill: skill.name,
        skillCategory: skill.category,
        title: `${skill.name} Session with ${teacher.name}`,
        description: `Learn ${skill.name}`,
        scheduledAt: scheduledAt.toISOString(),
        duration,
        sessionType: 'one-on-one',
        isSkillExchange: false,
        tokensCharged: calculateTokens()
      };

      await sessionAPI.create(bookingData);

      // Dynamic success message
      const formattedDate = format(selectedDate, 'MMMM d, yyyy');
      const formattedTime = selectedTime.startTime;
      const durationHours = duration / 60;
      const tokensCharged = calculateTokens();

      toast.success(
        `✅ Session Booked!\n📚 ${skill.name} with ${teacher.name}\n📅 ${formattedDate} at ${formattedTime}\n⏱️ Duration: ${durationHours}h\n💰 Cost: ${tokensCharged} tokens`,
        { autoClose: 7000 }
      );

      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to book session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setDuration(60);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Book a Session</h2>
              <p className="text-gray-600 mt-1">
                with {teacher?.name} - {skill?.name}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= num
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step > num ? <CheckCircleIcon className="w-5 h-5" /> : num}
                  </div>
                  {num < 4 && (
                    <div
                      className={`w-12 h-1 ${
                        step > num ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Date</span>
              <span>Time</span>
              <span>Duration</span>
              <span>Confirm</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Select Date */}
            {step === 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Select a Date
                </h3>

                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
                    className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                  >
                    Previous Week
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {format(currentWeekStart, 'MMM d')} -{' '}
                    {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                  </span>
                  <button
                    onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
                    className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                  >
                    Next Week
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {getWeekDays().map((date) => {
                    const available = isDateAvailable(date);
                    const isPast = isBefore(date, new Date()) && !isSameDay(date, new Date());

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => handleDateSelect(date)}
                        disabled={!available || isPast}
                        className={`p-4 rounded-lg border transition-all ${
                          available && !isPast
                            ? 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                        } ${
                          selectedDate && isSameDay(date, selectedDate)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : ''
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {format(date, 'EEE')}
                        </div>
                        <div className="text-lg font-bold mt-1">
                          {format(date, 'd')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Select Time */}
            {step === 2 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  Select a Time
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                  {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading available times...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <p>No available time slots for this date.</p>
                    <button
                      onClick={() => setStep(1)}
                      className="mt-4 text-indigo-600 hover:text-indigo-700"
                    >
                      Choose another date
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleTimeSelect(slot)}
                        className="p-3 border border-indigo-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-center"
                      >
                        <div className="font-medium">{slot.startTime}</div>
                        <div className="text-xs text-gray-600">{slot.endTime}</div>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setStep(1)}
                  className="mt-4 text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Back to date selection
                </button>
              </div>
            )}

            {/* Step 3: Select Duration */}
            {step === 3 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Duration</h3>

                <div className="grid grid-cols-3 gap-4">
                  {[60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDuration(mins)}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        duration === mins
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="text-2xl font-bold">{mins / 60}h</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {calculateTokens()} tokens
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Confirm Booking</h3>

                <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teacher</span>
                    <span className="font-medium">{teacher?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Skill</span>
                    <span className="font-medium">{skill?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">
                      {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time</span>
                    <span className="font-medium">{selectedTime?.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{duration / 60} hour(s)</span>
                  </div>
                  <div className="flex justify-between border-t pt-4">
                    <span className="text-gray-900 font-semibold flex items-center gap-2">
                      <CurrencyDollarIcon className="w-5 h-5" />
                      Total Cost
                    </span>
                    <span className="text-xl font-bold text-indigo-600">
                      {calculateTokens()} tokens
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Booking...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionBookingModal;
