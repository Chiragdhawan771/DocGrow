import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useApp} from '../context/AppContext';
import {globalStyles} from '../styles/globalStyles';
import {colors} from '../styles/colors';
import {formatDate, formatTime} from '../utils/dateUtils';

const PatientNotesScreen = () => {
  const {allAppointments, addAppointmentNote} = useApp();
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Animation values
  const fadeAnims = React.useRef(
    Array(20).fill(0).map(() => new Animated.Value(0))
  ).current;
  const slideAnims = React.useRef(
    Array(20).fill(0).map(() => new Animated.Value(30))
  ).current;
  const searchBarScale = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    // Search bar entrance animation
    Animated.spring(searchBarScale, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Staggered animations for components
    const animations = fadeAnims.map((fadeAnim, index) =>
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[index], {
          toValue: 0,
          duration: 400,
          delay: index * 80,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(0, animations).start();
  }, []);

  // Filter appointments with notes or completed appointments
  const appointmentsWithNotes = allAppointments.filter(
    apt => apt.notes || apt.status === 'completed'
  );

  // Filter by search query
  const filteredAppointments = appointmentsWithNotes.filter(
    apt =>
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.notes && apt.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Re-animate note cards when search changes
  React.useEffect(() => {
    const cardAnimations = fadeAnims.slice(2).map((fadeAnim, index) => {
      fadeAnim.setValue(0);
      slideAnims[index + 2].setValue(20);
      
      return Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          delay: index * 60,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[index + 2], {
          toValue: 0,
          duration: 300,
          delay: index * 60,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(0, cardAnimations).start();
  }, [searchQuery, filteredAppointments.length]);

  const openNoteModal = (appointment) => {
    setSelectedNote(appointment);
    setNoteText(appointment.notes || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNote(null);
    setNoteText('');
  };

  const saveNote = () => {
    if (selectedNote) {
      addAppointmentNote(selectedNote.id, noteText);
      closeModal();
    }
  };

  const AnimatedNoteCard = ({appointment, index}) => {
    const pressScale = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(pressScale, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={{
          opacity: fadeAnims[2 + index],
          transform: [
            { translateY: slideAnims[2 + index] },
            { scale: pressScale }
          ],
        }}
      >
        <TouchableOpacity
          style={styles.noteCard}
          onPress={() => openNoteModal(appointment)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <View style={styles.noteHeader}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{appointment.patientName}</Text>
              <Text style={styles.appointmentDate}>
                {formatDate(appointment.date)} • {formatTime(appointment.time)}
              </Text>
            </View>
            <View style={styles.noteActions}>
              {appointment.notes ? (
                <Icon name="note" size={20} color={colors.success} />
              ) : (
                <Icon name="note-add" size={20} color={colors.warning} />
              )}
            </View>
          </View>
          
          <View style={styles.noteBody}>
            <Text style={styles.appointmentIssue}>{appointment.issue}</Text>
            {appointment.notes ? (
              <Text style={styles.notePreview} numberOfLines={2}>
                {appointment.notes}
              </Text>
            ) : (
              <Text style={styles.noNoteText}>No notes added yet</Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const AnimatedEmptyState = () => {
    const rotateAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
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
            opacity: fadeAnims[2],
            transform: [{ translateY: slideAnims[2] }],
          }
        ]}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Icon name="note-add" size={64} color={colors.textLight} />
        </Animated.View>
        <Text style={styles.emptyTitle}>No Notes Found</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery 
            ? 'Try adjusting your search terms'
            : 'Complete appointments to add patient notes'
          }
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={globalStyles.container}>
      {/* Search Bar */}
      <Animated.View 
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnims[0],
            transform: [{ scale: searchBarScale }],
          }
        ]}
      >
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients, conditions, or notes..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Notes List */}
      <ScrollView style={styles.notesList}>
        {filteredAppointments.length > 0 ? (
          <>
            <Animated.View 
              style={[
                styles.listHeader,
                {
                  opacity: fadeAnims[1],
                  transform: [{ translateY: slideAnims[1] }],
                }
              ]}
            >
              <Text style={styles.listTitle}>Patient Notes</Text>
              <Text style={styles.listSubtitle}>
                {filteredAppointments.length} record{filteredAppointments.length !== 1 ? 's' : ''}
              </Text>
            </Animated.View>
            {filteredAppointments.map((appointment, index) => (
              <AnimatedNoteCard key={appointment.id} appointment={appointment} index={index} />
            ))}
          </>
        ) : (
          <AnimatedEmptyState />
        )}
      </ScrollView>

      {/* Note Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedNote && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>Patient Notes</Text>
                    <Text style={styles.modalSubtitle}>
                      {selectedNote.patientName}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={closeModal} activeOpacity={0.8}>
                    <Icon name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                  <View style={styles.appointmentDetails}>
                    <View style={styles.detailRow}>
                      <Icon name="person" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{selectedNote.patientName}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Icon name="schedule" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>
                        {formatDate(selectedNote.date)} at {formatTime(selectedNote.time)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Icon name="medical-services" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{selectedNote.issue}</Text>
                    </View>
                  </View>

                  <View style={styles.noteInputSection}>
                    <Text style={styles.noteLabel}>Clinical Notes:</Text>
                    <TextInput
                      style={styles.noteInput}
                      multiline
                      numberOfLines={8}
                      value={noteText}
                      onChangeText={setNoteText}
                      placeholder="Add your clinical observations, diagnosis, treatment plan, and follow-up instructions..."
                      placeholderTextColor={colors.textLight}
                      textAlignVertical="top"
                    />
                  </View>

                  <View style={styles.noteGuidelines}>
                    <Text style={styles.guidelinesTitle}>Documentation Guidelines:</Text>
                    <Text style={styles.guidelinesText}>
                      • Include patient symptoms and observations{'\n'}
                      • Note diagnosis and treatment plan{'\n'}
                      • Record medications prescribed{'\n'}
                      • Add follow-up instructions{'\n'}
                      • Maintain patient confidentiality
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.saveButton} onPress={saveNote} activeOpacity={0.8}>
                    <Icon name="save" size={20} color={colors.white} />
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
  searchContainer: {
    backgroundColor: colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  notesList: {
    flex: 1,
    padding: 16,
  },
  listHeader: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  listSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  noteCard: {
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
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  appointmentDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  noteActions: {
    marginLeft: 12,
  },
  noteBody: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  appointmentIssue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  notePreview: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  noNoteText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalContent: {
    flex: 1,
  },
  appointmentDetails: {
    padding: 20,
    backgroundColor: colors.background,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  noteInputSection: {
    padding: 20,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  noteGuidelines: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 16,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PatientNotesScreen;