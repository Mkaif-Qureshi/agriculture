import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import {ActivityIndicator, RadioButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';
import {theme} from '../theme.config';
import {UserContext} from '../context/UserContext';

const Login = () => {
  const {loginWithPhonePassword, loginWithEmailPassword, loading} =
    useContext(UserContext);
  const navigation = useNavigation();
  const desc = 'Login to access your dashboard and manage your activities.';

  const [loginType, setLoginType] = useState('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [countryCode, setCountryCode] = useState('+91');
  const [openCountry, setOpenCountry] = useState(false);
  const [countryItems, setCountryItems] = useState([
    {label: '+91', value: '+91'},
    {label: '+1', value: '+1'},
    {label: '+44', value: '+44'},
  ]);

  const handleLogin = async () => {
    if (loginType === 'phone') {
      const fullPhone = `${countryCode}${phone}`;
      if (phone.length != 10) {
        Toast.show({
          type: 'error',
          text1: 'Phone number should be valid',
          text2: 'Please enter a 10 digit valid phone number',
        });
        return;
      }
      if (password.length < 8) {
        Toast.show({
          type: 'error',
          text1: 'Password Format failed',
          text2: 'Password cannot be less than 8 characters',
        });
        return;
      }
      const loginData = {
        phoneNo: fullPhone,
        password,
      };
      try {
        const result = await loginWithPhonePassword(loginData);
        if (result.success) {
          Toast.show({
            type: 'success',
            text1: result.message,
            text2: 'User has successfully been signed in',
          });
          navigation.reset({
            index: 0,
            routes: [{name: 'Home'}],
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Login Failed',
            text2: result.message || 'An error occurred during login',
          });
        }
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: err.message || 'An error occurred during login',
        });
      }
    }
    if (loginType === 'email') {
      if (password.length < 8) {
        Toast.show({
          type: 'error',
          text1: 'Password Format failed',
          text2: 'Password cannot be less than 8 characters',
        });
        return;
      }
      const loginData = {
        email,
        password,
      };
      try {
        const result = await loginWithEmailPassword(loginData);
        if (result.success) {
          Toast.show({
            type: 'success',
            text1: result.message,
            text2: 'User has successfully been signed in',
          });
          navigation.reset({
            index: 0,
            routes: [{name: 'Home'}],
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Login Failed',
            text2: result.message || 'An error occurred during login',
          });
        }
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: err.message || 'An error occurred during login',
        });
      }
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Welcome')}>
          <Image
            source={require('../assets/icons/back.png')}
            style={{width: 25, height: 25}}
          />
        </TouchableOpacity>
        <Text style={styles.appName}>Login</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.form, {paddingHorizontal: 24}]}>
        <Text style={styles.description}>{desc}</Text>

        {/* Radio Button Group */}
        <View style={styles.radioGroup}>
          <View style={styles.radioOption}>
            <RadioButton
              value="phone"
              status={loginType === 'phone' ? 'checked' : 'unchecked'}
              onPress={() => setLoginType('phone')}
              color={theme.darkBrown}
            />
            <Text style={styles.radioText}>Phone</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton
              value="email"
              status={loginType === 'email' ? 'checked' : 'unchecked'}
              onPress={() => setLoginType('email')}
              color={theme.darkBrown}
            />
            <Text style={styles.radioText}>Email</Text>
          </View>
        </View>

        {loginType === 'phone' ? (
          <View style={styles.phoneRow}>
            <View style={{width: 90, zIndex: openCountry ? 999 : 1}}>
              <DropDownPicker
                open={openCountry}
                value={countryCode}
                items={countryItems}
                setOpen={setOpenCountry}
                setValue={setCountryCode}
                setItems={setCountryItems}
                style={styles.dropdown}
                textStyle={styles.dropdownText}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor={theme.text3}
              keyboardType="phone-pad"
              style={[styles.input, {flex: 1}]}
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
            />
          </View>
        ) : (
          <TextInput
            placeholder="Email"
            placeholderTextColor={theme.text3}
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        )}

        <TextInput
          placeholder="Password"
          placeholderTextColor={theme.text3}
          secureTextEntry={!showPassword}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.togglePassword}>
          <Text
            style={{
              color: theme.darkBrown,
              fontFamily: theme.font.bold,
              fontSize: theme.fs6,
            }}>
            {showPassword ? 'Hide' : 'Show'} Password
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={{padding: 20}}>
        <TouchableOpacity style={styles.signupButton} onPress={handleLogin}>
        {loading ? (
            <ActivityIndicator color='white' />
          ) : (
            <Text style={styles.signupText}>Login</Text>
          )}
        </TouchableOpacity>
        <View style={styles.loginLink}>
          <Text style={styles.footer}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={[styles.footer, {color: theme.darkBrown}]}>
              {' '}
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topNav: {
    padding: 16,
    paddingTop: 50,
    flexDirection: 'column',
    backgroundColor: '#fff',
    gap: 7,
    marginBottom: -10,
  },
  backButton: {
    padding: 10,
    backgroundColor: theme.darkBrown,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
    width: 50,
  },
  appName: {
    fontSize: theme.fs0,
    fontFamily: theme.font.dark,
    color: theme.text2,
  },
  form: {},
  description: {
    fontSize: theme.fs7,
    fontFamily: theme.font.light,
    color: theme.text2,
    marginBottom: 10,
  },
  footer: {
    fontSize: theme.fs6,
    fontFamily: theme.font.light,
    color: theme.text2,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 3,
    padding: 12,
    marginVertical: 8,
    fontSize: theme.fs6,
    backgroundColor: '#fff',
    color: theme.text,
    fontFamily: theme.font.regular,
  },
  togglePassword: {
    marginTop: -4,
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
  signupButton: {
    backgroundColor: theme.secondary,
    padding: 14,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  signupText: {
    color: '#fff',
    fontSize: theme.fs5,
    fontFamily: theme.font.bold,
  },
  loginLink: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    fontSize: theme.fs6,
    fontFamily: theme.font.bold,
    color: theme.text,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 10,
    gap: 10,
  },
  dropdown: {
    borderColor: theme.border,
    borderRadius: 3,
  },
  dropdownText: {
    fontSize: theme.fs6,
    fontFamily: theme.font.bold,
    color: theme.text,
  },
  dropdownContainer: {
    borderColor: theme.border,
  },
});

export default Login;
