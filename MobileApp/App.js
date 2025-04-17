import React, {useEffect, useState, useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  StatusBar,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import Signup from './pages/Signup';
import Toast from 'react-native-toast-message';
import Welcome from './pages/Welcome';
import CustomToast from './components/CustomToast';
import Login from './pages/Login';
import Home from './pages/Home';
import {UserProvider, UserContext} from './context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {theme} from './theme.config';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import NetInfo from '@react-native-community/netinfo';
import BottomTabNavigator from './components/BottomTabNavigator';
import Settings from './pages/Settings';
import UpdateProfile from './pages/UpdateProfile';

const Stack = createNativeStackNavigator();

const toastConfig = {
  success: props => <CustomToast {...props} />,
  error: props => <CustomToast {...props} />,
  info: props => <CustomToast {...props} />,
};

const OfflineBanner = () => (
  <View style={styles.offlineBanner}>
    <Text style={styles.offlineText}>You're offline</Text>
  </View>
);

// Main Navigator that loads after user state is determined
const MainNavigator = ({isConnected}) => {
  const {user, setUser} = useContext(UserContext);
  const [loadingStorage, setLoadingStorage] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.log('Error loading user from storage', err);
      } finally {
        setLoadingStorage(false);
      }
    };
    loadUserFromStorage();
  }, []);

  if (loadingStorage) {
    return (
      <View style={styles.loaderContainer}>
        <StatusBar
          translucent
          backgroundColor={'transparent'}
          barStyle="dark-content"
        />
        <ActivityIndicator size={45} color={theme.darkBrown} />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>
        <StatusBar
          translucent
          backgroundColor={'transparent'}
          barStyle="dark-content"
        />
        <Stack.Navigator
          screenOptions={{headerShown: false}}
          initialRouteName={user ? 'MainApp' : 'Welcome'}>
          <Stack.Screen name="MainApp" component={BottomTabNavigator} />
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Login" component={Login} />

          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
        </Stack.Navigator>
      </NavigationContainer>
      {!isConnected && <OfflineBanner />}
    </>
  );
};

const App = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const status = state.isConnected;
      setIsConnected(status);
      changeNavigationBarColor(status ? 'white' : theme.blue, false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserProvider>
      <MainNavigator isConnected={isConnected} />
      <Toast config={toastConfig} />
    </UserProvider>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  offlineBanner: {
    position: 'fixed',
    bottom: Platform.OS === 'ios' ? 20 : 0,
    left: 0,
    right: 0,
    backgroundColor: theme.blue,
    zIndex: 1000,
    alignItems: 'center',
    paddingTop : 10,
  },
  offlineText: {
    color: theme.text,
    fontSize: 13,
    fontFamily : theme.font.regular
  },
});

export default App;
