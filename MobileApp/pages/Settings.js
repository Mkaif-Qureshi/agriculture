import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {theme} from '../theme.config';
import Icon from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import {useNavigation} from '@react-navigation/native';
//import ProgressBar from 'react-native-progress/Bar';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import Header from '../components/Header';
import {useContext, useEffect, useState} from 'react';
import {UserContext} from '../context/UserContext';
import {BACKEND_URL} from '../backendConfig';
import Toast from 'react-native-toast-message';

const Settings = () => {
  const navigation = useNavigation();
  const {user, logout} = useContext(UserContext);
  const [progress, setProgress] = useState(0);

  const btnList = [
    {name: 'Update Profile', route: ''},
    {name: 'Documents', route: ''},
    {name: 'Change Language', route: ''},
    {name: 'Change Password', route: ''},
  ];

  useEffect(() => {
    const fetchProfileCompletion = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/profile-completion`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (data.success) {
          setProgress(data.percentage);
        } else {
          setProgress(0);
          Toast.show({
            type: 'error',
            text1: 'Error occured while fetching profile data',
            text2: data.message,
          });
        }
      } catch (err) {
        console.log(err);
        Toast.show({
          type: 'error',
          text1: 'Error occured while fetching profile data',
          text2: err,
        });
      }
    };
    fetchProfileCompletion();
  }, []);

  const handleLogout = async () => {
    console.log('hi');
    try {
      const result = await logout();
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Logout',
          text2: result.message,
        });
        navigation.navigate('Welcome');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Logout error',
          text2: result.message,
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Logout error',
        text2: err,
      });
    }
  };

  return (
    <View style={theme.container}>
      <Header text={'Profile and Settings'} />
      <View
        style={{
          marginVertical: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <AnimatedCircularProgress
          size={80}
          width={7}
          fill={progress}
          tintColor={theme.secondary}
          backgroundColor="#e0e0e0"
          duration={1000}>
          {() => (
            <Text
              style={{
                fontSize: 15,
                color: theme.text,
                fontFamily: theme.font.regular,
                marginTop: 3,
              }}>
              {progress}%
            </Text>
          )}
        </AnimatedCircularProgress>
        <Text
          style={{
            fontSize: 13,
            color: theme.text3,
            fontFamily: theme.font.regular,
            marginTop: 3,
            width: theme.width - 130,
          }}>{`Your profile is ${progress}% complete. Let’s finish planting the details for a better experience.`}</Text>
      </View>
      <View style={[{marginHorizontal: -20, marginTop: 5, height: '78%'}]}>
        <ScrollView style={[{width: '100%', height: '100%'}]}>
          {btnList.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.button}
              onPress={() => {
                if (item.route) navigation.navigate(item.route);
              }}>
              <Text style={styles.buttonText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={[styles.buttonText, {color: 'red'}]}>{'Logout'}</Text>
          </TouchableOpacity>
          <View style={{height: 300}}></View>
        </ScrollView>
      </View>
    </View>
  );
};
export default Settings;

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  buttonText: {
    fontSize: theme.fs5,
    color: theme.text2,
    fontFamily: theme.font.bold,
    marginTop: 3,
  },
});
