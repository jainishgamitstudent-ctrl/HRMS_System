import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BottomNav } from '../../../components/BottomNav';
import { useNotifications } from '../../../context/NotificationContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/layout/Header';
import { useAppTheme } from '@/context/ThemeContext';
import Animated, { 
  FadeInDown, 
  FadeIn, 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  menuButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  senderSection: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
  },
  senderTextInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  divisionName: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 0,
  },
  contentSection: {
    padding: 20,
  },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  typeTagText: {
    color: '#6366f1',
    fontSize: 11,
    fontWeight: '700',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 28,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 24,
  },
  highlightsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  actionButtonsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '800',
  },
  attachmentSection: {
    padding: 20,
  },
  attachmentLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 16,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
  },
  pdfIconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  pdfText: {
     position: 'absolute',
     bottom: 4,
     fontSize: 8,
     fontWeight: '900',
     color: '#ef4444',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: '#94a3b8',
  },
  downloadButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 16,
  },
});

const NotificationDetails = () => {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams();
  const { getNotificationById } = useNotifications();

  const notification = getNotificationById(id as string);

  if (!notification) {
    return (
      <View style={styles.container}>
      <Header title="Not Found" showBack={true} />
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={60} color="#e2e8f0" />
          <Text style={styles.emptyTitle}>Notification not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{color: '#4f46e5', fontWeight: '700', marginTop: 10}}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Notification Details" 
        showBack={true} 
        rightElement={
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        }
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sender Info */}
        <Animated.View 
          entering={FadeIn.duration(600)}
          style={styles.senderSection}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Ionicons 
                name={
                  notification.type === 'leave' ? 'calendar' :
                  notification.type === 'attendance' ? 'time' :
                  notification.type === 'payroll' ? 'cash' :
                  'megaphone'
                } 
                size={24} 
                color="#4f46e5" 
              />
            </View>
            {notification.isOnline && <View style={styles.onlineDot} />}
          </View>
          <View style={styles.senderTextInfo}>
            <Text style={styles.senderName}>{notification.sender}</Text>
            <Text style={styles.divisionName}>{notification.division}</Text>
            <Text style={styles.timestamp}>{notification.timestamp}</Text>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.contentSection}
        >
          {/* Tag */}
          <View style={[styles.typeTag, { backgroundColor: '#eef2ff' }]}>
            <Text style={[styles.typeTagText, { color: '#4f46e5' }]}>
              {notification.type.toUpperCase()}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.mainTitle}>{notification.title}</Text>

          {/* Description */}
          <Text style={styles.descriptionText}>{notification.description}</Text>

          {/* Highlights */}
          {notification.highlights && notification.highlights.length > 0 && (
            <View style={styles.highlightsContainer}>
              {notification.highlights.map((item, index) => (
                <View key={index} style={styles.highlightItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#6366f1" />
                  <Text style={styles.highlightText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              activeOpacity={0.8}
              onPress={() => notification.route && router.push(notification.route as any)}
            >
                <Ionicons name="eye-outline" size={20} color="#fff" style={{marginRight: 8}} />
                <Text style={styles.primaryButtonText}>View Related Module</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
                <Ionicons name="checkbox-outline" size={20} color={colors.text} style={{marginRight: 8}} />
                <Text style={styles.secondaryButtonText}>Acknowledge Receipt</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        {/* Attachments */}
        {notification.attachment && (
          <Animated.View 
            entering={FadeInDown.delay(400).springify()}
            style={styles.attachmentSection}
          >
            <Text style={styles.attachmentLabel}>Attachments (1)</Text>
            <View style={styles.attachmentCard}>
               <View style={styles.pdfIconBox}>
                  <Ionicons name="document-outline" size={24} color="#ef4444" />
                  <Text style={styles.pdfText}>PDF</Text>
               </View>
               <View style={styles.attachmentInfo}>
                  <Text style={styles.attachmentName}>{notification.attachment.name}</Text>
                  <Text style={styles.attachmentSize}>{notification.attachment.size}</Text>
               </View>
               <TouchableOpacity style={styles.downloadButton} onPress={() => Alert.alert('Download Started', `Downloading ${notification.attachment?.name || 'file'}`)}>
                  <Ionicons name="download-outline" size={20} color={colors.textMuted} />
               </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
      <BottomNav />
    </View>
  );
};

export default NotificationDetails;
