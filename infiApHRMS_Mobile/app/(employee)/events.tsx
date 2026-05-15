import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Modal, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/layout/Header';
import { useAppTheme } from '@/context/ThemeContext';
import Animated, { 
  FadeInDown, 
  FadeIn, 
  ZoomIn, 
  ZoomOut,
  SlideInUp,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Monthly Townhall',
    date: 'Mar 25, 2026',
    time: '10:00 AM - 11:30 AM',
    location: 'Main Conference Hall / Zoom',
    description: 'Monthly company-wide meeting to discuss goals and achievements.',
    type: 'Upcoming',
    category: 'Meeting',
    image: 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=400&q=80'
  },
  {
    id: '2',
    title: 'Tech Workshop: AI in HR',
    date: 'Mar 28, 2026',
    time: '2:00 PM - 4:00 PM',
    location: 'Training Room 2',
    description: 'A deep dive into how AI is transforming HR processes.',
    type: 'Upcoming',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1591115765373-5a92141fab3a?w=400&q=80'
  },
  {
    id: '3',
    title: 'Holi Celebration 2026',
    date: 'Mar 14, 2026',
    time: '3:00 PM onwards',
    location: 'Office Terrace',
    description: 'Festival of colors celebration with snacks and music.',
    type: 'Past',
    category: 'Celebration',
    image: 'https://images.unsplash.com/photo-1590072223844-7082a89f927e?w=400&q=80'
  },
];

const EventCard = ({ item, index }: { item: typeof MOCK_EVENTS[0]; index: number }) => {
  const { colors } = useAppTheme();
  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.card}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={colors.textMuted} />
          <Text style={styles.infoText}>{item.time}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={colors.textMuted} />
          <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      </View>
    </Animated.View>
  );
};

export default function EventsPage() {
  const { colors } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past'>('Upcoming');
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const filteredEvents = events.filter(e => e.type === activeTab);

  const handleAddEvent = () => {
    if (!newTitle || !newDate) return;
    const payload = { title: newTitle, date: newDate, description: newDesc, category: 'Event' };

    // optimistic add
    const newEvent = {
      id: Math.random().toString(),
      title: newTitle,
      date: newDate,
      time: 'TBD',
      location: 'Office',
      description: newDesc,
      type: 'Upcoming' as const,
      category: 'Event',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80'
    };
    setEvents([newEvent, ...events]);
    setModalVisible(false);
    setNewTitle('');
    setNewDate('');
    setNewDesc('');
    setSuccessVisible(true);
    setTimeout(() => setSuccessVisible(false), 2000);

    const api = require('../../constants/api').ADMIN_API_URL;
    fetch(`${api}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {
      // ignore for now; optimistic UI kept
    });
  };

  useEffect(() => {
    const api = require('../../constants/api').ADMIN_API_URL;
    fetch(`${api}/events?type=upcoming`).then(r => r.json()).then(json => {
      if (json && json.status === 'Success' && Array.isArray(json.data)) {
        const mapped = json.data.map((e: any) => ({ id: e.id, title: e.title, date: (new Date(e.date)).toDateString(), time: e.time || 'TBD', location: e.location || 'Office', description: e.description, type: 'Upcoming', category: e.category, image: e.image }));
        setEvents(mapped);
      }
    }).catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Events" showBack={true} />

      <View style={styles.tabContainer}>
        {['Upcoming', 'Past'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.listContainer}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((item, index) => (
              <EventCard key={item.id} item={item} index={index} />
            ))
          ) : (
            <Animated.View entering={ZoomIn} style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-outline" size={60} color="#e2e8f0" />
              </View>
              <Text style={styles.emptyTitle}>No {activeTab.toLowerCase()} events</Text>
              <Text style={styles.emptySub}>Check back later for company activities!</Text>
            </Animated.View>
          )}
        </Animated.View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Event</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Event Title</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Team Outing"
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Apr 10, 2026"
                value={newDate}
                onChangeText={setNewDate}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Short Description</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Details..."
                multiline
                numberOfLines={3}
                value={newDesc}
                onChangeText={setNewDesc}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddEvent}>
              <Text style={styles.submitBtnText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Success Popup */}
      {successVisible && (
        <View style={styles.successOverlay} pointerEvents="none">
          <Animated.View entering={ZoomIn} exiting={ZoomOut} style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={50} color="#22c55e" />
            <Text style={styles.successText}>Event Added Successfully! ✅</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    gap: 12,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  activeTab: {
    backgroundColor: '#4f46e5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  activeTabText: {
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  listContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f46e5',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 8,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  successBox: {
    alignItems: 'center',
    gap: 12,
  },
  successText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
});
