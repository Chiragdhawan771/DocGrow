import React, {useState} from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useApp} from '../context/AppContext';
import {globalStyles} from '../styles/globalStyles';
import {colors} from '../styles/colors';
import {formatDate, formatTime} from '../utils/dateUtils';

const AppointmentsScreen = ({navigation}) => {
  const {
    appointmentFilter,
    setAppointmentFilter,
    getFilteredAppointments,
    updateAppointmentStatus,
    addAppointmentNote,
  } = useApp();
  
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Floating Action Button Animation
  const fabScale = React.useRef(new Animated.Value(1)).current;
  const fabRotate = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Subtle floating animation for FAB
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabScale, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fabScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const filteredAppointments = getFilteredAppointments();

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return colors.primary;
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      case 'pending': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return 'event-available';
      case 'completed': return 'check-circle';
      case 'cancelled': return 'cancel';
      case 'pending': return 'schedule';
      default: return 'event';
    }
  };

  const openAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setNoteText(appointment.notes || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAppointment(null);
    setNoteText('');
  };

  const saveNote = () => {
    if (selectedAppointment) {
      addAppointmentNote(selectedAppointment.id, noteText);
      closeModal();
    }
  };

  const changeStatus = (newStatus) => {
    if (selectedAppointment) {
      updateAppointmentStatus(selectedAppointment.id, newStatus);
      closeModal();
    }
  };

  const handleFabPress = () => {
    // Animate FAB rotation
    Animated.timing(fabRotate, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Reset rotation after animation
      fabRotate.setValue(0);
      // Navigate to Add Appointment screen
      navigation.navigate('AddAppointment');
    });
  };

  const FilterTab = ({filter, title, count, index}) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(-20)).current;

    React.useEffect(() => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, [index]);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <TouchableOpacity
          style={[
            styles.filterTab,
            appointmentFilter === filter && styles.activeFilterTab,
          ]}
          onPress={() => setAppointmentFilter(filter)}
        >
          <Text
            style={[
              styles.filterText,
              appointmentFilter === filter && styles.activeFilterText,
            ]}
          >
            {title} ({count})
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const AppointmentCard = ({appointment, index}) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(-50)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

    React.useEffect(() => {
      Animated.sequence([
        Animated.delay(index * 80),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, [index]);

    return (
      <Animated.View
        style={[
          styles.appointmentCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateX: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => openAppointmentModal(appointment)}
          activeOpacity={0.8}
        >
          <View style={styles.appointmentHeader}>
            <View style={styles.appointmentTime}>
              <Icon name="access-time" size={16} color={colors.textSecondary} />
              <Text style={styles.timeText}>{formatTime(appointment.time)}</Text>
            </View>
            <View style={[styles.statusBadge, {backgroundColor: getStatusColor(appointment.status)}]}>
              <Icon name={getStatusIcon(appointment.status)} size={14} color={colors.white} />
              <Text style={styles.statusText}>{appointment.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.appointmentBody}>
            <Text style={styles.patientName}>{appointment.patientName}</Text>
            <Text style={styles.appointmentIssue}>{appointment.issue}</Text>
            <Text style={styles.appointmentDate}>{formatDate(appointment.date)}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const EmptyState = () => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
    const rotateAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      // Initial entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    }, []);

    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View 
        style={[
          styles.emptyState,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ rotate }],
          }}
        >
          <Icon name="event-busy" size={48} color={colors.textLight} />
        </Animated.View>
        <Text style={styles.emptyText}>No appointments found</Text>
        <Text style={styles.emptySubtext}>Tap the + button to schedule a new appointment</Text>
      </Animated.View>
    );
  };

  const fabRotation = fabRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={globalStyles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterTab filter="today" title="Today" count={getFilteredAppointments('today').length} index={0} />
          <FilterTab filter="upcoming" title="Upcoming" count={getFilteredAppointments('upcoming').length} index={1} />
          <FilterTab filter="past" title="Past" count={getFilteredAppointments('past').length} index={2} />
        </ScrollView>
      </View>

      {/* Appointments List */}
      <ScrollView style={styles.appointmentsList}>
        {getFilteredAppointments(appointmentFilter).length > 0 ? (
          getFilteredAppointments(appointmentFilter).map((appointment, index) => (
            <AppointmentCard key={appointment.id} appointment={appointment} index={index} />
          ))
        ) : (
          <EmptyState />
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View 
        style={[
          styles.fab,
          {
            transform: [
              { scale: fabScale },
              { rotate: fabRotation },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fabButton}
          onPress={handleFabPress}
          activeOpacity={0.8}
        >
          <Icon name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>

      {/* Appointment Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedAppointment && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Appointment Details</Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Icon name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Patient:</Text>
                    <Text style={styles.detailValue}>{selectedAppointment.patientName}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date & Time:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedAppointment.date)} at {formatTime(selectedAppointment.time)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Issue:</Text>
                    <Text style={styles.detailValue}>{selectedAppointment.issue}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Contact:</Text>
                    <Text style={styles.detailValue}>{selectedAppointment.contact}</Text>
                  </View>

                  <View style={styles.notesSection}>
                    <Text style={styles.detailLabel}>Notes:</Text>
                    <TextInput
                      style={styles.noteInput}
                      multiline
                      numberOfLines={4}
                      value={noteText}
                      onChangeText={setNoteText}
                      placeholder="Add your notes here..."
                      placeholderTextColor={colors.textLight}
                    />
                  </View>

                  <View style={styles.statusButtons}>
                    <Text style={styles.detailLabel}>Update Status:</Text>
                    <View style={styles.statusButtonRow}>
                      <TouchableOpacity
                        style={[styles.statusButton, {backgroundColor: colors.primary}]}
                        onPress={() => changeStatus('confirmed')}
                      >
                        <Text style={styles.statusButtonText}>Confirm</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.statusButton, {backgroundColor: colors.success}]}
                        onPress={() => changeStatus('completed')}
                      >
                        <Text style={styles.statusButtonText}>Complete</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.statusButton, {backgroundColor: colors.error}]}
                        onPress={() => changeStatus('cancelled')}
                      >
                        <Text style={styles.statusButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
                    <Text style={styles.saveButtonText}>Save Notes</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: colors.white,
  },
  appointmentsList: {
    flex: 1,
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  appointmentBody: {
    gap: 4,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  appointmentIssue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  appointmentDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalContent: {
    padding: 20,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  notesSection: {
    marginTop: 16,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    color: colors.textPrimary,
  },
  statusButtons: {
    marginTop: 20,
  },
  statusButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppointmentsScreen;