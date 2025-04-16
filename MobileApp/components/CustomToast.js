import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { theme } from '../theme.config';

const CustomToast = ({ text1, text2 }) => (
  <View style={styles.container}>
    <Text style={styles.text1}>{text1}</Text>
    {text2 && <Text style={styles.text2}>{text2}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    width : '92%',
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  text1: {
    fontFamily: theme.font.bold, 
    fontSize: theme.fs6,
    color: '#fff',
  },
  text2: {
    fontFamily: theme.font.regular,
    fontSize: theme.fs7,
    color: '#ccc',
  },
});

export default CustomToast;
