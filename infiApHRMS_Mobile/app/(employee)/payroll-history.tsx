import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/layout/Header';

import { useAppTheme } from '@/context/ThemeContext';
const HISTORY_DATA = [
  { id: '1', month: 'September 2023', salary: '$3,450.00', date: 'Sept 30', status: 'Paid', year: '2023' },
  { id: '2', month: 'August 2023', salary: '$3,450.00', date: 'Aug 31', status: 'Paid', year: '2023' },
  { id: '3', month: 'July 2023', salary: '$3,450.00', date: 'July 31', status: 'Paid', year: '2023' },
  { id: '4', month: 'June 2023', salary: '$3,200.00', date: 'June 30', status: 'Paid', year: '2023' },
  { id: '5', month: 'May 2023', salary: '$3,200.00', date: 'May 31', status: 'Paid', year: '2023' },
  { id: '6', month: 'April 2023', salary: '$3,200.00', date: 'April 30', status: 'Paid', year: '2023' },
];

const YEARS = ['2023', '2022', '2021'];

export default function PayrollHistory() {
  const { colors } = useAppTheme();
  const [activeYear, setActiveYear] = useState('2023');
  const [detailsVisible, setDetailsVisible] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Header title="Salary History" showBack={true} />

      <View style={styles.filterContainer}>
        {YEAR_LIST(activeYear, setActiveYear)}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.listContainer}>
          {HISTORY_DATA.filter(item => item.year === activeYear).map((item, index) => (
            <Animated.View 
              key={item.id}
              entering={FadeInDown.delay(index * 100).springify()}
              style={styles.historyCard}
            >
              <TouchableOpacity 
                style={styles.historyBtn} 
                activeOpacity={0.7} 
                onPress={() => setDetailsVisible(true)}
              >
                <View style={styles.historyLeading}>
                  <View style={styles.fileIconBox}>
                    <Ionicons name="document-text-outline" size={24} color={colors.textMuted} />
                  </View>
                  <View>
                    <Text style={styles.historyMonth}>{item.month}</Text>
                    <Text style={styles.historySub}>NET SALARY: {item.salary}</Text>
                  </View>
                </View>
                <View style={styles.historyTrailing}>
                  <View style={styles.historyPaidBadge}>
                    <Text style={styles.historyPaidText}>{item.status}</Text>
                  </View>
                  <Text style={styles.historyDate}>{item.date}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Details Modal (Same as Dashboard) */}
      <Modal visible={detailsVisible} transparent={true} animationType="slide">
        <TouchableOpacity 
           style={styles.modalOverlay} 
           activeOpacity={1} 
           onPress={() => setDetailsVisible(false)}
        >
          <Animated.View entering={SlideInUp} style={styles.modalContent}>
             <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Salary Breakdown</Text>
                <TouchableOpacity onPress={() => setDetailsVisible(false)}>
                   <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                </TouchableOpacity>
             </View>
             
             <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Basic Salary</Text>
                <Text style={styles.breakdownValue}>$2,500.00</Text>
             </View>
             <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>HRA</Text>
                <Text style={styles.breakdownValue}>$500.00</Text>
             </View>
             <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Net Payable Salary</Text>
                <Text style={styles.totalValue}>$3,450.00</Text>
             </View>
             <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailsVisible(false)}>
                <Text style={styles.closeBtnText}>Close</Text>
             </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      <BottomNav />
    </View>
  );
}

const YEAR_LIST = (active: string, setActive: (y: string) => void) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearScroll}>
    {YEARS.map(year => (
      <TouchableOpacity 
        key={year} 
        style={[styles.yearTab, active === year && styles.activeYearTab]}
        onPress={() => setActive(year)}
      >
        <Text style={[styles.yearText, active === year && styles.activeYearText]}>{year}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

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
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  yearScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  yearTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  activeYearTab: {
    backgroundColor: '#4f46e5',
  },
  yearText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  activeYearText: {
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  listContainer: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  historyBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  historyLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyMonth: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  historySub: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  historyTrailing: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyPaidBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  historyPaidText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
  },
  historyDate: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
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
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  breakdownLabel: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '800',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    backgroundColor: '#f1f5f9',
    padding: 20,
    borderRadius: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4f46e5',
  },
  closeBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
