// App.js
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {AppProvider} from './src/context/AppContext';
import {colors} from './src/styles/colors';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import AddAppointmentScreen from './src/screens/AddAppointmentScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import PatientNotesScreen from './src/screens/PatientNotesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Navigator for main screens
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          
          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Appointments') {
            iconName = 'event-note';
          } else if (route.name === 'Calendar') {
            iconName = 'calendar-today';
          } else if (route.name === 'Notes') {
            iconName = 'note';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Notes" component={PatientNotesScreen} />
    </Tab.Navigator>
  );
};

// Stack Navigator for the entire app
const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddAppointment"
        component={AddAppointmentScreen}
        options={{
          headerShown: false, // We'll use custom header in the component
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

// Main App component
const App = () => {
  return (
    <AppProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;