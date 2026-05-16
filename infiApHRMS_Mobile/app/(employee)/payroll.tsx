import React, { useEffect, useState, useMemo } from 'react';
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
  fetchPayrollHistoryWithParams,
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

const buildMultiPayslipHtml = (items: {
  month: string;
  salary: string;
  payDate: string;
  status: string;
  earnings: { category: string; amount: number }[];
  deductions: { category: string; amount: number }[];
}[]) => {
  const slips = items.map((item) => `
    <div style="page-break-after: always; padding: 36px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 28px;">
        <div>
          <div style="font-size: 28px; font-weight: 800; color: #4f46e5;">infiAp HRMS</div>
          <div style="color: #64748b; font-size: 13px; margin-top: 4px;">Salary Slip • ${item.month}</div>
          <div style="color: #64748b; font-size: 13px;">Pay Date: ${item.payDate}</div>
        </div>
        <div style="background: #dcfce7; color: #15803d; font-weight: 800; padding: 8px 14px; border-radius: 8px; font-size: 12px;">${item.status.toUpperCase()}</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
        <div style="color: #64748b; font-size: 13px; font-weight: 700; text-transform: uppercase;">Net Payable Salary</div>
        <div style="font-size: 36px; font-weight: 900; margin-top: 8px;">${item.salary}</div>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
        <thead>
          <tr>
            <th style="text-align: left; background: #eef2ff; color: #3730a3; padding: 12px; font-size: 13px;">Earnings</th>
            <th style="text-align: right; background: #eef2ff; color: #3730a3; padding: 12px; font-size: 13px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${item.earnings.map((row: any) => `<tr><td style="border-bottom: 1px solid #e2e8f0; padding: 12px; font-size: 14px;">${row.category}</td><td style="border-bottom: 1px solid #e2e8f0; padding: 12px; font-size: 14px; text-align: right;">${formatINR(row.amount)}</td></tr>`).join('')}
          ${item.deductions.map((row: any) => `<tr><td style="border-bottom: 1px solid #e2e8f0; padding: 12px; font-size: 14px; color: #dc2626;">${row.category}</td><td style="border-bottom: 1px solid #e2e8f0; padding: 12px; font-size: 14px; text-align: right; color: #dc2626;">-${formatINR(row.amount)}</td></tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-top: 22px; display: flex; justify-content: space-between; background: #4f46e5; color: white; border-radius: 12px; padding: 16px 18px; font-size: 18px; font-weight: 800;">
        <span>Total Net Pay</span>
        <span>${item.salary}</span>
      </div>
      <div style="margin-top: 28px; color: #64748b; font-size: 12px;">This computer-generated payslip does not require a signature.</div>
    </div>
  `).join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0f172a; margin: 0; }
        </style>
      </head>
      <body>${slips}</body>
    </html>
  `;
};

const createMultiPayslipPdf = async (items: Parameters<typeof buildMultiPayslipHtml>[0]) => {
  const result = await Print.printToFileAsync({
    html: buildMultiPayslipHtml(items),
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

export default function PayrollDashboard() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => PayrollStyles(colors), [colors]);
  const { user } = useUser();
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<PayrollCurrentData | null>(null);
  const [historyData, setHistoryData] = useState<PayrollHistoryItem[]>([]);
  const [historySummary, setHistorySummary] = useState<{ totalYTD?: number; ytdGrowth?: string; avgNet?: number; avgPeriod?: string } | null>(null);
  const [batchDownloading, setBatchDownloading] = useState(false);
  const [customPickerVisible, setCustomPickerVisible] = useState(false);
  const [fromDateKey, setFromDateKey] = useState<string>('');
  const [toDateKey, setToDateKey] = useState<string>('');
  const [pickerMode, setPickerMode] = useState<'from' | 'to'>('from');
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
      const result = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `${currentMonth} Salary Slip`,
        UTI: 'com.adobe.pdf',
      });
    } catch (error: any) {
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

  const getItemEarnings = (item: PayrollHistoryItem) => {
    return [
      { category: 'Basic Salary', amount: Number(item.basicSalary ?? 0) },
      { category: 'Allowances', amount: Number(item.allowances ?? 0) },
      { category: 'Bonus', amount: Number(item.bonus ?? 0) },
    ].filter(row => row.amount > 0 || row.category === 'Basic Salary');
  };

  const getItemDeductions = (item: PayrollHistoryItem) => {
    const total = Number(item.deductions ?? 0);
    return total > 0 ? [{ category: 'Deductions', amount: total }] : [];
  };

  const handleDownloadBatch = async (items: PayrollHistoryItem[], label: string) => {
    if (batchDownloading || items.length === 0) return;
    setBatchDownloading(true);
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing Unavailable', 'PDF sharing is not available on this device.');
        return;
      }
      const slips = items.map((item) => {
        const monthLabel = item.monthYear || formatMonthYear(item.month, item.year);
        const salary = formatINR(getNetPay(item));
        const dateStr = item.paidAt || item.updatedAt || item.createdAt || monthLabel;
        const status = item.status || 'Pending';
        return {
          month: monthLabel,
          salary,
          payDate: dateStr,
          status,
          earnings: getItemEarnings(item),
          deductions: getItemDeductions(item),
        };
      });
      const html = buildMultiPayslipHtml(slips);
      const result = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `${label} Salary Slips`,
        UTI: 'com.adobe.pdf',
      });
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/cancel|dismiss/i.test(message)) {
        Alert.alert('Download Failed', message || `Unable to create the ${label} PDF.`);
      }
    } finally {
      setBatchDownloading(false);
    }
  };

  const generateRecentMonths = (count: number): PayrollHistoryItem[] => {
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const now = new Date();
    let year = now.getFullYear();
    let monthIdx = now.getMonth();

    const result: PayrollHistoryItem[] = [];
    for (let i = 0; i < count; i++) {
      const month = monthNames[monthIdx];
      const existing = historyData.find((item) => item.year === year && item.month === month);
      if (existing) {
        result.push(existing);
      } else {
        result.push({
          _id: `${year}-${month}`,
          month,
          year,
          monthYear: `${month} ${year}`,
          basicSalary: 0,
          allowances: 0,
          bonus: 0,
          deductions: 0,
          net: 0,
          netPay: 0,
          netSalary: 0,
          status: 'No Data',
          paidAt: '—',
        });
      }
      monthIdx -= 1;
      if (monthIdx < 0) {
        monthIdx = 11;
        year -= 1;
      }
    }
    return result;
  };

  const handleDownloadLast3Months = async () => {
    const items = generateRecentMonths(3);
    await handleDownloadBatch(items, 'Last 3 Months');
  };

  const handleDownloadLast6Months = async () => {
    const items = generateRecentMonths(6);
    await handleDownloadBatch(items, 'Last 6 Months');
  };

  const getUniqueMonthOptions = () => {
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIdx = now.getMonth();

    const dataYears = Array.from(new Set(historyData.map((item) => Number(item.year || 0)).filter(Boolean)));
    const earliestYear = dataYears.length > 0 ? Math.min(...dataYears) : currentYear;

    const options: { month: string; year: number; label: string; hasData: boolean }[] = [];
    for (let year = currentYear; year >= earliestYear; year--) {
      const maxMonthIdx = year === currentYear ? currentMonthIdx : 11;
      for (let m = maxMonthIdx; m >= 0; m--) {
        const month = monthNames[m];
        const key = `${year}-${month}`;
        const hasData = historyData.some((item) => `${item.year}-${item.month}` === key);
        options.push({ month, year, label: `${month} ${year}`, hasData });
      }
    }
    return options;
  };

  const getDateSortValue = (key: string) => {
    const monthOrder = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const [yearStr, month] = key.split('-');
    const year = Number(yearStr || 0);
    const monthIndex = monthOrder.indexOf(month);
    return year * 100 + (monthIndex >= 0 ? monthIndex : 0);
  };

  const generateMonthRangeItems = (fromKey: string, toKey: string): PayrollHistoryItem[] => {
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const fromVal = getDateSortValue(fromKey);
    const toVal = getDateSortValue(toKey);
    const minVal = Math.min(fromVal, toVal);
    const maxVal = Math.max(fromVal, toVal);

    const result: PayrollHistoryItem[] = [];
    for (let val = minVal; val <= maxVal; val++) {
      const year = Math.floor(val / 100);
      const monthIndex = val % 100;
      const month = monthNames[monthIndex];
      if (!month) continue;

      const existing = historyData.find(
        (item) => item.year === year && item.month === month
      );

      if (existing) {
        result.push(existing);
      } else {
        result.push({
          _id: `${year}-${month}`,
          month,
          year,
          monthYear: `${month} ${year}`,
          basicSalary: 0,
          allowances: 0,
          bonus: 0,
          deductions: 0,
          net: 0,
          netPay: 0,
          netSalary: 0,
          status: 'No Data',
          paidAt: '—',
        });
      }
    }
    return result;
  };

  const handleDownloadCustomRange = async () => {
    if (!fromDateKey || !toDateKey) {
      Alert.alert('Select Range', 'Please choose both From and To months.');
      return;
    }
    const items = generateMonthRangeItems(fromDateKey, toDateKey);
    if (items.length === 0) {
      Alert.alert('No Data', 'No payroll records found in the selected range.');
      return;
    }
    await handleDownloadBatch(items, 'Custom Range');
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

        {/* Batch Download Options */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Download Payslips</Text>
        </View>
        <View style={{ gap: 10, marginBottom: 30 }}>
          <TouchableOpacity
            style={[styles.batchBtn, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
            onPress={handleDownloadLast3Months}
            disabled={batchDownloading}
          >
            <View style={[styles.batchIconCircle, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="document-text-outline" size={22} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.batchBtnTitle}>Last 3 Months</Text>
              <Text style={styles.batchBtnSub}>Download payslips as combined PDF</Text>
            </View>
            {batchDownloading ? <ActivityIndicator size="small" color="#4f46e5" /> : <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.batchBtn, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
            onPress={handleDownloadLast6Months}
            disabled={batchDownloading}
          >
            <View style={[styles.batchIconCircle, { backgroundColor: '#ede9fe' }]}>
              <Ionicons name="documents-outline" size={22} color="#7c3aed" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.batchBtnTitle}>Last 6 Months</Text>
              <Text style={styles.batchBtnSub}>Download payslips as combined PDF</Text>
            </View>
            {batchDownloading ? <ActivityIndicator size="small" color="#4f46e5" /> : <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.batchBtn, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
            onPress={() => {
              if (historyData.length === 0) {
                Alert.alert('No Data', 'No payroll history available to select from.');
                return;
              }
              const now = new Date();
              const currentYear = now.getFullYear();
              const currentMonthIdx = now.getMonth();
              const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
              const currentMonth = monthNames[currentMonthIdx];
              setFromDateKey(`${currentYear}-January`);
              setToDateKey(`${currentYear}-${currentMonth}`);
              setPickerMode('from');
              setCustomPickerVisible(true);
            }}
            disabled={batchDownloading}
          >
            <View style={[styles.batchIconCircle, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="calendar-outline" size={22} color="#16a34a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.batchBtnTitle}>Custom Range</Text>
              <Text style={styles.batchBtnSub}>Pick From and To months to download</Text>
            </View>
            {batchDownloading ? <ActivityIndicator size="small" color="#4f46e5" /> : <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
          </TouchableOpacity>
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

      {/* Custom Range Picker Modal */}
      <Modal
        visible={customPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCustomPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCustomPickerVisible(false)}
        >
          <Animated.View entering={SlideInUp} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Range</Text>
              <TouchableOpacity onPress={() => setCustomPickerVisible(false)}>
                <Ionicons name="close-circle" size={32} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* From / To selectors */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <TouchableOpacity
                style={[
                  styles.rangeSelector,
                  pickerMode === 'from' && { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
                ]}
                onPress={() => setPickerMode('from')}
              >
                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>From</Text>
                <Text style={{ fontSize: 15, fontWeight: '800', color: fromDateKey ? colors.textSecondary : '#94a3b8', marginTop: 4 }}>
                  {fromDateKey ? fromDateKey.replace('-', ' ') : 'Select'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.rangeSelector,
                  pickerMode === 'to' && { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
                ]}
                onPress={() => setPickerMode('to')}
              >
                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>To</Text>
                <Text style={{ fontSize: 15, fontWeight: '800', color: toDateKey ? colors.textSecondary : '#94a3b8', marginTop: 4 }}>
                  {toDateKey ? toDateKey.replace('-', ' ') : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' }}>
              Tap a month to set {pickerMode === 'from' ? 'From' : 'To'}
            </Text>

            <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
              {getUniqueMonthOptions().map((opt) => {
                const key = `${opt.year}-${opt.month}`;
                const isFrom = fromDateKey === key;
                const isTo = toDateKey === key;
                const isActive = isFrom || isTo;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.monthPickerItem,
                      isActive && { backgroundColor: '#eef2ff', borderColor: '#4f46e5' },
                    ]}
                    onPress={() => {
                      if (pickerMode === 'from') {
                        setFromDateKey(key);
                        if (!toDateKey) setPickerMode('to');
                      } else {
                        setToDateKey(key);
                        if (!fromDateKey) setPickerMode('from');
                      }
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.monthPickerTitle, isActive && { color: '#4f46e5' }]}>{opt.label}</Text>
                      {!opt.hasData && !isActive && (
                        <Text style={{ fontSize: 11, color: '#cbd5e1', fontWeight: '600', marginTop: 1 }}>No payslip</Text>
                      )}
                    </View>
                    {isFrom && (
                      <View style={{ backgroundColor: '#4f46e5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 6 }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>FROM</Text>
                      </View>
                    )}
                    {isTo && (
                      <View style={{ backgroundColor: '#16a34a', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>TO</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={[styles.closeBtn, { marginTop: 16, opacity: fromDateKey && toDateKey ? 1 : 0.5 }]}
              onPress={() => {
                setCustomPickerVisible(false);
                handleDownloadCustomRange();
              }}
              disabled={!fromDateKey || !toDateKey || batchDownloading}
            >
              {batchDownloading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.closeBtnText}>Download Range</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <BottomNav />

    </View>
  );
}

function PayrollStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textSecondary,
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
    color: colors.textSecondary,
  },
  sectionLink: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '700',
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
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
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
    color: colors.textSecondary,
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
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
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  historyMonth: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textSecondary,
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
    backgroundColor: colors.card,
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
    color: colors.textSecondary,
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
    color: colors.textMuted,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 15,
    color: colors.textSecondary,
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
    color: colors.textSecondary,
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
    backgroundColor: colors.card,
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
    color: colors.textSecondary,
  },
  batchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  batchIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batchBtnTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  batchBtnSub: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  rangeSelector: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  monthPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  monthPickerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  monthPickerSub: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
});
}
