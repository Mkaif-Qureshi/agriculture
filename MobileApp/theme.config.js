import {Dimensions, StatusBar} from 'react-native';
import { opacity } from 'react-native-reanimated/lib/typescript/Colors';

const {width, height} = Dimensions.get('window');

export const theme = {
  primary: '#E76F00', // Orange turban
  secondary: '#467B37', // Green sickle handle and leaves
  accent: '#FDBA38', // Yellow background
  darkBrown: '#4B3F35', // Outlines (like mustache, shirt lines)
  skin: '#F5C9A4', // Face tone

  bg: '#FFFDF9', // Off-white background
  card: '#FAF6F0', // Light background for cards
  border: '#DDD5CC', // Light border
  shadow: '#B3A89D', // Softer shadow
  overlay: 'rgba(0,0,0,0.05)',

  text: '#3A2E26', // Primary text (dark brown)
  text2: '#5C5048', // Secondary text
  text3: '#A89E95', // Muted text
  link: '#E76F00', // Reuse orange for links
  white: '#FFFFFF',

  fs0 : width * 0.099,
  fs1: width * 0.07,
  fs2: width * 0.055,
  fs3: width * 0.05,
  fs4: width * 0.045,
  fs5: width * 0.04,
  fs6: width * 0.035,
  fs7: width * 0.03,

  r1: 20,
  r2: 12,
  r3: 6,

  font: {
    regular: 'Poppins-Regular',
    bold: 'Poppins-Bold',
    light: 'Poppins-Light',
    thin: 'Poppins-Thin',
    dark: 'Poppins-Black',
  },

  width,
  height,

  container: {
    backgroundColor: 'white',
    width: width,
    height: height + StatusBar.currentHeight,
    padding: width * 0.02,
    paddingTop: StatusBar.currentHeight + width * 0.06,
    flexDirection: 'column',
    paddingTop: StatusBar.currentHeight + 20,
    padding: 20,
  },
  test: {borderWidth: 1, borderColor: 'black'},
  button: {
    width: '100%',
    paddingVertical: width * 0.04,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: width * 0.05,
  },
};
