import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {theme} from '../theme.config';
import {UserContext} from '../context/UserContext';
import {ActivityIndicator} from 'react-native-paper';

const Signup = () => {
  //context
  const {signup, loading} = useContext(UserContext);

  const navigation = useNavigation();
  const desc = 'Sign up to connect, manage crops, and access trade insights.';

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [role, setRole] = useState('');
  const [gender, setGender] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  const [openRole, setOpenRole] = useState(false);
  const [openGender, setOpenGender] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);

  const [roleItems, setRoleItems] = useState([
    {label: 'Farmer', value: 'Farmer'},
    {label: 'Logistics', value: 'Logistics'},
  ]);
  const [genderItems, setGenderItems] = useState([
    {label: 'Male', value: 'Male'},
    {label: 'Female', value: 'Female'},
    {label: 'Other', value: 'Other'},
  ]);
  const [countryItems, setCountryItems] = useState([
    {label: '+91', value: '+91'},
    {label: '+1', value: '+1'},
    {label: '+44', value: '+44'},
  ]);

  const handleSignup = async () => {
    const fullPhone = `${countryCode}${phone}`;
    if (phone.length != 10) {
      Toast.show({
        type: 'error',
        text1: 'Phone number should be valid',
        text2: 'Please enter a 10 digit valid phone number',
      });
      return;
    }
    const userData = {
      username,
      phoneNo: fullPhone,
      email,
      password,
      role,
      gender,
    };

    try {
      const result = await signup(userData);
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: result.message,
          text2: 'User has successfully been signed up',
        });
        navigation.reset({
          index: 0,
          routes: [{name: 'Home'}],
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Signup Failed',
          text2: result.message || 'An error occurred during signup',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: err.message || 'An error occurred during signup',
      });
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
        <Text style={styles.appName}>Sign Up</Text>
      </View>

      {/* Scrollable Form */}
      <ScrollView
        contentContainerStyle={[styles.form, {paddingHorizontal: 24}]}>
        <Text style={styles.description}>{desc}</Text>

        <TextInput
          placeholder="Username*"
          placeholderTextColor={theme.text3}
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
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
            placeholder="Phone Number*"
            placeholderTextColor={theme.text3}
            keyboardType="phone-pad"
            style={[styles.input, {flex: 1}]}
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
          />
        </View>

        <TextInput
          placeholder="Email"
          placeholderTextColor={theme.text3}
          keyboardType="email-address"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password*"
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

        <View
          style={[
            styles.rowDropdowns,
            {zIndex: openRole ? 999 : openGender ? 998 : 1},
          ]}>
          <View style={{flex: 1}}>
            <DropDownPicker
              open={openRole}
              value={role}
              items={roleItems}
              setOpen={setOpenRole}
              setValue={setRole}
              setItems={setRoleItems}
              placeholder="Select Role*"
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>
          <View style={{flex: 1}}>
            <DropDownPicker
              open={openGender}
              value={gender}
              items={genderItems}
              setOpen={setOpenGender}
              setValue={setGender}
              setItems={setGenderItems}
              placeholder="Select Gender*"
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>
        </View>
      </ScrollView>

      <View style={{padding: 20}}>
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          {loading ? (
            <ActivityIndicator color='white' />
          ) : (
            <Text style={styles.signupText}>Sign Up</Text>
          )}
        </TouchableOpacity>
        <View style={styles.loginLink}>
          <Text style={styles.footer}>{'Already have an Account?'}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.footer, {color: theme.darkBrown}]}>
              {' '}
              Login
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
  rowDropdowns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    gap: 8,
  },
  dropdown: {
    borderColor: theme.border,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontFamily: theme.font.bold,
    fontSize: theme.fs6,
    color: theme.text,
  },
  dropdownContainer: {
    borderColor: theme.border,
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
    zIndex: 10,
  },
  loginLink: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 10,
  },
});

export default Signup;
