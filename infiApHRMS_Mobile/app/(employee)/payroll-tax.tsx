import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/layout/Header';

import { useAppTheme } from '@/context/ThemeContext';
const { width } = Dimensions.get('window');

const TAX_BREAKDOWN = [
  { month: 'September 2023', tds: '$350.00', status: 'Deducted' },
  { month: 'August 2023', tds: '$350.00', status: 'Deducted' },
  { month: 'July 2023', tds: '$350.00', status: 'Deducted' },
  { month: 'June 2023', tds: '$350.00', status: 'Deducted' },
  { month: 'May 2023', tds: '$350.00', status: 'Deducted' },
  { month: 'April 2023', tds: '$350.00', status: 'Deducted' },
];

export default function PayrollTax() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Header title="Tax Details" showBack={true} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Taxable Income</Text>
            <Text style={styles.summaryValue}>$42,000.00</Text>
            <Text style={styles.summarySub}>Annual (Est.)</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.summaryCard, styles.tdsCard]}>
            <Text style={[styles.summaryLabel, styles.tdsLabel]}>TDS Deducted</Text>
            <Text style={[styles.summaryValue, styles.tdsValue]}>$2,100.00</Text>
            <Text style={styles.summarySub}>Year to Date</Text>
          </Animated.View>
        </View>

        {/* Tax Chart Placeholder (Simple visual) */}
        <Text style={styles.sectionTitle}>Monthly TDS Trend</Text>
        <Animated.View entering={FadeInDown.delay(300)} style={styles.chartCard}>
          <View style={styles.chartBarRow}>
             {[0.7, 0.8, 0.6, 0.9, 0.75, 0.85].map((val, i) => (
                <View key={i} style={styles.barContainer}>
                   <View style={[styles.chartBar, { height: val * 80 }]} />
                   <Text style={styles.barMonth}>{['A','M','J','J','A','S'][i]}</Text>
                </View>
             ))}
          </View>
        </Animated.View>

        {/* Breakdown List */}
        <Text style={styles.sectionTitle}>TDS Breakdown</Text>
        <View style={styles.listContainer}>
          {TAX_BREAKDOWN.map((item, index) => (
            <Animated.View 
              key={item.month}
              entering={FadeInRight.delay(400 + index * 100).springify()}
              style={styles.taxItem}
            >
              <View>
                <Text style={styles.taxMonth}>{item.month}</Text>
                <Text style={styles.taxStatus}>{item.status}</Text>
              </View>
              <Text style={styles.taxAmount}>{item.tds}</Text>
            </Animated.View>
          ))}
        </View>

        <TouchableOpacity style={styles.downloadBtn}>
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.downloadBtnText}>Download Tax Report</Text>
        </TouchableOpacity>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav />
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
  scrollContent: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  tdsCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
  },
  tdsLabel: {
    color: '#ef4444',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
  },
  tdsValue: {
    color: '#ef4444',
  },
  summarySub: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  chartBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
  },
  barContainer: {
    alignItems: 'center',
    gap: 8,
  },
  chartBar: {
    width: 20,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  barMonth: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '800',
  },
  listContainer: {
    gap: 12,
    marginBottom: 24,
  },
  taxItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  taxMonth: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  taxStatus: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },
  taxAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ef4444',
  },
  downloadBtn: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
  },
});
