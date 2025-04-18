import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Keyboard, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import Markdown from 'react-native-markdown-display';
import Header from '../components/Header';
import { theme } from '../theme.config';

const API_URL = 'http://192.168.29.116:5002/govscheme';

const Schemes = () => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! Ask me about government schemes for farmers.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    Keyboard.dismiss();
    setLoading(true);
    try {
      const res = await axios.post(API_URL, { query: userMsg.text });
      let botText = res.data?.response || 'Sorry, I could not find any information.';
      setMessages(prev => [...prev, { from: 'bot', text: botText }]);
    } catch (err) {
      setMessages(prev => [...prev, { from: 'bot', text: 'Network error. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[theme.container, {flex: 1}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={8} // Adjust this value according to your tab bar/header height
    >
      <Header text="Schemes" />
      <ScrollView
        ref={scrollViewRef}
        style={styles.chat}
        contentContainerStyle={{ padding: 16, paddingBottom: 50 }} // Add enough bottom padding
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={msg.from === 'user' ? styles.userBubble : styles.botBubble}
          >
            <Markdown
              style={msg.from === 'user' ? markdownUser : markdownBot}
            >
              {msg.text}
            </Markdown>
          </View>
        ))}
        {loading && (
          <View style={styles.botBubble}><ActivityIndicator size="small" color="#333" /></View>
        )}
      </ScrollView>
      <View style={[styles.inputRow]}> {/* Add extra bottom padding */}
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about a scheme..."
          onSubmitEditing={sendMessage}
          editable={!loading}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  chat: { flex: 1 },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1f5d3',
    borderRadius: 12,
    marginBottom: 8  ,
    padding: 10,
    maxWidth: '85%',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    padding: 10,
    maxWidth: '85%',
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const markdownBot = {
  body: { color: '#222', fontSize: 15 },
  strong: { fontWeight: 'bold' },
  table: { borderWidth: 1, borderColor: '#ccc' },
  th: { backgroundColor: '#e0e0e0', fontWeight: 'bold' },
  tr: { borderBottomWidth: 1, borderColor: '#eee' },
  td: { padding: 4 },
};
const markdownUser = {
  body: { color: '#222', fontSize: 15 },
};

export default Schemes;
