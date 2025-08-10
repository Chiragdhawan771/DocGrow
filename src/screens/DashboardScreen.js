import React from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useApp} from '../context/AppContext';
import {globalStyles} from '../styles/globalStyles';
import {colors} from '../styles/colors';
import {formatDate} from '../utils/dateUtils';

const DashboardScreen = ({navigation}) => {
  const {doctorInfo, getTodayStats} = useApp();
  const stats = getTodayStats();

  // Animation values
  const fadeAnims = React.useRef(
    Array(10).fill(0).map(() => new Animated.Value(0))
  ).current;
  const slideAnims = React.useRef(
    Array(10).fill(0).map(() => new Animated.Value(30))
  ).current;
  const scaleAnims = React.useRef(
    Array(10).fill(0).map(() => new Animated.Value(0.9))
  ).current;

  React.useEffect(() => {
    // Welcome section animation
    Animated.parallel([
      Animated.timing(fadeAnims[0], {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[0], {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered animations for other components
    const animations = fadeAnims.slice(1).map((fadeAnim, index) =>
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          delay: (index + 1) * 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[index + 1], {
          toValue: 0,
          duration: 500,
          delay: (index + 1) * 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[index + 1], {
          toValue: 1,
          tension: 100,
          friction: 8,
          delay: (index + 1) * 150,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(0, animations).start();
  }, []);

  const AnimatedSummaryCard = ({title, value, icon, color, onPress, index}) => {
    const pressScale = React.useRef(new Animated.Value(1)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
      // Subtle pulse animation for the icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
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
          opacity: fadeAnims[index],
          transform: [
            { translateY: slideAnims[index] },
            { scale: Animated.multiply(scaleAnims[index], pressScale) }
          ],
        }}
      >
        <TouchableOpacity 
          style={[styles.summaryCard, {borderLeftColor: color}]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardText}>
              <Text style={styles.cardValue}>{value}</Text>
              <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <Animated.View 
              style={[
                styles.cardIcon, 
                {
                  backgroundColor: `${color}20`,
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <Icon name={icon} size={24} color={color} />
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const AnimatedQuickAction = ({icon, text, backgroundColor, onPress, index}) => {
    const pressScale = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(pressScale, {
        toValue: 0.95,
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
          flex: 1,
          marginHorizontal: 6,
          opacity: fadeAnims[5 + index],
          transform: [
            { translateY: slideAnims[5 + index] },
            { scale: Animated.multiply(scaleAnims[5 + index], pressScale) }
          ],
        }}
      >
        <TouchableOpacity 
          style={[styles.quickAction, {backgroundColor}]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Icon name={icon} size={24} color={colors.white} />
          <Text style={styles.quickActionText}>{text}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const AnimatedWelcomeSection = () => {
    const waveAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    const waveRotation = waveAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '20deg'],
    });

    return (
      <Animated.View 
        style={[
          styles.welcomeSection,
          {
            opacity: fadeAnims[0],
            transform: [{ scale: scaleAnims[0] }],
          }
        ]}
      >
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeText}>Hello, {doctorInfo.name} </Text>
          <Animated.Text 
            style={[
              styles.waveEmoji,
              { transform: [{ rotate: waveRotation }] }
            ]}
          >
            👋
          </Animated.Text>
        </View>
        <Text style={styles.dateText}>{formatDate(new Date().toISOString().split('T')[0])}</Text>
      </Animated.View>
    );
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.screenPadding}>
        <AnimatedWelcomeSection />

        <Animated.View
          style={{
            opacity: fadeAnims[1],
            transform: [{ translateY: slideAnims[1] }],
          }}
        >
          <View style={styles.summarySection}>
            <AnimatedSummaryCard
              title="Today's Appointments"
              value={stats.todayAppointments}
              icon="today"
              color={colors.primary}
              onPress={() => navigation.navigate('Appointments')}
              index={2}
            />
            <AnimatedSummaryCard
              title="Total Patients"
              value={stats.totalPatients}
              icon="people"
              color={colors.secondary}
              onPress={() => navigation.navigate('Appointments')}
              index={3}
            />
            <AnimatedSummaryCard
              title="Completed Today"
              value={stats.completedToday}
              icon="check-circle"
              color={colors.success}
              onPress={() => navigation.navigate('Appointments')}
              index={4}
            />
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnims[5],
            transform: [{ translateY: slideAnims[5] }],
          }}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </Animated.View>

        <View style={styles.quickActionsRow}>
          <AnimatedQuickAction
            icon="calendar-today"
            text="View Calendar"
            backgroundColor={colors.primary}
            onPress={() => navigation.navigate('Calendar')}
            index={0}
          />
          
          <AnimatedQuickAction
            icon="event-note"
            text="Appointments"
            backgroundColor={colors.secondary}
            onPress={() => navigation.navigate('Appointments')}
            index={1}
          />
        </View>

        <Animated.View
          style={[
            globalStyles.card,
            styles.doctorCard,
            {
              opacity: fadeAnims[8],
              transform: [
                { translateY: slideAnims[8] },
                { scale: scaleAnims[8] }
              ],
            }
          ]}
        >
          <View style={styles.doctorHeader}>
            <Animated.View
              style={{
                transform: [{ scale: scaleAnims[9] }],
              }}
            >
              <Icon name="person" size={40} color={colors.primary} />
            </Animated.View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctorInfo.name}</Text>
              <Text style={styles.doctorSpecialization}>{doctorInfo.specialization}</Text>
              <Text style={styles.doctorExperience}>{doctorInfo.experience} experience</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  waveEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  cardTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  quickActionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  doctorCard: {
    marginBottom: 24,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorInfo: {
    marginLeft: 16,
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  doctorExperience: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
});

export default DashboardScreen;