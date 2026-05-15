import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BottomNav } from '../../../components/BottomNav';
import { useUser } from '../../../context/UserContext';
import {
  fetchRequestRoomById,
  updateRequestRoomStatus,
  addRequestRoomMessage,
  type RequestRoom,
  type RequestRoomMessage,
} from '../../../services/requestRooms';
import Header from '../../../components/layout/Header';

import { useAppTheme } from '@/context/ThemeContext';
const StatusConfig: Record<string, { bg: string; text: string; label: string; icon: any }> = {
  pending: { bg: '#fef9c3', text: '#ca8a04', label: 'Pending', icon: 'time-outline' },
  approved: { bg: '#dcfce7', text: '#16a34a', label: 'Approved', icon: 'checkmark-circle-outline' },
  rejected: { bg: '#fee2e2', text: '#dc2626', label: 'Rejected', icon: 'close-circle-outline' },
};

const getSenderName = (sender: RequestRoomMessage['sender']) => {
  if (typeof sender === 'string') return 'User';
  return sender?.name || 'User';
};

export default function RequestRoomDetailPage() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const [room, setRoom] = useState<RequestRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [acting, setActing] = useState(false);

  const canAct = ['hr', 'admin', 'superadmin', 'manager'].includes(user?.systemRole || '');
  const isPending = room?.status === 'pending';

  const loadRoom = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchRequestRoomById(id);
      setRoom(res.data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load room');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setSending(true);
    try {
      const res = await addRequestRoomMessage(id, messageText.trim());
      setRoom(res.data);
      setMessageText('');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: 'approved' | 'rejected') => {
    setActing(true);
    try {
      const res = await updateRequestRoomStatus(id, status);
      setRoom(res.data);
      Alert.alert('Success', `Request ${status}.`);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update status');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Request Room" showBack={true} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f39f6" />
        </View>
      </View>
    );
  }

  if (error || !room) {
    return (
      <View style={styles.container}>
        <Header title="Request Room" showBack={true} />
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Room not found'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadRoom}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusConfig = StatusConfig[room.status] || StatusConfig.pending;

  return (
    <View style={styles.container}>
      <Header title="Request Room" showBack={true} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon} size={22} color={statusConfig.text} />
          <Text style={[styles.statusBannerText, { color: statusConfig.text }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Request Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View
              style={[
                styles.typeIcon,
                {
                  backgroundColor:
                    room.requestType === 'leave' ? '#eff6ff' : '#f5f3ff',
                },
              ]}
            >
              <Ionicons
                name={room.requestType === 'leave' ? 'calendar' : 'chatbubble'}
                size={22}
                color={room.requestType === 'leave' ? '#3b82f6' : '#8b5cf6'}
              />
            </View>
            <View style={styles.infoHeaderText}>
              <Text style={styles.infoTitle}>{room.title}</Text>
              <Text style={styles.infoMeta}>
                {room.leaveType || room.requestType} ·{' '}
                {new Date(room.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          {room.description ? (
            <Text style={styles.infoDesc}>{room.description}</Text>
          ) : null}
        </View>

        {/* Action Buttons for HR/Admin */}
        {canAct && isPending && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#dcfce7' }]}
              onPress={() => handleStatusChange('approved')}
              disabled={acting}
            >
              {acting ? (
                <ActivityIndicator size="small" color="#16a34a" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#16a34a" />
                  <Text style={[styles.actionBtnText, { color: '#16a34a' }]}>Approve</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#fee2e2' }]}
              onPress={() => handleStatusChange('rejected')}
              disabled={acting}
            >
              {acting ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <>
                  <Ionicons name="close" size={20} color="#dc2626" />
                  <Text style={[styles.actionBtnText, { color: '#dc2626' }]}>Reject</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Messages */}
        <Text style={styles.sectionTitle}>Room Activity</Text>
        {room.messages.length === 0 ? (
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyMessagesText}>No activity yet.</Text>
          </View>
        ) : (
          room.messages.map((msg, idx) => (
            <View key={idx} style={styles.messageRow}>
              <View style={styles.messageAvatar}>
                <Text style={styles.messageAvatarText}>
                  {getSenderName(msg.sender).charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.messageBody}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageSender}>{getSenderName(msg.sender)}</Text>
                  <Text style={styles.messageTime}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!messageText.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: '#4f39f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 12,
  },
  statusBannerText: {
    fontSize: 15,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoHeaderText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  infoMeta: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  infoDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyMessages: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyMessagesText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  messageRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4f39f6',
  },
  messageBody: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  messageTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  messageText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4f39f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#c7d2fe',
  },
});
