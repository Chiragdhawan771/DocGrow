import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated} from 'react-native';
import {Calendar} from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useApp} from '../context/AppContext';
import {globalStyles} from '../styles/globalStyles';
import {colors} from '../styles/colors';
import {formatDate, formatTime, getTodayString} from '../utils/dateUtils';

const CalendarScreen = () => {
  const {
    selectedDate,
    setSelectedDate,
    getAppointmentsForDate,
    allAppointments,
  } = useApp();
  
  const [calendarKey, setCalendarKey] = useState(0);

  // Animation values
  const fadeAnims = React.useRef(
    Array(8).fill(0).map(() => new Animated.Value(0))
  ).current;
  const slideAnims = React.useRef(
    Array(8).fill(0).map(() => new Animated.Value(30))
  ).current;
  const scaleAnims = React.useRef(
    Array(8).fill(0).map(() => new Animated.Value(0.9))
  ).current;

  React.useEffect(() => {
    // Staggered entrance animations
    const animations = fadeAnims.map((fadeAnim, index) =>
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          delay: index * 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[index], {
          toValue: 0,
          duration: 600,
          delay: index * 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          tension: 100,
          friction: 8,
          delay: index * 150,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(0, animations).start();
  }, []);

  // Generate marked dates for calendar
  const getMarkedDates = () => {
    const marked = {};
    const appointmentCounts = {};

    // Count appointments per date
    allAppointments.forEach(apt => {
      appointmentCounts[apt.date] = (appointmentCounts[apt.date] || 0) + 1;
    });

    // Mark dates with appointments
    Object.keys(appointmentCounts).forEach(date => {
      const count = appointmentCounts[date];
      let color;
      
      if (count >= 4) {
        color = colors.error; // Fully booked
      } else if (count >= 2) {
        color = colors.warning; // Partial bookings
      } else {
        color = colors.success; // Available
      }

      marked[date] = {
        marked: true,
        dotColor: color,
        selectedColor: date === selectedDate ? colors.primary : undefined,
        selected: date === selectedDate,
      };
    });

    // Ensure selected date is marked even if no appointments
    if (!marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: colors.primary,
      };
    }

    return marked;
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return colors.primary;
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      case 'pending': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const AnimatedAppointmentItem = ({appointment, index}) => {
    const pressScale = React.useRef(new Animated.Value(1)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
      // Subtle pulse animation for status indicator
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

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
          transform: [{ scale: pressScale }],
        }}
      >
        <TouchableOpacity
          style={styles.appointmentItem}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <View style={styles.appointmentTime}>
            <Icon name="access-time" size={16} color={colors.textSecondary} />
            <Text style={styles.timeText}>{formatTime(appointment.time)}</Text>
          </View>
          
          <View style={styles.appointmentInfo}>
            <Text style={styles.patientName}>{appointment.patientName}</Text>
            <Text style={styles.appointmentIssue}>{appointment.issue}</Text>
          </View>
          
          <Animated.View 
            style={[
              styles.statusIndicator, 
              {
                backgroundColor: getStatusColor(appointment.status),
                transform: [{ scale: pulseAnim }]
              }
            ]} 
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const AnimatedLegendItem = ({color, label, count, index}) => {
    const bounceAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
      const startAnimation = () => {
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Restart animation after delay
          setTimeout(startAnimation, 3000 + index * 500);
        });
      };

      setTimeout(startAnimation, index * 500);
    }, []);

    return (
      <View style={styles.legendItem}>
        <Animated.View 
          style={[
            styles.legendDot, 
            {
              backgroundColor: color,
              transform: [{ scale: bounceAnim }]
            }
          ]} 
        />
        <Text style={styles.legendText}>
          {label} ({count} days)
        </Text>
      </View>
    );
  };

  const AnimatedStatItem = ({number, label, index}) => {
    const countUpAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

    React.useEffect(() => {
      Animated.parallel([
        Animated.timing(countUpAnim, {
          toValue: number,
          duration: 1000,
          delay: 2000 + index * 200,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          delay: 2000 + index * 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, [number]);

    return (
      <Animated.View 
        style={[
          styles.statItem,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Animated.Text style={styles.statNumber}>
          {countUpAnim.interpolate({
            inputRange: [0, number],
            outputRange: [0, number],
            extrapolate: 'clamp',
          }).interpolate({
            inputRange: [0, number],
            outputRange: ['0', number.toString()],
          })}
        </Animated.Text>
        <Text style={styles.statLabel}>{label}</Text>
      </Animated.View>
    );
  };

  // Calculate legend counts
  const appointmentCounts = {};
  allAppointments.forEach(apt => {
    appointmentCounts[apt.date] = (appointmentCounts[apt.date] || 0) + 1;
  });

  const legendCounts = {
    available: Object.values(appointmentCounts).filter(count => count <= 1).length,
    partial: Object.values(appointmentCounts).filter(count => count >= 2 && count < 4).length,
    booked: Object.values(appointmentCounts).filter(count => count >= 4).length,
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView>
        {/* Calendar */}
        <Animated.View 
          style={[
            styles.calendarContainer,
            {
              opacity: fadeAnims[0],
              transform: [
                { translateY: slideAnims[0] },
                { scale: scaleAnims[0] }
              ],
            }
          ]}
        >
          <Calendar
            key={calendarKey}
            current={selectedDate}
            onDayPress={onDayPress}
            markedDates={getMarkedDates()}
            theme={{
              backgroundColor: colors.white,
              calendarBackground: colors.white,
              textSectionTitleColor: colors.textPrimary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.white,
              todayTextColor: colors.primary,
              dayTextColor: colors.textPrimary,
              textDisabledColor: colors.textLight,
              dotColor: colors.primary,
              selectedDotColor: colors.white,
              arrowColor: colors.primary,
              disabledArrowColor: colors.textLight,
              monthTextColor: colors.textPrimary,
              indicatorColor: colors.primary,
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            style={styles.calendar}
          />
        </Animated.View>

        {/* Legend */}
        <Animated.View 
          style={[
            styles.legendContainer,
            {
              opacity: fadeAnims[1],
              transform: [
                { translateY: slideAnims[1] },
                { scale: scaleAnims[1] }
              ],
            }
          ]}
        >
          <Text style={styles.legendTitle}>Booking Status</Text>
          <View style={styles.legendRow}>
            <AnimatedLegendItem 
              color={colors.success} 
              label="Available" 
              count={legendCounts.available}
              index={0}
            />
            <AnimatedLegendItem 
              color={colors.warning} 
              label="Partial" 
              count={legendCounts.partial}
              index={1}
            />
            <AnimatedLegendItem 
              color={colors.error} 
              label="Fully Booked" 
              count={legendCounts.booked}
              index={2}
            />
          </View>
        </Animated.View>

        {/* Selected Date Appointments */}
        <Animated.View 
          style={[
            styles.appointmentsContainer,
            {
              opacity: fadeAnims[2],
              transform: [
                { translateY: slideAnims[2] },
                { scale: scaleAnims[2] }
              ],
            }
          ]}
        >
          <View style={styles.appointmentsHeader}>
            <Text style={styles.appointmentsTitle}>
              {formatDate(selectedDate)}
            </Text>
            <Text style={styles.appointmentsCount}>
              {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {selectedDateAppointments.length > 0 ? (
            selectedDateAppointments.map((appointment, index) => (
              <AnimatedAppointmentItem 
                key={appointment.id} 
                appointment={appointment} 
                index={index}
              />
            ))
          ) : (
            <Animated.View 
              style={[
                styles.emptyState,
                {
                  opacity: fadeAnims[3],
                  transform: [{ scale: scaleAnims[3] }],
                }
              ]}
            >
              <Icon name="event-available" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No appointments on this date</Text>
              <Text style={styles.emptySubtext}>This day is available for new appointments</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View 
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnims[4],
              transform: [
                { translateY: slideAnims[4] },
                { scale: scaleAnims[4] }
              ],
            }
          ]}
        >
          <Text style={styles.statsTitle}>This Month Overview</Text>
          <View style={styles.statsRow}>
            <AnimatedStatItem
              number={allAppointments.length}
              label="Total Appointments"
              index={0}
            />
            <AnimatedStatItem
              number={allAppointments.filter(apt => apt.status === 'completed').length}
              label="Completed"
              index={1}
            />
            <AnimatedStatItem
              number={allAppointments.filter(apt => apt.date > getTodayString()).length}
              label="Upcoming"
              index={2}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  legendContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  appointmentsContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appointmentsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appointmentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  appointmentsCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  appointmentIssue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default CalendarScreen;