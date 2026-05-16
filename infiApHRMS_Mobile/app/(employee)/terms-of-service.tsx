import * as React from 'react';
import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '../../components/layout/Header';
import { BottomNav } from '../../components/BottomNav';

import { useAppTheme } from '@/context/ThemeContext';
const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: '1. Who Can Use Our Services',
    body: [
      'Our services are available to individuals and businesses that meet the following criteria:',
      '• You are at least 18 years of age (or the age of majority in your jurisdiction).',
      '• You have the legal authority to enter into this agreement — either on your own behalf or on behalf of your company.',
      '• Your use of infiAP services is not prohibited by any applicable law or regulation.',
      'Note: If you are using our services on behalf of a company, "you" means both you as an individual and the company you represent. Both are bound by these terms.',
    ],
  },
  {
    title: '2. Your Account',
    body: [
      'When you create an account with us, you are responsible for keeping it secure. Here\'s what that means:',
      '• Use a strong, unique password and don\'t share it with anyone.',
      '• Notify us immediately at security@infiap.com if you suspect unauthorized access.',
      '• You are responsible for all activity that happens under your account.',
      '• Each account is for one person or one company — no account sharing.',
    ],
  },
  {
    title: '3. Acceptable Use',
    body: [
      'We built infiAP to be useful, safe, and fair for everyone. To keep it that way, the following are strictly prohibited:',
      '• Using our platform for any illegal activity or to violate anyone\'s rights.',
      '• Attempting to scrape, copy, or bulk-extract data from our platform without written permission.',
      '• Impersonating any person, company, or entity.',
      '• Uploading malware, viruses, or any harmful code.',
      '• Attempting to gain unauthorized access to any part of our systems.',
      '• Sending spam, phishing messages, or unsolicited bulk communications.',
      'Violations may result in immediate account suspension without prior notice.',
    ],
  },
  {
    title: '4. Your Content & Intellectual Property',
    body: [
      'Anything you upload, create, or submit through infiAP ("Your Content") remains yours. Here\'s how it works:',
      '• You keep full ownership of all content you create or upload.',
      '• By using our services, you grant infiAP a limited, non-exclusive license to host, store, and display your content solely to provide the service to you.',
      '• We will never sell your content to third parties.',
      '• Our platform, branding, code, and documentation belong to infiAP. You may not copy, modify, or distribute them.',
    ],
  },
  {
    title: '5. Payments & Billing',
    body: [
      'If you use any paid features of infiAP, the following terms apply:',
      '• All fees are listed in INR unless stated otherwise, and exclude applicable taxes.',
      '• Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date.',
      '• Refunds are handled on a case-by-case basis. Contact support@infiap.com within 7 days of a charge to request a review.',
      '• We reserve the right to update pricing with 30 days\' notice via email.',
    ],
  },
  {
    title: '6. Limitation of Liability',
    body: [
      'We work hard to keep infiAP running smoothly, but we cannot guarantee perfection. To the maximum extent permitted by law:',
      '• infiAP is provided "as is" without warranties of any kind.',
      '• We are not liable for any indirect, incidental, or consequential damages arising from your use of our services.',
      '• Our total liability to you in any 12-month period shall not exceed the amount you paid us during that period.',
    ],
  },
  {
    title: '7. Account Termination',
    body: [
      'Either party may end this relationship at any time:',
      '• You may delete your account at any time from your account settings or by emailing support@infiap.com.',
      '• We may suspend or terminate your account if you violate these Terms, with or without prior notice depending on severity.',
      '• Upon termination, your right to access the service ends immediately. We may retain certain data as required by law.',
    ],
  },
  {
    title: '8. Governing Law & Disputes',
    body: [
      'These Terms are governed by the laws of India. In case of any dispute:',
      '• We encourage you to first contact us at legal@infiap.com to resolve the matter amicably.',
      '• Disputes that cannot be resolved informally shall be subject to the exclusive jurisdiction of courts in [Your City], India.',
      '• These Terms constitute the entire agreement between you and infiAP.',
    ],
  },
];

export default function TermsOfServiceScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => TermsOfServiceStyles(colors), [colors]);
  return (
    <View style={styles.root}>
      <Header title="Terms of Service" showBack={true} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>infiAP Technologies Pvt. Ltd.</Text>
        <Text style={styles.meta}>Effective Date: January 1, 2025  |  Last Updated: April 2025</Text>

        <Text style={styles.intro}>
          Welcome! By accessing or using infiAP&apos;s services, you agree to be bound by these
          Terms of Service. Please read them carefully. If you disagree with any part, you may not
          use our services.
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

        <Text style={styles.footer}>Questions about these terms? legal@infiap.com</Text>
        <Text style={styles.footerSmall}>© 2025 infiAP. All rights reserved.</Text>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

function TermsOfServiceStyles(colors: any) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.card },
  content: { padding: 20, paddingBottom: 120 },
  brand: { fontSize: 16, fontWeight: '800', color: colors.textSecondary },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 4, marginBottom: 16 },
  intro: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: 18 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textSecondary, marginBottom: 8 },
  paragraph: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: 6 },
  footer: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', marginTop: 12 },
  footerSmall: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
});
}
