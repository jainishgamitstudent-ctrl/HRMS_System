/**
 * Simple i18n dictionary for InfiAP HRMS.
 * Keys are English labels; values are translations.
 * Add more keys as needed.
 */

const DICTIONARY = {
  // Common UI
  'Dashboard': 'डैशबोर्ड',
  'Management Hub': 'प्रबंधन केंद्र',
  'Admin Dashboard': 'व्यवस्थापक डैशबोर्ड',
  'Employees': 'कर्मचारी',
  'Department': 'विभाग',
  'Departments': 'विभाग',
  'Attendance': 'उपस्थिति',
  'Leave': 'अवकाश',
  'Recruitment': 'भर्ती',
  'Payroll': 'वेतन',
  'Performance': 'प्रदर्शन',
  'Analytics': 'विश्लेषण',
  'Resignation': 'इस्तीफा',
  'Settings': 'सेटिंग्स',
  'System Settings': 'सिस्टम सेटिंग्स',
  'Company Policies': 'कंपनी नीतियां',
  'WFH Access': 'WFH पहुंच',
  'My Profile': 'मेरी प्रोफाइल',
  'Internal Jobs': 'आंतरिक नौकरियां',
  'Navigation': 'नेविगेशन',
  'Sign Out': 'साइन आउट',
  'Logout Account': 'लॉगआउट खाता',
  'Add Employee': 'कर्मचारी जोड़ें',
  'Edit Profile': 'प्रोफाइल संपादित करें',
  'New Department': 'नया विभाग',
  'Search employees, departments...': 'कर्मचारी, विभाग खोजें...',
  'Notifications': 'सूचनाएं',
  'No notifications yet': 'अभी तक कोई सूचना नहीं',
  'View all notifications': 'सभी सूचनाएं देखें',
  'Clear All': 'सभी साफ करें',
  'View Profile': 'प्रोफाइल देखें',
  'Reset Password': 'पासवर्ड रीसेट करें',
  'Admin Workspace': 'व्यवस्थापक कार्यस्थल',
  'Institutional Hub': 'संस्थागत केंद्र',
  'Connected': 'जुड़ा हुआ',
  'Live operational data from the admin service': 'व्यवस्थापक सेवा से लाइव संचालन डेटा',
  'HR operational overview and department insights': 'एचआर संचालन अवलोकन और विभाग जानकारी',
  'Overview': 'अवलोकन',
  'Snapshot': 'स्नैपशॉट',
  'Current Month': 'वर्तमान माह',
  'Monthly payroll': 'मासिक वेतन',
  'Teams': 'टीमें',
  'Prepared by': 'तैयारकर्ता',
  'View all': 'सभी देखें',

  // Stats labels
  'Total Employees': 'कुल कर्मचारी',
  'New Hires': 'नई भर्ती',
  'Active Employees': 'सक्रिय कर्मचारी',
  'Pending Onboarding': 'लंबित ऑनबोर्डिंग',
  'Open Positions': 'खुली पोस्ट',
  'Resignations': 'इस्तीफे',
  'Live directory': 'लाइव निर्देशिका',
  'Recent & Onboarding': 'हालिया और ऑनबोर्डिंग',
  'Currently active': 'वर्तमान में सक्रिय',
  'Awaiting setup': 'सेटअप की प्रतीक्षा',
  'Active recruitments': 'सक्रिय भर्तियां',
  'Active exit register': 'सक्रिय निकास रजिस्टर',
  'Assign Salary': 'वेतन नियुक्त करें',
  'Set payroll': 'वेतन सेट करें',
  'Assign': 'नियुक्त करें',
  'Sync Payroll Entry': 'वेतन प्रविष्टि सिंक करें',
  'Processing...': 'प्रसंस्करण...',

  // System Settings
  'Global configurations and platform preferences': 'वैश्विक कॉन्फ़िगरेशन और प्लेटफ़ॉर्म प्राथमिकताएं',
  'Save Changes': 'परिवर्तन सहेजें',
  'Saving...': 'सहेजा जा रहा...',
  'Reset': 'रीसेट',
  'General Preferences': 'सामान्य प्राथमिकताएं',
  'Configure regional and display settings': 'क्षेत्रीय और प्रदर्शन सेटिंग्स कॉन्फ़िगर करें',
  'Timezone': 'समय क्षेत्र',
  'Date Format': 'दिनांक प्रारूप',
  'Currency': 'मुद्रा',
  'Language': 'भाषा',
  'Manage system-wide alert channels': 'सिस्टम-व्यापी अलर्ट चैनल प्रबंधित करें',
  'Push Notifications': 'पुश सूचनाएं',
  'Get instant alerts directly on your device': 'अपने उपकरण पर त्वरित अलर्ट प्राप्त करें',
  'HR & Payroll Alerts': 'एचआर और वेतन अलर्ट',
  'Important module-specific notifications': 'महत्वपूर्ण मॉड्यूल-विशिष्ट सूचनाएं',
  'Security & Access': 'सुरक्षा और पहुंच',
  'Configure authentication and session monitoring': 'प्रमाणीकरण और सत्र निगरानी कॉन्फ़िगर करें',
  'Two-Factor Authentication': 'दो-कारक प्रमाणीकरण',
  'Require a secondary code for administrative access': 'प्रशासनिक पहुंच के लिए द्वितीयक कोड आवश्यक',
  'Login Monitoring': 'लॉगिन निगरानी',
  'Track and log successful and failed access attempts': 'सफल और विफल पहुंच प्रयासों को ट्रैक और लॉग करें',
  'Session Timeout': 'सत्र टाइमआउट',
  'Automatic logout after inactivity': 'निष्क्रियता के बाद स्वचालित लॉगआउट',
  'Platform Settings': 'प्लेटफ़ॉर्म सेटिंग्स',
  'System operations and maintenance controls': 'सिस्टम संचालन और रखरखाव नियंत्रण',
  'System Logs': 'सिस्टम लॉग',
  'Enable verbose logging for debugging purposes': 'डीबगिंग के लिए विस्तृत लॉगिंग सक्षम करें',
  'Maintenance Mode': 'रखरखाव मोड',
  'Temporarily restrict portal access to administrators only': 'अस्थायी रूप से पोर्टल पहुंच केवल व्यवस्थापकों तक सीमित करें',
  'System Status': 'सिस्टम स्थिति',
  'All services operational': 'सभी सेवाएं संचालित',
  'Core Version': 'कोर संस्करण',
  'Settings saved successfully!': 'सेटिंग्स सफलतापूर्वक सहेजी गईं!',
  'Settings saved locally. Syncing later...': 'सेटिंग्स स्थानीय रूप से सहेजी गईं। बाद में सिंक होगी...',
  'Settings reset to defaults': 'सेटिंग्स डिफ़ॉल्ट पर रीसेट',
  'Loading Configuration...': 'कॉन्फ़िगरेशन लोड हो रहा है...',
  'Reset all settings to defaults? This action cannot be undone.': 'सभी सेटिंग्स डिफ़ॉल्ट पर रीसेट करें? यह क्रिया पूर्ववत नहीं की जा सकती।',

  // Months
  'January': 'जनवरी',
  'February': 'फरवरी',
  'March': 'मार्च',
  'April': 'अप्रैल',
  'May': 'मई',
  'June': 'जून',
  'July': 'जुलाई',
  'August': 'अगस्त',
  'September': 'सितंबर',
  'October': 'अक्टूबर',
  'November': 'नवंबर',
  'December': 'दिसंबर',

  // Roles
  'Super Admin': 'सुपर एडमिन',
  'Company Admin': 'कंपनी एडमिन',
  'HR Manager': 'एचआर प्रबंधक',
  'Employee': 'कर्मचारी',
  'Admin': 'व्यवस्थापक',
  'Admin User': 'व्यवस्थापक उपयोगकर्ता',

  // Misc common
  'Just now': 'अभी',
  'Choose employee...': 'कर्मचारी चुनें...',
  'Select Employee': 'कर्मचारी चुनें',
  'Month': 'माह',
  'Year': 'वर्ष',
  'Basic Salary': 'मूल वेतन',
  'Deductions': 'कटौतियां',
  'Calculated Net Salary': 'गणना शुद्ध वेतन',
  'No departments loaded.': 'कोई विभाग लोड नहीं हुआ।',
  'Hub': 'केंद्र',
  'Check-in Records': 'चेक-इन रिकॉर्ड',
  'Monthly Attendance': 'मासिक उपस्थिति',
  'View Departments': 'विभाग देखें',
  'Create Department': 'विभाग बनाएं',
  'Manage Teams': 'टीम प्रबंधित करें',
  'Salary Processing': 'वेतन प्रसंस्करण',
  'Generate & Share': 'जनरेट और साझा करें',
  'Profile Management': 'प्रोफाइल प्रबंधन',
  'User Access Control': 'उपयोगकर्ता पहुंच नियंत्रण',
  'System Security': 'सिस्टम सुरक्षा',
  'WFH & Permissions': 'WFH और अनुमतियां',
  'Department Management': 'विभाग प्रबंधन',
  'Salary Slips': 'वेतन पर्ची',
  'members': 'सदस्य',
  'teams': 'टीमें',
  'new alerts': 'नई अलर्ट',
  'Monthly Payroll': 'मासिक वेतन',
};

/**
 * Translate a text label based on language setting.
 * Falls back to the original English if no translation exists.
 */
export const t = (text, language = 'English (US)') => {
  if (!text) return '';
  if (language.includes('Hindi')) {
    return DICTIONARY[text] || text;
  }
  return text;
};

/**
 * Translate an array of month objects.
 */
export const getTranslatedMonths = (language = 'English (US)') => {
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];
  return months.map((m) => ({ ...m, label: t(m.label, language) }));
};
