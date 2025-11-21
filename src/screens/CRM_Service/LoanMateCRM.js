// screens/CRM_Service/LoanMateCRM.js
// Updated UI to match the new design

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

// ⚠️ IMPORTANT: Replace this with your actual backend URL
const API_BASE_URL = 'https://crmloanmate-chatbot.onrender.com';

const LoanMateCRM = ({ navigation, route }) => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { 
      type: 'bot', 
      text: "Hello! I'm your LoanMate financial assistant. I can help you with loan eligibility, credit evaluation, and financial advice. How can I assist you today? 💰",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const scrollViewRef = useRef();

  const customerData = {
    totalCustomers: 1247,
    activeLoans: 856,
    monthlyGrowth: '+12.5%',
    recentCustomers: [
      { id: 1, name: 'Rahul Sharma', status: 'Active', amount: '₹5,50,000', phone: '+91 98765 43210' },
      { id: 2, name: 'Priya Patel', status: 'Pending', amount: '₹3,25,000', phone: '+91 98765 43211' },
      { id: 3, name: 'Amit Kumar', status: 'Active', amount: '₹7,80,000', phone: '+91 98765 43212' },
      { id: 4, name: 'Sneha Reddy', status: 'Active', amount: '₹4,60,000', phone: '+91 98765 43213' }
    ]
  };

  const callChatAPI = async (userMessage) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversationHistory
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setConversationHistory(data.conversationHistory);
        return data.reply;
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Chat API Error:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        return "I'm having trouble connecting to the server. Please check:\n\n1. Is your backend running?\n2. Is the API_BASE_URL correct?\n3. Are you using the right IP address (not localhost on physical device)?";
      }
      
      return `Sorry, I encountered an error: ${error.message}. Please try again.`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');

    const newUserMessage = {
      type: 'user',
      text: userMsg,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const botResponse = await callChatAPI(userMsg);
    setIsTyping(false);

    const newBotMessage = {
      type: 'bot',
      text: botResponse,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newBotMessage]);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuickReply = (message) => {
    setInputMessage(message);
    setTimeout(() => handleSendMessage(), 100);
  };

  const resetChat = () => {
    Alert.alert(
      'Reset Chat',
      'Are you sure you want to start a new conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setChatMessages([
              { 
                type: 'bot', 
                text: "Hello! I'm your LoanMate financial assistant. I can help you with loan eligibility, credit evaluation, and financial advice. How can I assist you today? 💰",
                timestamp: new Date().toISOString()
              }
            ]);
            setConversationHistory([]);
          }
        }
      ]
    );
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>LoanMate CRM</Text>
            <Text style={styles.headerSubtitle}>Customer Relationship Management</Text>
          </View>
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>LM</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Total Customers</Text>
              <Text style={styles.statValue}>{customerData.totalCustomers}</Text>
              <Text style={styles.statGrowth}>↑ {customerData.monthlyGrowth} This Month</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: '#E0E7FF' }]}>
              <Text style={styles.statIconText}>👥</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Active Loans</Text>
              <Text style={styles.statValue}>{customerData.activeLoans}</Text>
              <Text style={styles.statSubtext}>Currently Processing</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
              <Text style={styles.statIconText}>📈</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Response Rate</Text>
              <Text style={styles.statValue}>94.2%</Text>
              <Text style={styles.statSubtext}>Average Response</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: '#E9D5FF' }]}>
              <Text style={styles.statIconText}>💬</Text>
            </View>
          </View>
        </View>

        {/* LoanMate Promotion Card */}
        <View style={styles.promotionCard}>
          <View style={styles.promotionHeader}>
            <View style={styles.promotionIconContainer}>
              <Text style={styles.promotionIconText}>L</Text>
            </View>
            <View>
              <Text style={styles.promotionTitle}>LoanMate</Text>
              <Text style={styles.promotionSubtitle}>Smart Loan Management</Text>
            </View>
          </View>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.featureText}>AI-powered loan processing in minutes</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.featureText}>Instant eligibility checks and EMI calculations</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.featureText}>24/7 customer support with smart chatbot</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.featureText}>Secure document management system</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.promotionButton}>
            <Text style={styles.promotionButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>

        {/* Customer Data Section */}
        <View style={styles.customerSection}>
          <View style={styles.customerHeader}>
            <Text style={styles.customerTitle}>Recent Customers</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {customerData.recentCustomers.map((customer) => (
            <TouchableOpacity key={customer.id} style={styles.customerCard}>
              <View style={styles.customerInfo}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerAvatarText}>{getInitials(customer.name)}</Text>
                </View>
                <View style={styles.customerDetails}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <Text style={styles.customerPhone}>📞 {customer.phone}</Text>
                </View>
              </View>
              <View style={styles.customerRight}>
                <Text style={styles.customerAmount}>{customer.amount}</Text>
                <View style={[
                  styles.statusBadge,
                  customer.status === 'Active' ? styles.statusActive : styles.statusPending
                ]}>
                  <Text style={[
                    styles.statusText,
                    customer.status === 'Active' ? styles.statusActiveText : styles.statusPendingText
                  ]}>
                    {customer.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Chatbot Button */}
      {!showChatbot && (
        <TouchableOpacity
          style={styles.chatbotButton}
          onPress={() => setShowChatbot(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.chatbotButtonIcon}>💬</Text>
        </TouchableOpacity>
      )}

      {/* Chatbot Modal - NEW DESIGN */}
      <Modal
        visible={showChatbot}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChatbot(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.chatbotContainer}>
            {/* NEW Purple Header */}
            <View style={styles.newChatbotHeader}>
              <View style={styles.newHeaderTop}>
                <View style={styles.newHeaderLeft}>
                  <View style={styles.newChatbotAvatar}>
                    <Text style={styles.newAvatarEmoji}>🤖</Text>
                  </View>
                  <View style={styles.newHeaderText}>
                    <Text style={styles.newChatbotTitle}>Financial Assistant</Text>
                    <Text style={styles.newChatbotStatus}>AI-Powered • Online</Text>
                  </View>
                </View>
                <View style={styles.newHeaderButtons}>
                  <TouchableOpacity onPress={resetChat} style={styles.newIconButton}>
                    <Text style={styles.newIconButtonText}>🔄</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowChatbot(false)} style={styles.newCloseButton}>
                    <Text style={styles.newCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Chat Messages */}
            <ScrollView 
              ref={scrollViewRef}
              style={styles.chatMessages} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.chatMessagesContent}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {chatMessages.map((msg, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.messageContainer,
                    msg.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer
                  ]}
                >
                  {msg.type === 'bot' && (
                    <View style={styles.botAvatarSmall}>
                      <Text style={styles.botAvatarSmallText}>🤖</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      msg.type === 'user' ? styles.userMessage : styles.botMessage
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        msg.type === 'user' ? styles.userMessageText : styles.botMessageText
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </View>
                </View>
              ))}
              
              {isTyping && (
                <View style={styles.botMessageContainer}>
                  <View style={styles.botAvatarSmall}>
                    <Text style={styles.botAvatarSmallText}>🤖</Text>
                  </View>
                  <View style={[styles.messageBubble, styles.botMessage]}>
                    <View style={styles.typingIndicator}>
                      <ActivityIndicator size="small" color="#9CA3AF" />
                      <Text style={styles.typingText}>  Thinking...</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* NEW Quick Reply Cards */}
            <View style={styles.newQuickRepliesContainer}>
              <TouchableOpacity 
                style={styles.newQuickReplyCard}
                onPress={() => handleQuickReply('I need loan advice')}
                disabled={isTyping}
              >
                <Text style={styles.newQuickReplyIcon}>💰</Text>
                <Text style={styles.newQuickReplyText}>Loan Advice</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.newQuickReplyCard}
                onPress={() => handleQuickReply('Calculate my EMI')}
                disabled={isTyping}
              >
                <Text style={styles.newQuickReplyIcon}>📊</Text>
                <Text style={styles.newQuickReplyText}>Calculate EMI</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.newQuickReplyCard}
                onPress={() => handleQuickReply('Check my eligibility')}
                disabled={isTyping}
              >
                <Text style={styles.newQuickReplyIcon}>✅</Text>
                <Text style={styles.newQuickReplyText}>Check Eligibility</Text>
              </TouchableOpacity>
            </View>

            {/* Chat Input */}
            <View style={styles.newChatInputContainer}>
              <TextInput
                style={styles.newChatInput}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={handleSendMessage}
                multiline
                maxLength={500}
                editable={!isTyping}
              />
              <TouchableOpacity
                style={[styles.newSendButton, (!inputMessage.trim() || isTyping) && styles.newSendButtonDisabled]}
                onPress={handleSendMessage}
                activeOpacity={0.7}
                disabled={!inputMessage.trim() || isTyping}
              >
                <Text style={styles.newSendButtonText}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#111827',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statGrowth: {
    fontSize: 13,
    color: '#10B981',
    marginTop: 8,
  },
  statSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconText: {
    fontSize: 24,
  },
  promotionCard: {
    marginHorizontal: 20,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  promotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  promotionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  promotionIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  promotionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  promotionSubtitle: {
    fontSize: 13,
    color: '#C7D2FE',
    marginTop: 2,
  },
  featureList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: '#E0E7FF',
    lineHeight: 20,
  },
  promotionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  promotionButtonText: {
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 15,
  },
  customerSection: {
    paddingHorizontal: 20,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerAvatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  customerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  customerPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  customerRight: {
    alignItems: 'flex-end',
  },
  customerAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusActiveText: {
    color: '#065F46',
  },
  statusPendingText: {
    color: '#92400E',
  },
  chatbotButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  chatbotButtonIcon: {
    fontSize: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  chatbotContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
  },
  
  // NEW HEADER STYLES
  newChatbotHeader: {
    backgroundColor: '#5B4FDB',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  newHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  newChatbotAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  newAvatarEmoji: {
    fontSize: 24,
  },
  newHeaderText: {
    flex: 1,
  },
  newChatbotTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  newChatbotStatus: {
    color: '#D1D5FF',
    fontSize: 13,
    marginTop: 2,
  },
  newHeaderButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  newIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newIconButtonText: {
    fontSize: 16,
  },
  newCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // CHAT MESSAGES
  chatMessages: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  chatMessagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  botAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  botAvatarSmallText: {
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userMessage: {
    backgroundColor: '#5B4FDB',
    borderBottomRightRadius: 4,
  },
  botMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#111827',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    color: '#6B7280',
    fontSize: 14,
  },

  // NEW QUICK REPLY CARDS
  newQuickRepliesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  newQuickReplyCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  newQuickReplyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  newQuickReplyText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },

  // NEW CHAT INPUT
  newChatInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  newChatInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginRight: 10,
    maxHeight: 100,
  },
  newSendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5B4FDB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B4FDB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  newSendButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  newSendButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default LoanMateCRM;