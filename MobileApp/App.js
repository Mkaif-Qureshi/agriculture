import React, {useEffect, useState, useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StatusBar, ActivityIndicator, View} from 'react-native';
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

const Stack = createNativeStackNavigator();

const toastConfig = {
  success: props => <CustomToast {...props} />,
  error: props => <CustomToast {...props} />,
  info: props => <CustomToast {...props} />,
};

// Main Navigator that loads after user state is determined
const MainNavigator = () => {
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
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
        }}>
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
    <NavigationContainer>
      <StatusBar
        translucent
        backgroundColor={'transparent'}
        barStyle="dark-content"
      />
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={user ? 'Home' : 'Welcome'}>
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  useEffect(() => {
      changeNavigationBarColor('white', false);
    }, []);
  return (
    <UserProvider>
      <MainNavigator />
      <Toast config={toastConfig} />
    </UserProvider>
  );
};

export default App;
