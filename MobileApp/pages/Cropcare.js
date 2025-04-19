import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, ScrollView, Platform, Alert } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import axios from 'axios';
import Markdown from 'react-native-markdown-display';
import Header from '../components/Header';
import { theme } from '../theme.config';

const API_BASE_URL = __DEV__ 
  ? 'http://192.168.29.116:5002'
  : 'https://your-production-api.com';

const API_URL = `${API_BASE_URL}/plant-disease`;

const Cropcare = () => {
  const [image, setImage] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear any errors when component mounts
  useEffect(() => {
    setError(null);
  }, []);

  const pickImage = async () => {
    try {
      launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: false,
      }, async (response) => {
        if (response.didCancel) return;
        
        if (response.errorCode) {
          setError(`Image picker error: ${response.errorMessage}`);
          return;
        }
        
        if (response.assets && response.assets.length > 0) {
          setImage(response.assets[0]);
          setDiagnosis('');
          setError(null);
          await uploadImage(response.assets[0]);
        }
      });
    } catch (err) {
      setError('Failed to open image picker');
      console.error('Image picker error:', err);
    }
  };

  const takePhoto = async () => {
    try {
      launchCamera({
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: false,
        saveToPhotos: true,
      }, async (response) => {
        if (response.didCancel) return;

        if (response.errorCode) {
          setError(`Camera error: ${response.errorMessage}`);
          return;
        }

        if (response.assets && response.assets.length > 0) {
          setImage(response.assets[0]);
          setDiagnosis('');
          setError(null);
          await uploadImage(response.assets[0]);
        }
      });
    } catch (err) {
      setError('Failed to open camera');
      console.error('Camera error:', err);
    }
  };


  const uploadImage = async (img) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
        name: img.fileName || 'photo.jpg',
        type: img.type || 'image/jpeg',
      });

      console.log('Uploading image:', img.uri);
      
      const res = await axios.post(API_URL, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 30000, 
      });
      
      if (res.data && res.data.diagnosis) {
        setDiagnosis(res.data.diagnosis);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        setError(`Server error: ${err.response.status}. ${err.response.data?.error || ''}`);
      } else if (err.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[theme.container, {flex: 1}]}>
      <Header text="Crop Care" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} disabled={loading}>
          <Text style={styles.uploadBtnText}>{image ? 'Change Image' : 'Upload Image'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto} disabled={loading}>
          <Text style={styles.cameraBtnText}>Take Photo</Text>
        </TouchableOpacity>
        
        {image && (
          <Image
            source={{ uri: image.uri }}
            style={styles.preview}
            resizeMode="contain"
          />
        )}
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#228B22" />
            <Text style={styles.loadingText}>Analyzing plant image...</Text>
          </View>
        )}
        
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {diagnosis ? (
          <View style={styles.resultBox}>
            <Markdown style={markdownStyles}>{diagnosis}</Markdown>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  uploadBtn: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 18,
  },
  uploadBtnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 18,
    marginTop: 8,
    backgroundColor: '#f1f1f1',
  },
  resultBox: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
    fontSize: 16,
  },
  errorBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  cameraBtn: {
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 18,
  },
  cameraBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

const markdownStyles = {
  body: { color: '#222', fontSize: 15 },
  strong: { fontWeight: 'bold' },
  h3: { fontSize: 18, marginTop: 12, fontWeight: 'bold', color: '#2e7d32' },
  h4: { fontSize: 16, marginTop: 10, fontWeight: 'bold', color: '#388e3c' },
  li: { marginBottom: 4 },
};

export default Cropcare;