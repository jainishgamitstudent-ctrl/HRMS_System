import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Modal, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { BottomNav } from '../../components/BottomNav';
import Header from '../../components/layout/Header';
import { useAppTheme } from '@/context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { resolveImageSource } from '../../utils/image';
import {
  fetchPayrollCurrent,
  fetchPayrollHistory,
  type PayrollCurrentData,
  type PayrollHistoryItem,
} from '../../services/auth';
import Animated, { 
  FadeInDown,
  FadeInRight,
  SlideInUp,
} from 'react-native-reanimated';

const buildPayslipHtml = ({
  month,
  salary,
  payDate,
  status,
  earnings,
  deductions,
}: {
  month: string;
  salary: string;
  payDate: string;
  status: string;
  earnings: { category: string; amount: number }[];
  deductions: { category: string; amount: number }[];
}) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #0f172a;
          padding: 36px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 20px;
          margin-bottom: 28px;
        }
        .brand {
          font-size: 28px;
          font-weight: 800;
          color: #4f46e5;
        }
        .muted {
          color: #64748b;
          font-size: 13px;
          margin-top: 4px;
        }
        .badge {
          background: #dcfce7;
          color: #15803d;
          font-weight: 800;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
        }
        .summary {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .summary-title {
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .amount {
          font-size: 36px;
          font-weight: 900;
          margin-top: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }
        th {
          text-align: left;
          background: #eef2ff;
          color: #3730a3;
          padding: 12px;
          font-size: 13px;
        }
        td {
          border-bottom: 1px solid #e2e8f0;
          padding: 12px;
          font-size: 14px;
        }
        td:last-child,
        th:last-child {
          text-align: right;
        }
        .deduction {
          color: #dc2626;
        }
        .total {
          margin-top: 22px;
          display: flex;
          justify-content: space-between;
          background: #4f46e5;
          color: white;
          border-radius: 12px;
          padding: 16px 18px;
          font-size: 18px;
          font-weight: 800;
        }
        .footer {
          margin-top: 28px;
          color: #64748b;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">infiAp HRMS</div>
          <div class="muted">Salary Slip • ${month}</div>
          <div class="muted">Pay Date: ${payDate}</div>
        </div>
        <div class="badge">${status.toUpperCase()}</div>
      </div>

      <div class="summary">
        <div class="summary-title">Net Payable Salary</div>
        <div class="amount">${salary}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Earnings</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${earnings.map(row => `<tr><td>${row.category}</td><td>${formatINR(row.amount)}</td></tr>`).join('')}
          ${deductions.map(row => `<tr><td class="deduction">${row.category}</td><td class="deduction">-${formatINR(row.amount)}</td></tr>`).join('')}
        </tbody>
      </table>

      <div class="total">
        <span>Total Net Pay</span>
        <span>${salary}</span>
      </div>

      <div class="footer">This computer-generated payslip does not require a signature.</div>
    </body>
  </html>
`;

const createPayslipPdf = async (
  month: string,
  salary: string,
  payDate: string,
  status: string,
  earnings: { category: string; amount: number }[],
  deductions: { category: string; amount: number }[],
) => {
  const result = await Print.printToFileAsync({
    html: buildPayslipHtml({ month, salary, payDate, status, earnings, deductions }),
    base64: false,
  });
  return result.uri;
};



const formatINR = (n: number) =>
  `₹${(Number.isFinite(n) ? n : 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const formatMonthYear = (month?: string, year?: number | string) =>
  [month, year].filter(Boolean).join(' ') || '—';

const getNetPay = (item?: PayrollCurrentData | PayrollHistoryItem | null) =>
  Number(item?.netSalary ?? item?.netPay ?? item?.net ?? 0);

const getDeductionTotal = (item?: PayrollCurrentData | PayrollHistoryItem | null) => {
  if (Array.isArray(item?.deductions)) {
    return item.deductions.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  }
  return Number(item?.deductions ?? 0);
};

const getEarningsRows = (item?: PayrollCurrentData | null) => {
  if (item?.earnings?.length) return item.earnings;
  if (!item) return [];
  return [
    { category: 'Basic Salary', amount: Number(item.basicSalary ?? 0) },
    { category: 'Allowances', amount: Number(item.allowances ?? 0) },
    { category: 'Bonus', amount: Number(item.bonus ?? 0) },
  ].filter(row => row.amount > 0 || row.category === 'Basic Salary');
};

const getDeductionRows = (item?: PayrollCurrentData | null) => {
  if (Array.isArray(item?.deductions)) return item.deductions;
  const total = getDeductionTotal(item);
  return total > 0 ? [{ category: 'Deductions', amount: total }] : [];
};

type PayrollTrendPoint = {
  month: string;
  net: number;
};

export default function PayrollDashboard() {
  const { colors } = useAppTheme();
  const { user } = useUser();
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<PayrollCurrentData | null>(null);
  const [historyData, setHistoryData] = useState<PayrollHistoryItem[]>([]);
  const [historySummary, setHistorySummary] = useState<{ totalYTD?: number; ytdGrowth?: string; avgNet?: number; avgPeriod?: string } | null>(null);
  const [trendData, setTrendData] = useState<PayrollTrendPoint[]>([]);
  const avatarSource = resolveImageSource(user.avatar);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [cur, hist] = await Promise.all([fetchPayrollCurrent(), fetchPayrollHistory()]);
        if (!isMounted) return;
        setCurrent(cur.data);
        setHistoryData(hist.data?.paymentHistory || (Array.isArray(hist.data as any) ? (hist.data as any) : []));
        setHistorySummary(hist.data?.summary || null);
        setTrendData(Array.isArray((hist.data as any)?.trend) ? (hist.data as any).trend : []);
      } catch (error) {
        console.warn('Failed to load payroll:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentMonth = current ? formatMonthYear(current.month, current.year) : '';
  const currentSalary = current ? formatINR(getNetPay(current)) : '—';
  const payDate = current?.paidAt || current?.updatedAt || current?.createdAt || (current ? currentMonth : '');
  const statusLabel = current?.status || 'PAID';
  const earningsRows = getEarningsRows(current);
  const deductionRows = getDeductionRows(current);
  const chartData = trendData.length > 0
    ? trendData
    : historyData.slice(0, 6).map((item) => ({
        month: (item.monthYear || formatMonthYear(item.month, item.year)).split(' ')[0]?.slice(0, 3).toUpperCase() || '—',
        net: getNetPay(item),
      })).reverse();
  const chartMax = Math.max(...chartData.map((item) => item.net), 1);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const html = buildPayslipHtml({
        month: currentMonth,
        salary: currentSalary,
        payDate,
        status: statusLabel,
        earnings: earningsRows,
        deductions: deductionRows,
      });
      // Open the native print dialog which has a built-in "Save as PDF" option
      // on both iOS (AirPrint -> Save to Files) and Android (PDF Printer -> Save).
      await Print.printAsync({ html });
    } catch (error: any) {
      // User cancelling the print dialog throws; ignore that case.
      const message = error instanceof Error ? error.message : String(error);
      if (!/cancel|dismiss/i.test(message)) {
        Alert.alert('Download Failed', message || 'Unable to create the salary slip PDF.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing Unavailable', 'PDF sharing is not available on this device.');
        return;
      }

      const pdfUri = await createPayslipPdf(
        currentMonth,
        currentSalary,
        payDate,
        statusLabel,
        earningsRows,
        deductionRows,
      );
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: `${currentMonth} Salary Slip`,
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      Alert.alert('Share Failed', error instanceof Error ? error.message : 'Unable to share the salary slip PDF.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Header title="Payroll" showBack={true} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Salary Card */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.salaryCard}>
          <View style={styles.cardDecoration} />
          <View style={styles.profileLine}>
            <Image source={avatarSource} style={styles.profileAvatar} />
            <View style={styles.profileMeta}>
              <Text style={styles.profileName}>{user.name || 'Employee'}</Text>
              <Text style={styles.profileSub}>{user.department || 'General'} • {user.employeeId || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Salary Month ({currentMonth || '—'})</Text>
            <View style={styles.paidBadge}>
              <Text style={styles.paidText}>{statusLabel.toUpperCase()}</Text>
            </View>
          </View>
          {loading ? (
            <ActivityIndicator color="#fff" style={{ marginVertical: 16 }} />
          ) : (
            <Text style={styles.salaryAmount}>{currentSalary}</Text>
          )}
          <View style={styles.payDateContainer}>
            <Ionicons name="calendar-outline" size={18} color="#fff" />
            <Text style={styles.payDateText}>Pay Date: {payDate || '—'}</Text>
          </View>
        </Animated.View>

        {/* Payroll Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total YTD</Text>
            <Text style={styles.summaryValue}>{historySummary?.totalYTD ? formatINR(historySummary.totalYTD) : '—'}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Growth</Text>
            <Text style={styles.summaryValue}>{historySummary?.ytdGrowth || '—'}</Text>
          </View>
        </View>

        {/* Trend */}
        <View style={styles.trendCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Salary Trend</Text>
            <Text style={styles.sectionLink}>{historySummary?.avgPeriod || 'Recent months'}</Text>
          </View>
          <View style={styles.chartArea}>
            {chartData.length === 0 ? (
              <Text style={{ color: '#94a3b8', fontWeight: '600' }}>No trend data available.</Text>
            ) : (
              chartData.map((item) => {
                const barHeight = Math.max(28, Math.round((item.net / chartMax) * 96));
                return (
                  <View key={item.month} style={styles.barContainer}>
                    <View style={[styles.bar, { height: barHeight, backgroundColor: item.month === chartData[chartData.length - 1]?.month ? '#4f46e5' : '#c7d2fe' }]} />
                    <Text style={styles.barLabel}>{item.month}</Text>
                  </View>
                );
              })
            )}
          </View>
        </View>



        {/* Action Buttons */}
        <View style={styles.actionRow}>
          {[
            { id: 'view', icon: 'eye-outline', label: 'View', color: '#6366f1', action: () => setDetailsVisible(true) },
            { id: 'download', icon: 'download-outline', label: 'Download', color: '#4f46e5', action: handleDownload },
            { id: 'share', icon: 'share-social-outline', label: 'Share', color: '#818cf8', action: handleShare },
          ].map((action, index) => (
            <Animated.View 
              key={action.id}
              entering={FadeInDown.delay(300 + index * 100).springify()}
              style={styles.actionItem}
            >
              <TouchableOpacity style={styles.actionBtn} onPress={action.action}>
                <View style={[styles.actionIconCircle, { backgroundColor: `${action.color}15` }]}>
                  {(action.id === 'download' && downloading) || (action.id === 'share' && sharing) ? (
                    <ActivityIndicator color={action.color} />
                  ) : (
                    <Ionicons name={action.icon as any} size={28} color={action.color} />
                  )}
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Salary History */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Salary History</Text>
          <TouchableOpacity onPress={() => router.push('/(employee)/payroll-history')}>
            <Text style={styles.sectionLink}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyList}>
          {loading && historyData.length === 0 ? (
            <ActivityIndicator color="#4f46e5" style={{ marginVertical: 24 }} />
          ) : historyData.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#94a3b8', paddingVertical: 24 }}>
              No salary history available.
            </Text>
          ) : (
            historyData.map((item, index) => (
              <Animated.View 
                key={String(item.id || item._id)}
                entering={FadeInRight.delay(500 + index * 100).springify()}
                style={styles.historyCard}
              >
                <TouchableOpacity style={styles.historyBtn} activeOpacity={0.7} onPress={() => setDetailsVisible(true)}>
                  <View style={styles.historyLeading}>
                    <View style={styles.fileIconBox}>
                      <Ionicons name="document-text-outline" size={24} color={colors.textMuted} />
                    </View>
                    <View>
                      <Text style={styles.historyMonth}>{item.monthYear || formatMonthYear(item.month, item.year)}</Text>
                      <Text style={styles.historySub}>NET SALARY: {formatINR(getNetPay(item))}</Text>
                    </View>
                  </View>
                  <View style={styles.historyTrailing}>
                    <View style={[
                      styles.historyPaidBadge,
                      item.status === 'Pending' && { backgroundColor: '#fffbeb' },
                      item.status === 'On Going' && { backgroundColor: '#eff6ff' }
                    ]}>
                      <Text style={[
                        styles.historyPaidText,
                        item.status === 'Pending' && { color: '#d97706' },
                        item.status === 'On Going' && { color: '#2563eb' }
                      ]}>{item.status}</Text>
                    </View>
                    <Text style={styles.historyDate}>{item.paidAt || item.updatedAt || item.createdAt || '—'}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Salary Details Modal */}
      <Modal
        visible={detailsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailsVisible(false)}
      >
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
             
             {earningsRows.map((row, idx) => (
               <View
                 key={`earn-${idx}`}
                 style={[
                   styles.breakdownRow,
                   idx === 0 && earningsRows.length > 0 ? null : null,
                 ]}
               >
                 <Text style={styles.breakdownLabel}>{row.category}</Text>
                 <Text style={styles.breakdownValue}>{formatINR(row.amount)}</Text>
               </View>
             ))}
             {deductionRows.map((row, idx) => (
               <View
                 key={`ded-${idx}`}
                 style={[styles.breakdownRow, idx === 0 ? styles.deductionBorder : null]}
               >
                 <Text style={styles.deductionLabel}>{row.category}</Text>
                 <Text style={styles.deductionValue}>-{formatINR(row.amount)}</Text>
               </View>
             ))}
             {!current && (
               <Text style={{ textAlign: 'center', color: '#94a3b8', paddingVertical: 16 }}>
                 No breakdown available.
               </Text>
             )}

             <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Net Payable Salary</Text>
                <Text style={styles.totalValue}>{currentSalary}</Text>
             </View>
             
             <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailsVisible(false)}>
                <Text style={styles.closeBtnText}>Great, Close It!</Text>
             </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <BottomNav />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
  },
  salaryCard: {
    backgroundColor: '#4f46e5', // High-fidelity indigo
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 30,
  },
  profileLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  profileMeta: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  profileSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '600',
    marginTop: 2,
  },
  cardDecoration: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  paidBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paidText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  salaryAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
  },
  payDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payDateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    marginTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  sectionLink: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '700',
  },
  trendCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
  },
  barContainer: {
    alignItems: 'center',
    gap: 12,
  },
  bar: {
    width: 32,
    borderRadius: 8,
  },
  inactiveBar: {
    backgroundColor: '#f1f5f9',
  },
  activeBar: {
    backgroundColor: '#4f46e5',
  },
  barLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '800',
  },
  activeBarLabel: {
    color: '#4f46e5',
  },
  tooltip: {
    position: 'absolute',
    top: -45,
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    zIndex: 100,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: '#1e293b',
    transform: [{ rotate: '45deg' }],
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  actionItem: {
    flex: 1,
  },
  actionBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
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
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
  deductionBorder: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#fecaca',
    paddingTop: 15,
  },
  deductionLabel: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '600',
  },
  deductionValue: {
    fontSize: 15,
    color: '#ef4444',
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
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successInfo: {
    alignItems: 'center',
    gap: 16,
  },
  successText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
});
