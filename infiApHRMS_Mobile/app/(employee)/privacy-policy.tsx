import * as React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '../../components/layout/Header';
import { BottomNav } from '../../components/BottomNav';

import { useAppTheme } from '@/context/ThemeContext';
const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: '1. What Data We Collect',
    body: [
      'When you use infiAP, we may collect the following types of information:',
      'Information you give us directly:',
      '• Full name and email address (when you sign up).',
      '• Company name and job title (optional, but helpful).',
      '• Billing information (processed securely via our payment partner — we never store your card details).',
      'Information collected automatically:',
      '• IP address and approximate location (city-level).',
      '• Browser type, device type, and operating system.',
      '• Pages visited, features used, and time spent on the platform.',
      '• Cookies and similar tracking technologies (see Section 6 for details).',
    ],
  },
  {
    title: '2. Why We Collect It',
    body: [
      'We use your data only for legitimate business purposes:',
      '• To create and manage your account.',
      '• To deliver the product and features you signed up for.',
      '• To send you important account notices and product updates.',
      '• To analyze usage patterns and improve the platform.',
      '• To process billing and prevent fraud.',
      '• To respond to your support requests.',
      'We will never use your data for purposes beyond what is listed here without asking you first.',
    ],
  },
  {
    title: '3. Who We Share Data With',
    body: [
      'We do not sell your personal data. We share limited data with trusted third-party service providers who help us operate:',
      '• Cloud infrastructure (e.g., AWS, Google Cloud) — for hosting and storage.',
      '• Analytics tools (e.g., Google Analytics, Mixpanel) — for understanding usage.',
      '• Payment processors (e.g., Razorpay, Stripe) — for billing.',
      '• Email delivery providers (e.g., SendGrid) — for transactional emails.',
      'All third-party providers are contractually bound to handle your data securely and only for the purpose we specify.',
    ],
  },
  {
    title: '4. How Long We Keep Your Data',
    body: [
      'We keep your data only as long as necessary:',
      '• Account data is retained for the duration of your account and deleted within 30 days of account closure.',
      '• Usage and analytics data is retained for up to 24 months in aggregated form.',
      '• Billing records are retained for 7 years as required by Indian tax law.',
      '• You can request deletion of your data at any time (see Section 5).',
    ],
  },
  {
    title: '5. Your Rights',
    body: [
      'You have full control over your personal data. You can:',
      '• Access — Request a copy of all personal data we hold about you.',
      '• Correct — Ask us to update any inaccurate or outdated information.',
      '• Delete — Request permanent deletion of your account and all associated data.',
      '• Portability — Request your data in a structured, machine-readable format.',
      '• Opt out — Unsubscribe from marketing emails at any time via the link in each email.',
      'To exercise any of these rights, email us at: privacy@infiap.com. We will respond within 30 days.',
    ],
  },
  {
    title: '6. Cookies & Tracking',
    body: [
      'We use cookies to make the platform work and to understand how it\'s being used. Here\'s a plain-language breakdown:',
      '• Essential cookies — Required for login, security, and core features. Cannot be disabled.',
      '• Analytics cookies — Help us understand which features people use. You can opt out.',
      '• Preference cookies — Remember your settings like language and display preferences.',
      'You can control or disable non-essential cookies via your browser settings or through the cookie consent banner on our website. Disabling essential cookies may affect platform functionality.',
    ],
  },
  {
    title: '7. Data Security',
    body: [
      'We take security seriously and implement industry-standard measures to protect your data:',
      '• All data is encrypted in transit (TLS 1.2+) and at rest (AES-256).',
      '• Access to production systems is restricted to authorized personnel only.',
      '• We perform regular security audits and vulnerability assessments.',
      '• In the event of a data breach, we will notify affected users within 72 hours as required by law.',
    ],
  },
  {
    title: '8. Contact & Privacy Requests',
    body: [
      'If you have any questions, concerns, or requests related to your privacy, please reach out:',
      'Privacy Officer: infiAP Technologies Pvt. Ltd.  |  privacy@infiap.com  |  [Your Address], India',
    ],
  },
];

export default function PrivacyPolicyScreen() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.root}>
      <Header title="Privacy Policy" showBack={true} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>infiAP Technologies Pvt. Ltd.</Text>
        <Text style={styles.meta}>Effective Date: January 1, 2025  |  Last Updated: April 2025</Text>

        <Text style={styles.intro}>
          Our commitment to you: We only collect data that helps us run the service better. We
          never sell your personal information. This policy explains exactly what we collect, why,
          and how you can control it.
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.body.map((line, idx) => (
              <Text key={idx} style={styles.paragraph}>
                {line}
              </Text>
            ))}
          </View>
        ))}

        <Text style={styles.footer}>
          We review and update this policy periodically. Continued use after updates = acceptance.
        </Text>
        <Text style={styles.footerSmall}>© 2025 infiAP. All rights reserved.</Text>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 120 },
  brand: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  meta: { fontSize: 12, color: '#64748b', marginTop: 4, marginBottom: 16 },
  intro: { fontSize: 14, color: '#334155', lineHeight: 22, marginBottom: 18 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
  paragraph: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 6 },
  footer: { fontSize: 13, color: '#1e293b', fontWeight: '600', marginTop: 12 },
  footerSmall: { fontSize: 12, color: '#94a3b8', marginTop: 6 },
});
