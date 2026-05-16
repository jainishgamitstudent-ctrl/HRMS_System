import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Modal, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { BottomNav } from '../../components/BottomNav';
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import Header from '../../components/layout/Header';
import { useAppTheme } from '@/context/ThemeContext';
import {
  fetchPayrollHistory,
  type PayrollHistoryItem,
} from '../../services/auth';

const formatINR = (n: number) =>
  `₹${(Number.isFinite(n) ? n : 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const formatMonthYear = (month?: string, year?: number | string) =>
  [month, year].filter(Boolean).join(' ') || '—';

const getNetPay = (item?: PayrollHistoryItem | null) =>
  Number(item?.netSalary ?? item?.netPay ?? item?.net ?? 0);

const buildPayslipHtml = (item: PayrollHistoryItem) => {
  const monthLabel = item.monthYear || formatMonthYear(item.month, item.year);
  const salary = formatINR(getNetPay(item));
  const basic = formatINR(Number(item.basicSalary ?? 0));
  const allowances = formatINR(Number(item.allowances ?? 0));
  const bonus = formatINR(Number(item.bonus ?? 0));
  const deductions = formatINR(Number(item.deductions ?? 0));
  const status = item.status || 'Pending';
  const payDate = item.paidAt || item.updatedAt || item.createdAt || monthLabel;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: ${colors.textSecondary}; padding: 36px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${colors.primary}; padding-bottom: 20px; margin-bottom: 28px; }
          .brand { font-size: 28px; font-weight: 800; color: ${colors.primary}; }
          .muted { color: ${colors.textMuted}; font-size: 13px; margin-top: 4px; }
          .badge { background: ${colors.card}; color: ${colors.textSecondary}; font-weight: 800; padding: 8px 14px; border-radius: 8px; font-size: 12px; }
          .summary { background: ${colors.card}; border: 1px solid ${colors.borderLight}; border-radius: 14px; padding: 20px; margin-bottom: 24px; }
          .summary-title { color: ${colors.textMuted}; font-size: 13px; font-weight: 700; text-transform: uppercase; }
          .amount { font-size: 36px; font-weight: 900; margin-top: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th { text-align: left; background: ${colors.card}; color: ${colors.textSecondary}; padding: 12px; font-size: 13px; }
          td { border-bottom: 1px solid ${colors.borderLight}; padding: 12px; font-size: 14px; }
          td:last-child, th:last-child { text-align: right; }
          .deduction { color: #dc2626; }
          .total { margin-top: 22px; display: flex; justify-content: space-between; background: ${colors.primary}; color: white; border-radius: 12px; padding: 16px 18px; font-size: 18px; font-weight: 800; }
          .footer { margin-top: 28px; color: ${colors.textMuted}; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">infiAp HRMS</div>
            <div class="muted">Salary Slip • ${monthLabel}</div>
            <div class="muted">Pay Date: ${payDate}</div>
          </div>
          <div class="badge">${status.toUpperCase()}</div>
        </div>
        <div class="summary">
          <div class="summary-title">Net Payable Salary</div>
          <div class="amount">${salary}</div>
        </div>
        <table>
          <thead><tr><th>Earnings</th><th>Amount</th></tr></thead>
          <tbody>
            <tr><td>Basic Salary</td><td>${basic}</td></tr>
            <tr><td>Allowances</td><td>${allowances}</td></tr>
            <tr><td>Bonus</td><td>${bonus}</td></tr>
            <tr class="deduction"><td>Deductions</td><td class="deduction">-${deductions}</td></tr>
          </tbody>
        </table>
        <div class="total"><span>Total Net Pay</span><span>${salary}</span></div>
        <div class="footer">This computer-generated payslip does not require a signature.</div>
      </body>
    </html>
  `;
};

export default function PayrollHistory() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => PayrollHistoryStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<PayrollHistoryItem[]>([]);
  const [activeYear, setActiveYear] = useState<string>('');
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PayrollHistoryItem | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetchPayrollHistory();
        if (!isMounted) return;
        const data = res.data?.paymentHistory || [];
        setHistoryData(data);
        const years = Array.from(new Set(data.map((item) => String(item.year || '')).filter(Boolean)));
        if (years.length > 0) {
          years.sort((a, b) => Number(b) - Number(a));
          setActiveYear(years[0]);
        }
      } catch (error) {
        console.warn('Failed to load payroll history:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const years = Array.from(new Set(historyData.map((item) => String(item.year || '')).filter(Boolean))).sort((a, b) => Number(b) - Number(a));
  const filteredData = activeYear
    ? historyData.filter((item) => String(item.year) === activeYear)
    : historyData;

  const handleViewDetails = (item: PayrollHistoryItem) => {
    setSelectedItem(item);
    setDetailsVisible(true);
  };

  const handleDownload = async () => {
    if (!selectedItem || downloading) return;
    setDownloading(true);
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing Unavailable', 'PDF sharing is not available on this device.');
        return;
      }
      const result = await Print.printToFileAsync({
        html: buildPayslipHtml(selectedItem, colors),
        base64: false,
      });
      await Sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `${selectedItem.monthYear || formatMonthYear(selectedItem.month, selectedItem.year)} Salary Slip`,
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      Alert.alert('Download Failed', error instanceof Error ? error.message : 'Unable to generate PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const earningsRows = selectedItem
    ? [
        { label: 'Basic Salary', value: Number(selectedItem.basicSalary ?? 0) },
        { label: 'Allowances', value: Number(selectedItem.allowances ?? 0) },
        { label: 'Bonus', value: Number(selectedItem.bonus ?? 0) },
      ].filter((r) => r.value > 0 || r.label === 'Basic Salary')
    : [];

  const deductionTotal = Number(selectedItem?.deductions ?? 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <Header title="Salary History" showBack={true} />

      {years.length > 0 && (
        <View style={[styles.filterContainer, { backgroundColor: colors.card }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearScroll}>
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearTab,
                  { backgroundColor: activeYear === year ? colors.primary : colors.background },
                ]}
                onPress={() => setActiveYear(year)}
              >
                <Text
                  style={[
                    styles.yearText,
                    { color: activeYear === year ? '#fff' : colors.textMuted },
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 40 }} />
        ) : filteredData.length === 0 ? (
          <Text style={{ textAlign: 'center', color: colors.textMuted, paddingVertical: 40, fontWeight: '600' }}>
            No salary history available.
          </Text>
        ) : (
          <View style={styles.listContainer}>
            {filteredData.map((item, index) => (
              <Animated.View
                key={String(item.id || item._id)}
                entering={FadeInDown.delay(index * 80).springify()}
                style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              >
                <TouchableOpacity
                  style={styles.historyBtn}
                  activeOpacity={0.7}
                  onPress={() => handleViewDetails(item)}
                >
                  <View style={styles.historyLeading}>
                    <View style={[styles.fileIconBox, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                      <Ionicons name="document-text-outline" size={24} color={colors.textMuted} />
                    </View>
                    <View>
                      <Text style={[styles.historyMonth, { color: colors.textSecondary }]}>
                        {item.monthYear || formatMonthYear(item.month, item.year)}
                      </Text>
                      <Text style={styles.historySub}>NET SALARY: {formatINR(getNetPay(item))}</Text>
                    </View>
                  </View>
                  <View style={styles.historyTrailing}>
                    <View style={[
                      styles.historyPaidBadge,
                      item.status === 'Pending' && { backgroundColor: colors.card },
                      item.status === 'On Going' && { backgroundColor: '#eff6ff' },
                    ]}>
                      <Text style={[
                        styles.historyPaidText,
                        item.status === 'Pending' && { color: '#d97706' },
                        item.status === 'On Going' && { color: colors.textSecondary },
                      ]}>
                        {item.status}
                      </Text>
                    </View>
                    <Text style={styles.historyDate}>
                      {item.paidAt || item.updatedAt || item.createdAt || '—'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Details Modal */}
      <Modal visible={detailsVisible} transparent={true} animationType="slide" onRequestClose={() => setDetailsVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDetailsVisible(false)}>
          <Animated.View entering={SlideInUp} style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textSecondary }]}>Salary Breakdown</Text>
              <TouchableOpacity onPress={() => setDetailsVisible(false)}>
                <Ionicons name="close-circle" size={32} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {earningsRows.map((row, idx) => (
              <View key={`earn-${idx}`} style={[styles.breakdownRow, { borderBottomColor: colors.borderLight }]}>
                <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>{row.label}</Text>
                <Text style={[styles.breakdownValue, { color: colors.textSecondary }]}>{formatINR(row.value)}</Text>
              </View>
            ))}

            {deductionTotal > 0 && (
              <View style={[styles.breakdownRow, { borderBottomColor: colors.borderLight, borderTopWidth: 1, borderColor: colors.borderLight, paddingTop: 12, marginTop: 4 }]}>
                <Text style={[styles.breakdownLabel, { color: '#ef4444' }]}>Deductions</Text>
                <Text style={[styles.breakdownValue, { color: '#ef4444' }]}>-{formatINR(deductionTotal)}</Text>
              </View>
            )}

            {!selectedItem && (
              <Text style={{ textAlign: 'center', color: colors.textMuted, paddingVertical: 16 }}>
                No breakdown available.
              </Text>
            )}

            <View style={[styles.totalRow, { backgroundColor: colors.background }]}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Net Payable Salary</Text>
              <Text style={styles.totalValue}>{selectedItem ? formatINR(getNetPay(selectedItem)) : '—'}</Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { opacity: downloading ? 0.7 : 1 }]}
              onPress={handleDownload}
              disabled={downloading || !selectedItem}
            >
              {downloading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.closeBtnText}>Download Payslip</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.borderLight, marginTop: 10 }]}
              onPress={() => setDetailsVisible(false)}
            >
              <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <BottomNav />
    </View>
  );
}

function PayrollHistoryStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
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
  },
  yearText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },
  listContainer: {
    gap: 12,
  },
  historyCard: {
    borderRadius: 20,
    borderWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  historyMonth: {
    fontSize: 15,
    fontWeight: '800',
  },
  historySub: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
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
    color: colors.textMuted,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  breakdownLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
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
}
