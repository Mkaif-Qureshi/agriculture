// Home.js
import React, {useContext, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import {theme} from '../theme.config';
import {UserContext} from '../context/UserContext';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';

const Home = () => {
  const {user} = useContext(UserContext);
  const navigation = useNavigation();
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFirstName = name => {
    if (!name) return '';
    const firstPart = name.trim().split(' ')[0];
    return firstPart.length > 12 ? firstPart.slice(0, 12) + '…' : firstPart;
  };

  if (user) {
    return (
      <View style={theme.container}>
        <StatusBar
          translucent
          backgroundColor={'transparent'}
          barStyle="dark-content"
        />
        <View style={[styles.header]}>
          <View style={styles.sec1}>
            <View
              style={{
                borderRadius: 10,
                backgroundColor: '#fff',
                padding: 5,
                alignSelf: 'flex-start',
                ...Platform.select({
                  android: {
                    elevation: 5,
                  },
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                  },
                }),
              }}>
              <Image
                source={
                  user.gender === 'Male'
                    ? require('../assets/icons/male-farmer.png')
                    : require('../assets/icons/female-farmer.png')
                }
                style={{width: 45, height: 45, borderRadius: 10}}
              />
            </View>
            <View style={{flexDirection: 'column', alignItems: 'left'}}>
              <Text
                style={{
                  fontSize: theme.fs5,
                  fontFamily: theme.font.regular,
                  color: theme.text2,
                  marginBottom: -5,
                }}>
                {getGreeting()}
              </Text>
              <Text
                style={{
                  fontSize: theme.fs2,
                  fontFamily: theme.font.bold,
                  color: theme.text,
                }}>
                {getFirstName(user.username)}
              </Text>
            </View>
          </View>
          <View style={styles.sec2}>
            <TouchableOpacity>
              <Icon name="language" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              <Icon name="settings" size={30} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
};

export default Home;

const styles = StyleSheet.create({
  header: {
    width: '100%',
    marginTop: 5,
    paddingHorizontal: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sec1: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  sec2: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
});
