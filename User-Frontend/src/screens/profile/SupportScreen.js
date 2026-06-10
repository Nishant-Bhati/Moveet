import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../utils/theme';

export default function SupportScreen() {
  const navigation = useNavigation();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      q: 'How do I start a scooter ride?',
      a: 'Navigate to the Home map screen, select any nearby scooter marker or tap "SCAN TO UNLOCK". Scan the QR code located between the handlebars, click "START ENGINE" on your screen, and push off with your foot before throttle.',
    },
    {
      q: 'What are the subscription plans?',
      a: 'Moveet offers Daily, Weekly, and Monthly ride subscriptions. Subscriptions waive all scooter unlocking fees and provide unlimited ride durations during the subscription window.',
    },
    {
      q: 'How do I add money to the wallet?',
      a: 'Go to the Payments tab, tap the "+" button on the Balance Card. Select one of the top-up presets (₹100, ₹500, ₹1000) or enter a custom amount, and complete payment via Razorpay.',
    },
    {
      q: 'Where can I park the scooter?',
      a: 'Please park the scooter in designated active zones marked on the home screen map. Avoid blocking sidewalks, driveways, or public ramps to prevent parking penalties.',
    },
  ];

  const handleContactOption = (type) => {
    Alert.alert('Contacting Support', `${type} helpline is initiating. Our agents are online.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support & FAQs</Text>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact cards grid */}
        <Text style={styles.sectionHeading}>CONTACT SUPPORT</Text>
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.8}
            onPress={() => handleContactOption('Live Chat')}
          >
            <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} />
            <Text style={styles.contactTitle}>Live Chat</Text>
            <Text style={styles.contactDesc}>24/7 Agent Help</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.8}
            onPress={() => handleContactOption('Helpline Phone')}
          >
            <Ionicons name="call-outline" size={24} color={colors.primary} />
            <Text style={styles.contactTitle}>Phone Support</Text>
            <Text style={styles.contactDesc}>Direct Helpline</Text>
          </TouchableOpacity>
        </View>

        {/* Email card */}
        <TouchableOpacity
          style={styles.emailCard}
          activeOpacity={0.8}
          onPress={() => handleContactOption('Email')}
        >
          <Ionicons name="mail-outline" size={20} color={colors.primary} style={styles.emailIcon} />
          <View style={styles.emailInfo}>
            <Text style={styles.emailTitle}>Email Support</Text>
            <Text style={styles.emailDesc}>support@moveet.com</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#555555" />
        </TouchableOpacity>

        {/* FAQs */}
        <Text style={styles.sectionHeading}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.faqList}>
          {faqs.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <View key={index} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  activeOpacity={0.8}
                  onPress={() => setExpandedFaq(isExpanded ? null : index)}
                >
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#888888"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.a}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backPlaceholder: {
    width: 40,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  sectionHeading: {
    color: '#555555',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  contactDesc: {
    color: '#888888',
    fontSize: 11,
    marginTop: 4,
  },
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: spacing.xl,
  },
  emailTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emailDesc: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  faqList: {
    gap: 10,
  },
  faqCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#222222',
    paddingTop: 12,
  },
  faqAnswer: {
    color: '#CCCCCC',
    fontSize: 12,
    lineHeight: 18,
  },
  emailIcon: {
    marginRight: 12,
  },
  emailInfo: {
    flex: 1,
  },
});
