import React from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useApp} from '../context/AppContext';
import {globalStyles} from '../styles/globalStyles';
import {colors} from '../styles/colors';

const SettingsScreen = () => {
  const {doctorInfo} = useApp();

  // Animation values
  const fadeAnims = React.useRef(
    Array(20).fill(0).map(() => new Animated.Value(0))
  ).current;
  const slideAnims = React.useRef(
    Array(20).fill(0).map(() => new Animated.Value(30))
  ).current;
  const scaleAnims = React.useRef(
    Array(20).fill(0).map(() => new Animated.Value(0.9))
  ).current;

  React.useEffect(() => {
    // Profile card animation (faster)
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

    // Staggered animations for other sections
    const animations = fadeAnims.slice(1).map((fadeAnim, index) =>
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          delay: (index + 1) * 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[index + 1], {
          toValue: 0,
          duration: 500,
          delay: (index + 1) * 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[index + 1], {
          toValue: 1,
          tension: 100,
          friction: 8,
          delay: (index + 1) * 100,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(0, animations).start();
  }, []);

  const AnimatedSettingItem = ({icon, title, subtitle, onPress, showArrow = true, index}) => {
    const pressScale = React.useRef(new Animated.Value(1)).current;
    const iconRotate = React.useRef(new Animated.Value(0)).current;
    const iconPulse = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
      // Subtle pulse animation for icons
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconPulse, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(iconPulse, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    const handlePressIn = () => {
      Animated.parallel([
        Animated.spring(pressScale, {
          toValue: 0.98,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotate, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePressOut = () => {
      Animated.parallel([
        Animated.spring(pressScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotate, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const iconRotation = iconRotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '10deg'],
    });

    return (
      <Animated.View
        style={{
          transform: [{ scale: pressScale }],
        }}
      >
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <View style={styles.settingLeft}>
            <Animated.View 
              style={[
                styles.iconContainer,
                {
                  transform: [
                    { scale: iconPulse },
                    { rotate: iconRotation }
                  ]
                }
              ]}
            >
              <Icon name={icon} size={24} color={colors.primary} />
            </Animated.View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>{title}</Text>
              {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
          </View>
          {showArrow && (
            <Animated.View
              style={{
                transform: [{ rotate: iconRotation }]
              }}
            >
              <Icon name="chevron-right" size={24} color={colors.textLight} />
            </Animated.View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const AnimatedProfileCard = () => {
    const avatarPulse = React.useRef(new Animated.Value(1)).current;
    const editButtonSpin = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      // Avatar breathing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(avatarPulse, {
            toValue: 1.05,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(avatarPulse, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    const handleEditPress = () => {
      Animated.timing(editButtonSpin, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        editButtonSpin.setValue(0);
        showAlert('Edit Profile', 'Profile editing feature coming soon!');
      });
    };

    const editRotation = editButtonSpin.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <Animated.View 
        style={[
          globalStyles.card, 
          styles.profileCard,
          {
            opacity: fadeAnims[0],
            transform: [{ scale: scaleAnims[0] }],
          }
        ]}
      >
        <View style={styles.profileHeader}>
          <Animated.View 
            style={[
              styles.avatarContainer,
              {
                transform: [{ scale: avatarPulse }]
              }
            ]}
          >
            <Icon name="person" size={40} color={colors.white} />
          </Animated.View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{doctorInfo.name}</Text>
            <Text style={styles.profileSpecialization}>{doctorInfo.specialization}</Text>
            <Text style={styles.profileExperience}>{doctorInfo.experience} experience</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditPress}
          >
            <Animated.View
              style={{
                transform: [{ rotate: editRotation }]
              }}
            >
              <Icon name="edit" size={20} color={colors.primary} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const AnimatedSection = ({title, children, index}) => (
    <Animated.View 
      style={[
        styles.settingsSection,
        {
          opacity: fadeAnims[index],
          transform: [
            { translateY: slideAnims[index] },
            { scale: scaleAnims[index] }
          ],
        }
      ]}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      <Animated.View style={styles.settingsGroup}>
        {children}
      </Animated.View>
    </Animated.View>
  );

  const AnimatedLogoutButton = () => {
    const pressScale = React.useRef(new Animated.Value(1)).current;
    const iconBounce = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.parallel([
        Animated.spring(pressScale, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
        Animated.spring(iconBounce, {
          toValue: 1.2,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePressOut = () => {
      Animated.parallel([
        Animated.spring(pressScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(iconBounce, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handleLogout = () => {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Logout', style: 'destructive', onPress: () => showAlert('Logout', 'Logout functionality coming soon!')},
        ]
      );
    };

    return (
      <Animated.View
        style={{
          opacity: fadeAnims[19],
          transform: [
            { translateY: slideAnims[19] },
            { scale: Animated.multiply(scaleAnims[19], pressScale) }
          ],
        }}
      >
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Animated.View
            style={{
              transform: [{ scale: iconBounce }]
            }}
          >
            <Icon name="exit-to-app" size={24} color={colors.error} />
          </Animated.View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const showAlert = (title, message) => {
    Alert.alert(title, message, [{text: 'OK'}]);
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.screenPadding}>
        {/* Doctor Profile Card */}
        <AnimatedProfileCard />

        {/* Account Settings */}
        <AnimatedSection title="Account Settings" index={1}>
          <AnimatedSettingItem
            icon="person-outline"
            title="Personal Information"
            subtitle="Update your profile details"
            onPress={() => showAlert('Personal Information', 'Feature coming soon!')}
            index={0}
          />
          <AnimatedSettingItem
            icon="security"
            title="Privacy & Security"
            subtitle="Manage your account security"
            onPress={() => showAlert('Privacy & Security', 'Feature coming soon!')}
            index={1}
          />
          <AnimatedSettingItem
            icon="notifications"
            title="Notifications"
            subtitle="Configure notification preferences"
            onPress={() => showAlert('Notifications', 'Feature coming soon!')}
            index={2}
          />
        </AnimatedSection>

        {/* Practice Settings */}
        <AnimatedSection title="Practice Settings" index={2}>
          <AnimatedSettingItem
            icon="schedule"
            title="Working Hours"
            subtitle="Set your availability"
            onPress={() => showAlert('Working Hours', 'Feature coming soon!')}
            index={3}
          />
          <AnimatedSettingItem
            icon="location-on"
            title="Clinic Location"
            subtitle="Update clinic address"
            onPress={() => showAlert('Clinic Location', 'Feature coming soon!')}
            index={4}
          />
          <AnimatedSettingItem
            icon="payment"
            title="Payment Settings"
            subtitle="Manage consultation fees"
            onPress={() => showAlert('Payment Settings', 'Feature coming soon!')}
            index={5}
          />
        </AnimatedSection>

        {/* App Settings */}
        <AnimatedSection title="App Settings" index={3}>
          <AnimatedSettingItem
            icon="palette"
            title="Theme"
            subtitle="Light theme"
            onPress={() => showAlert('Theme', 'Dark theme coming soon!')}
            index={6}
          />
          <AnimatedSettingItem
            icon="language"
            title="Language"
            subtitle="English"
            onPress={() => showAlert('Language', 'Multiple languages coming soon!')}
            index={7}
          />
          <AnimatedSettingItem
            icon="backup"
            title="Backup & Sync"
            subtitle="Auto-backup enabled"
            onPress={() => showAlert('Backup & Sync', 'Feature coming soon!')}
            index={8}
          />
        </AnimatedSection>

        {/* Support */}
        <AnimatedSection title="Support" index={4}>
          <AnimatedSettingItem
            icon="help-outline"
            title="Help & FAQ"
            subtitle="Get help and support"
            onPress={() => showAlert('Help & FAQ', 'Support documentation coming soon!')}
            index={9}
          />
          <AnimatedSettingItem
            icon="feedback"
            title="Send Feedback"
            subtitle="Share your thoughts"
            onPress={() => showAlert('Send Feedback', 'Feedback form coming soon!')}
            index={10}
          />
          <AnimatedSettingItem
            icon="info-outline"
            title="About DocGrow"
            subtitle="Version 1.0.0"
            onPress={() => showAlert('About DocGrow', 'DocGrow v1.0.0\n\nA modern appointment management app for healthcare professionals.')}
            index={11}
          />
        </AnimatedSection>

        {/* Logout */}
        <AnimatedLogoutButton />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  profileSpecialization: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileExperience: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  settingsGroup: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: 8,
  },
});

export default SettingsScreen;