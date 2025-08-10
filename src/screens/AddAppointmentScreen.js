import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useApp} from '../context/AppContext';
import {globalStyles} from '../styles/globalStyles';
import {colors} from '../styles/colors';
import {formatDate, formatTime} from '../utils/dateUtils';

// Memoized components to prevent re-renders
const MemoizedInputField = React.memo(({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  multiline = false,
  keyboardType = 'default',
  fadeAnim,
  slideAnim,
  maxLength,
  error,
}) => {
  return (
    <Animated.View
      style={[
        styles.inputContainer,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}
    >
      <Text style={styles.inputLabel}>
        <Icon name={icon} size={16} color={colors.textSecondary} />
        {'  '}{label}
      </Text>
      <TextInput
        style={[
          styles.textInput, 
          multiline && styles.multilineInput,
          error && styles.errorInput
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? 'top' : 'center'}
        maxLength={maxLength}
        // Key props to maintain focus
        blurOnSubmit={false}
        autoCorrect={false}
        selectTextOnFocus={false}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {maxLength && value.length > 0 && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </Animated.View>
  );
});

const MemoizedDateTimeButton = React.memo(({
  label,
  value,
  onPress,
  icon,
  fadeAnim,
  slideAnim,
}) => {
  const pressScale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  return (
    <Animated.View
      style={[
        styles.inputContainer,
        {
          opacity: fadeAnim,
          transform: [
            {translateY: slideAnim},
            {scale: pressScale},
          ],
        },
      ]}
    >
      <Text style={styles.inputLabel}>
        <Icon name={icon} size={16} color={colors.textSecondary} />
        {'  '}{label}
      </Text>
      <TouchableOpacity
        style={styles.dateTimeButton}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Text style={styles.dateTimeText}>{value}</Text>
        <Icon name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
});

const MemoizedStatusButtons = React.memo(({
  selectedStatus,
  onStatusChange,
  fadeAnim,
  slideAnim,
}) => {
  const statusOptions = ['pending', 'confirmed'];
  
  return (
    <Animated.View
      style={[
        styles.inputContainer,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}
    >
      <Text style={styles.inputLabel}>
        <Icon name="event-note" size={16} color={colors.textSecondary} />
        {'  '}Status
      </Text>
      <View style={styles.statusButtons}>
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              selectedStatus === status && styles.activeStatusButton,
            ]}
            onPress={() => onStatusChange(status)}
          >
            <Text
              style={[
                styles.statusButtonText,
                selectedStatus === status && styles.activeStatusButtonText,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
});

const AddAppointmentScreen = ({navigation}) => {
  const {addAppointment} = useApp();
  
  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    contact: '',
    issue: '',
    date: new Date(),
    time: new Date(),
    status: 'pending',
  });
  
  // Validation errors state
  const [errors, setErrors] = useState({});
  
  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create stable animation references
  const animationRefs = useMemo(() => ({
    fadeAnims: Array(10).fill(0).map(() => new Animated.Value(0)),
    slideAnims: Array(10).fill(0).map(() => new Animated.Value(30)),
  }), []);

  React.useEffect(() => {
    // Staggered entrance animations
    const animations = animationRefs.fadeAnims.map((fadeAnim, index) =>
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(animationRefs.slideAnims[index], {
          toValue: 0,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(0, animations).start();
  }, [animationRefs]);

  // Validation functions
  const validateContactNumber = useCallback((contact) => {
    const cleanContact = contact.replace(/\D/g, ''); // Remove non-digits
    if (cleanContact.length === 0) {
      return 'Contact number is required';
    }
    if (cleanContact.length !== 10) {
      return 'Contact number must be exactly 10 digits';
    }
    if (!/^[6-9]\d{9}$/.test(cleanContact)) {
      return 'Enter a valid Indian mobile number (starting with 6-9)';
    }
    return null;
  }, []);

  const validatePatientName = useCallback((name) => {
    if (!name.trim()) {
      return 'Patient name is required';
    }
    if (name.trim().length < 2) {
      return 'Patient name must be at least 2 characters';
    }
    return null;
  }, []);

  const validateIssue = useCallback((issue) => {
    if (!issue.trim()) {
      return 'Medical issue/reason is required';
    }
    if (issue.trim().length < 5) {
      return 'Please provide more details about the medical issue';
    }
    return null;
  }, []);

  // Memoized callbacks to prevent re-renders
  const updateFormField = useCallback((field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  // Special handler for contact number with real-time validation
  const updateContact = useCallback((value) => {
    // Only allow digits, limit to 10 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 10);
    
    setFormData(prev => ({
      ...prev,
      contact: cleanValue
    }));

    // Real-time validation
    const error = validateContactNumber(cleanValue);
    setErrors(prev => ({
      ...prev,
      contact: error
    }));
  }, [validateContactNumber]);

  const updatePatientName = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      patientName: value
    }));

    // Real-time validation
    const error = validatePatientName(value);
    setErrors(prev => ({
      ...prev,
      patientName: error
    }));
  }, [validatePatientName]);

  const updateIssue = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      issue: value
    }));

    // Real-time validation
    const error = validateIssue(value);
    setErrors(prev => ({
      ...prev,
      issue: error
    }));
  }, [validateIssue]);

  const updateStatus = useMemo(() => updateFormField('status'), [updateFormField]);

  const onDateChange = useCallback((event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({...prev, date: selectedDate}));
    }
  }, []);

  const onTimeChange = useCallback((event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setFormData(prev => ({...prev, time: selectedTime}));
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate patient name
    const nameError = validatePatientName(formData.patientName);
    if (nameError) newErrors.patientName = nameError;

    // Validate contact
    const contactError = validateContactNumber(formData.contact);
    if (contactError) newErrors.contact = contactError;

    // Validate issue
    const issueError = validateIssue(formData.issue);
    if (issueError) newErrors.issue = issueError;

    // Validate date
    if (formData.date < new Date().setHours(0, 0, 0, 0)) {
      newErrors.date = 'Please select a future date';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Alert.alert('Validation Error', 'Please fix the highlighted errors before submitting.');
      return false;
    }

    return true;
  }, [formData, validatePatientName, validateContactNumber, validateIssue]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create appointment object
      const newAppointment = {
        id: Date.now().toString(),
        patientName: formData.patientName.trim(),
        contact: formData.contact,
        issue: formData.issue.trim(),
        date: formData.date.toISOString().split('T')[0],
        time: formData.time.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        status: formData.status,
        notes: '',
      };

      // Add appointment using context
      addAppointment(newAppointment);
      
      // Show success message
      Alert.alert(
        'Success',
        'Appointment scheduled successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, addAppointment, navigation]);

  const resetForm = useCallback(() => {
    Alert.alert(
      'Reset Form',
      'Are you sure you want to clear all fields?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setFormData({
              patientName: '',
              contact: '',
              issue: '',
              date: new Date(),
              time: new Date(),
              status: 'pending',
            });
            setErrors({});
          },
        },
      ]
    );
  }, []);

  const showDatePickerHandler = useCallback(() => setShowDatePicker(true), []);
  const showTimePickerHandler = useCallback(() => setShowTimePicker(true), []);

  // Memoized formatted values to prevent recalculation
  const formattedDate = useMemo(() => 
    formatDate(formData.date.toISOString().split('T')[0]), 
    [formData.date]
  );
  
  const formattedTime = useMemo(() => 
    formatTime(formData.time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })), 
    [formData.time]
  );

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: animationRefs.fadeAnims[0],
            transform: [{translateY: animationRefs.slideAnims[0]}],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Appointment</Text>
        <TouchableOpacity onPress={resetForm} style={styles.resetButton}>
          <Icon name="refresh" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
        <MemoizedInputField
          label="Patient Name"
          value={formData.patientName}
          onChangeText={updatePatientName}
          placeholder="Enter patient's full name"
          icon="person"
          fadeAnim={animationRefs.fadeAnims[1]}
          slideAnim={animationRefs.slideAnims[1]}
          error={errors.patientName}
        />

        <MemoizedInputField
          label="Contact Number"
          value={formData.contact}
          onChangeText={updateContact}
          placeholder="Enter 10-digit mobile number"
          icon="phone"
          keyboardType="phone-pad"
          maxLength={10}
          fadeAnim={animationRefs.fadeAnims[2]}
          slideAnim={animationRefs.slideAnims[2]}
          error={errors.contact}
        />

        <MemoizedInputField
          label="Medical Issue / Reason"
          value={formData.issue}
          onChangeText={updateIssue}
          placeholder="Describe the medical concern or reason for visit"
          icon="medical-services"
          multiline={true}
          fadeAnim={animationRefs.fadeAnims[3]}
          slideAnim={animationRefs.slideAnims[3]}
          error={errors.issue}
        />

        <MemoizedDateTimeButton
          label="Appointment Date"
          value={formattedDate}
          onPress={showDatePickerHandler}
          icon="calendar-today"
          fadeAnim={animationRefs.fadeAnims[4]}
          slideAnim={animationRefs.slideAnims[4]}
        />

        <MemoizedDateTimeButton
          label="Appointment Time"
          value={formattedTime}
          onPress={showTimePickerHandler}
          icon="access-time"
          fadeAnim={animationRefs.fadeAnims[5]}
          slideAnim={animationRefs.slideAnims[5]}
        />

        <MemoizedStatusButtons
          selectedStatus={formData.status}
          onStatusChange={updateStatus}
          fadeAnim={animationRefs.fadeAnims[6]}
          slideAnim={animationRefs.slideAnims[6]}
        />

        {/* Submit Button */}
        <Animated.View
          style={[
            styles.submitContainer,
            {
              opacity: animationRefs.fadeAnims[7],
              transform: [{translateY: animationRefs.slideAnims[7]}],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.submitButtonText}>Scheduling...</Text>
              </View>
            ) : (
              <View style={styles.submitContent}>
                <Icon name="event-available" size={20} color={colors.white} />
                <Text style={styles.submitButtonText}>Schedule Appointment</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={formData.time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  resetButton: {
    padding: 8,
  },
  form: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  errorInput: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  activeStatusButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeStatusButtonText: {
    color: colors.white,
  },
  submitContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default AddAppointmentScreen;