// navigation/BottomTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Home from '../pages/Home';
import { theme } from '../theme.config';
import Schemes from '../pages/Schemes';
import Cropcare from '../pages/Cropcare';
import Market from '../pages/Market';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.secondary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Home':
              return <Entypo name="home" size={23} color={color} />;
            case 'Scheme':
              return <Entypo name="archive" size={23} color={color} />;;
            case 'Market':
              return <Entypo name="shop" size={23} color={color} />;
            case 'Crop Care':
              return <Entypo name="leaf" size={23} color={color} />;
            default:
              return <Icon name="ellipse-outline" size={24} color={color} />;
          }
        },        
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 5,
          fontFamily : theme.font.bold
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Scheme" component={Schemes} />
      <Tab.Screen name="Crop Care" component={Cropcare} />
      <Tab.Screen name="Market" component={Market} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
