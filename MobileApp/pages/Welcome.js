import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../theme.config';

const Welcome = () => {
  const navigation = useNavigation();

  const desc =
    'Join a growing community of farmers, buyers, and agri-experts working together to improve productivity, connect directly, and access real-time insights for better crop management and trade.';

  return (
    <View style={theme.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.jpg')}
            style={styles.logo}
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.appName}>Krishi Setu</Text>
          <Text style={styles.description}>{desc}</Text>

          <TouchableOpacity
            style={[styles.button, {backgroundColor: theme.secondary}]}
            onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, {backgroundColor: theme.darkBrown}]}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresRow}>
          <Feature
            icon={require('../assets/icons/smart-farming.png')}
            label="Smart Farming"
          />
          <Feature
            icon={require('../assets/icons/direct-trade.png')}
            label="Direct Trade"
          />
          <Feature
            icon={require('../assets/icons/crop-insights.png')}
            label="Crop Insights"
          />
          <Feature
            icon={require('../assets/icons/expert-advice.png')}
            label="Expert Help"
          />
        </View>
      </ScrollView>

      <View style={styles.madeWithLove}>
        <Text style={styles.madeWithLoveText}>🇮🇳 Made in India with ❤️</Text>
      </View>
    </View>
  );
};

const Feature = ({icon, label}) => (
  <View style={styles.featureItem}>
    <Image source={icon} style={styles.featureIcon} />
    <Text style={styles.featureLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 270,
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: '10%',
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  contentContainer: {
    marginTop: '10%',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: theme.fs0,
    fontFamily: theme.font.dark,
    color: theme.text2,
    marginBottom: 10,
  },
  description: {
    fontSize: theme.fs7,
    fontFamily: theme.font.light,
    color: theme.text2,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    width: '90%',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
  },
  buttonText: {
    fontSize: theme.fs4,
    fontFamily: theme.font.bold,
    color: theme.white,
    textAlign: 'center',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    width: '100%',
    paddingHorizontal: 10,
  },
  featureItem: {
    alignItems: 'center',
    width: '20%',
  },
  featureIcon: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  featureLabel: {
    fontSize: theme.fs7,
    textAlign: 'center',
    color: theme.text2,
    fontFamily: theme.font.light,
  },
  madeWithLove: {
    position : 'absolute',
    width : '100%',
    alignItems: 'center',
    justifyContent: 'center',
    bottom : 7,
    marginLeft  :  '4%'
  },
  madeWithLoveText: {
    fontSize: 13,
    fontFamily: theme.font.light,
    color: theme.text2,
    opacity: 0.7,
  },
});

export default Welcome;
