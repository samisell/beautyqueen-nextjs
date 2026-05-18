'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  ChevronRight,
  ArrowRight,
  Lock,
  Users,
  Database,
  Eye,
  Cookie,
  UserCheck,
  Clock,
  AlertTriangle,
  ExternalLink,
  FileText,
  Mail,
  Menu,
  X,
  CheckCircle2,
  BarChart3,
  Share2,
  Trash2,
  Download,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore } from '@/stores/navigation-store';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as any },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const tocItems = [
  { id: 'section-1', label: 'Information We Collect', icon: Database },
  { id: 'section-2', label: 'How We Use Your Information', icon: BarChart3 },
  { id: 'section-3', label: 'Information Sharing', icon: Share2 },
  { id: 'section-4', label: 'Data Security', icon: Lock },
  { id: 'section-5', label: 'Cookies & Tracking', icon: Cookie },
  { id: 'section-6', label: 'Your Rights', icon: UserCheck },
  { id: 'section-7', label: 'Data Retention', icon: Clock },
  { id: 'section-8', label: 'Children\'s Privacy', icon: AlertTriangle },
  { id: 'section-9', label: 'Third-Party Links', icon: ExternalLink },
  { id: 'section-10', label: 'Changes to Privacy Policy', icon: Settings },
  { id: 'section-11', label: 'Contact Us', icon: Mail },
];

const sections = [
  {
    id: 'section-1',
    number: 1,
    title: 'Information We Collect',
    content: `BeautyVote collects the following types of information to provide and improve our services:

Personal Information:
• Full name (first and last name)
• Email address
• Phone number
• Residential address (for prize delivery)
• Date of birth (for age verification)
• Bank account details (for prize distribution)

Account Information:
• Username and password (stored in encrypted form)
• Profile photo (optional)
• Referral code and referral history

Contestant Information:
• Contestant photos and bio
• Category preferences
• Task submissions and results

Payment Information:
• Transaction history
• Payment method preferences
• Invoice and receipt information (handled by payment processors)

Usage Data:
• IP address and browser type
• Device information
• Pages visited and time spent
• Voting patterns and history
• Referral link activity

We collect this information directly from you when you register, fill out forms, make payments, or interact with the Platform. Some information is collected automatically through cookies and similar technologies.`,
  },
  {
    id: 'section-2',
    number: 2,
    title: 'How We Use Your Information',
    content: `BeautyVote uses the information we collect for the following purposes:

Service Delivery:
• Create and manage your account
• Process vote purchases and payment transactions
• Facilitate the voting process in tournaments
• Manage contestant registrations and profiles
• Distribute prizes to winners
• Provide customer support and respond to inquiries

Communication:
• Send account verification emails
• Notify you of tournament updates and announcements
• Deliver payment confirmations and receipts
• Send marketing communications (with your consent)
• Respond to your support requests

Platform Improvement:
• Analyze usage patterns to improve our services
• Detect and prevent fraud, abuse, and security breaches
• Personalize your experience on the Platform
• Conduct research and analytics to understand user preferences

Legal Compliance:
• Comply with applicable laws and regulations
• Enforce our Terms and Conditions
• Respond to legal requests and court orders
• Protect the rights, property, and safety of BeautyVote, our users, and the public

We will only use your personal information for the purposes for which it was collected, or as otherwise permitted by applicable law.`,
  },
  {
    id: 'section-3',
    number: 3,
    title: 'Information Sharing',
    content: `BeautyVote is committed to protecting your privacy. We do NOT sell your personal information to any third party.

We may share your information with:

Payment Processors:
• Flutterwave and Paystack: To securely process your vote purchases and payments. These processors handle your card details directly and are PCI-DSS compliant.
• Bank transfer details are used solely for offline payment verification.

Service Providers:
• Hosting providers: To store and serve our Platform
• Email service providers: To deliver transactional and marketing emails
• Analytics providers: To help us understand Platform usage (anonymized data only)

Legal Requirements:
• Law enforcement agencies when required by law or court order
• Regulatory authorities as required by applicable regulations

Business Transfers:
• In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction. We will notify you of any such transfer.

Contestant Information:
• Contestant photos, names, and bios are publicly displayed on the Platform for voting purposes. By registering as a contestant, you consent to this public display.

We implement contractual and technical safeguards to ensure that third parties handle your data securely and only for the purposes we have specified.`,
  },
  {
    id: 'section-4',
    number: 4,
    title: 'Data Security',
    content: `BeautyVote implements industry-standard security measures to protect your personal information:

Encryption:
• All data transmitted between your browser and our servers is encrypted using TLS/SSL protocols.
• Sensitive data such as passwords is hashed and salted using industry-standard algorithms (bcrypt).
• Payment information is processed directly by our PCI-DSS compliant payment partners.

Infrastructure Security:
• Our servers are hosted on secure, enterprise-grade cloud infrastructure.
• Regular security audits and vulnerability assessments are conducted.
• Firewall protection and intrusion detection systems are in place.
• Automatic backups are performed regularly to prevent data loss.

Access Controls:
• Access to personal data is restricted to authorized personnel on a need-to-know basis.
• All staff members undergo security training and sign confidentiality agreements.
• Multi-factor authentication is required for administrative access.

Monitoring:
• We continuously monitor our systems for unauthorized access or suspicious activity.
• Security incidents are immediately investigated and affected users are notified.

While we implement robust security measures, no system is completely secure. We encourage you to use strong, unique passwords and to protect your login credentials.`,
  },
  {
    id: 'section-5',
    number: 5,
    title: 'Cookies & Tracking',
    content: `BeautyVote uses cookies and similar tracking technologies to enhance your experience:

Essential Cookies:
• Session cookies: To maintain your logged-in state
• Security cookies: To prevent cross-site request forgery (CSRF)
• Preference cookies: To remember your settings and preferences

These cookies are necessary for the Platform to function and cannot be disabled.

Analytics Cookies:
• We use analytics tools to understand how users interact with our Platform.
• This information helps us improve our services and user experience.
• Analytics data is anonymized and does not personally identify you.

Marketing Cookies (with consent):
• We may use marketing cookies with your explicit consent to deliver personalized advertisements.
• You can opt out of marketing cookies at any time through your browser settings.

Third-Party Cookies:
• Our payment processors (Flutterwave, Paystack) may set their own cookies during the payment process.
• These cookies are governed by the respective privacy policies of these providers.

Managing Cookies:
• You can control cookie settings through your browser preferences.
• Disabling essential cookies may affect Platform functionality.
• You can clear cookies at any time, though this may log you out of your account.`,
  },
  {
    id: 'section-6',
    number: 6,
    title: 'Your Rights',
    content: `Depending on your location, you may have the following rights regarding your personal information:

Right to Access:
• You can request a copy of all personal data we hold about you by contacting support@beautyvote.com.
• We will provide this information within 30 days of receiving your verified request.

Right to Correction:
• You can update your account information at any time through your dashboard settings.
• For information you cannot edit directly, please contact our support team.

Right to Deletion:
• You can request the deletion of your personal data by contacting us.
• Some data may be retained as required by law (e.g., transaction records for tax compliance).
• Contestant data associated with active tournaments may be retained until tournament completion.

Right to Data Portability:
• You can request your data in a structured, commonly used format (e.g., JSON or CSV).

Right to Withdraw Consent:
• Where we rely on your consent for processing (e.g., marketing emails), you can withdraw consent at any time.
• Withdrawing consent does not affect the lawfulness of processing based on consent before withdrawal.

Right to Object:
• You can object to the processing of your personal data for specific purposes, such as direct marketing.

To exercise any of these rights, please contact us at support@beautyvote.com or through the Support Center. We will respond to your request within 30 days.`,
  },
  {
    id: 'section-7',
    number: 7,
    title: 'Data Retention',
    content: `BeautyVote retains your personal information for the following periods:

Active Accounts:
• Your personal information is retained for as long as your account remains active.
• Information is reviewed periodically and updated as necessary.

Inactive Accounts:
• If your account is inactive for more than 24 months, we may send a notice to confirm whether you wish to keep your account.
• Accounts not confirmed within 30 days of such notice may be deleted.

Transaction Records:
• Payment and voting transaction records are retained for a minimum of 5 years for tax and legal compliance purposes.
• These records may be retained longer if required by applicable law.

Contestant Data:
• Contestant photos, bios, and voting records are retained for the duration of the tournament and up to 3 years after completion for archival purposes.

Closed Accounts:
• When you request account deletion, most personal data will be removed within 30 days.
• Anonymized usage data and records required by law will be retained as described above.

We implement appropriate measures to ensure data retained beyond its active use period is securely stored and access is minimized.`,
  },
  {
    id: 'section-8',
    number: 8,
    title: 'Children\'s Privacy',
    content: `BeautyVote is designed for users who are 18 years of age or older. We do not knowingly collect personal information from children under the age of 18.

If we become aware that we have inadvertently collected personal information from a person under 18, we will take immediate steps to:

• Delete such information from our servers
• Terminate the associated account
• Notify the individual (or their parent/guardian) of the deletion

Parental Supervision:
• We encourage parents and guardians to monitor their children's internet activity.
• Parents who believe their child has provided personal information to us should contact us immediately at support@beautyvote.com.

Age Verification:
• During registration, users must confirm they are at least 18 years old.
• We may request age verification documents at any time.
• Accounts that cannot verify age will be suspended until verification is provided.

By using BeautyVote, you represent and warrant that you are at least 18 years of age.`,
  },
  {
    id: 'section-9',
    number: 9,
    title: 'Third-Party Links',
    content: `The BeautyVote Platform may contain links to third-party websites, services, or applications that are not operated or controlled by us.

These third-party links are provided for your convenience and reference only. We do not endorse, guarantee, or assume responsibility for the content, privacy policies, or practices of any third-party websites.

Important Notes:
• Third-party websites have their own independent privacy policies, which we encourage you to review.
• Your interactions with third-party websites are governed solely by their terms and policies.
• BeautyVote is not responsible for any damages or losses arising from your use of third-party websites.
• We recommend that you read the privacy statements of any third-party website you visit through links on our Platform.

Payment processor pages (Flutterwave, Paystack) are covered by their respective privacy policies. Please refer to their websites for more information on how they handle your data.

If you have concerns about any third-party link on our Platform, please contact us at support@beautyvote.com.`,
  },
  {
    id: 'section-10',
    number: 10,
    title: 'Changes to Privacy Policy',
    content: `BeautyVote reserves the right to update or modify this Privacy Policy at any time.

Notification of Changes:
• We will notify you of significant changes to this Privacy Policy via email to the address registered to your account.
• We may also display a prominent notice on the Platform.
• The "Last Updated" date at the top of this policy will be revised with each update.

Reviewing Changes:
• We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
• Major changes will be highlighted in the notification email.

Effect of Changes:
• Changes to this Privacy Policy become effective immediately upon posting unless otherwise stated.
• Your continued use of the Platform after changes are posted constitutes your acceptance of the revised policy.
• If you do not agree with the changes, you may stop using the Platform and request deletion of your account.

To view the history of changes to this Privacy Policy, please contact us at support@beautyvote.com.`,
  },
  {
    id: 'section-11',
    number: 11,
    title: 'Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

Data Protection Officer
BeautyVote
Email: privacy@beautyvote.com
General Support: support@beautyvote.com
Phone: +234 800 123 4567
Address: Victoria Island, Lagos, Nigeria

For data-related requests (access, correction, deletion), please:
1. Send an email to privacy@beautyvote.com from your registered email address
2. Include your full name and account email in the subject line
3. Clearly describe your request
4. Attach any relevant identification documents

We will acknowledge your request within 3 business days and provide a substantive response within 30 days. In complex cases, we may extend this period and will notify you of any extension.

For urgent privacy concerns, please contact us directly at support@beautyvote.com with the subject line "PRIVACY URGENT: [Brief Description]".`,
  },
];

export default function PrivacyPage() {
  const { navigate } = useNavigationStore();
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('section-1');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      setMobileTocOpen(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 -z-10">
          <img
            src="/black-woman-with-ideal-skin-short-haircut-grey.jpg"
            alt="Data security"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeInUp} custom={0}>
              <div className="inline-flex items-center justify-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="w-20 h-20 rounded-3xl bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30"
                >
                  <Shield className="w-10 h-10 text-amber-400" />
                </motion.div>
              </div>
            </motion.div>
            <motion.h1 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
              Privacy <span className="text-amber-400">Policy</span>
            </motion.h1>
            <motion.p variants={fadeInUp} custom={2} className="text-white/80 max-w-2xl mx-auto text-lg mb-4">
              Your privacy matters to us. Learn how we collect, use, and protect your personal information.
            </motion.p>
            <motion.div variants={fadeInUp} custom={3}>
              <Badge className="bg-white/10 text-white/90 border-white/20">
                <Clock className="w-3 h-3 mr-1" />
                Last Updated: January 15, 2025
              </Badge>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Content Area with Sidebar TOC */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile TOC Toggle */}
          <div className="lg:hidden mb-6">
            <Button
              variant="outline"
              className="w-full justify-between rounded-2xl h-14 shadow-sm"
              onClick={() => setMobileTocOpen(!mobileTocOpen)}
            >
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Table of Contents
              </span>
              {mobileTocOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            {mobileTocOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="mt-3 shadow-lg rounded-2xl border-0 p-4">
                  <div className="space-y-1">
                    {tocItems.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                          activeSection === item.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{idx + 1}. {item.label}</span>
                      </button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="flex gap-12">
            {/* Desktop Sidebar TOC */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24">
                <Card className="shadow-lg rounded-2xl border-0 p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Table of Contents
                  </h3>
                  <nav className="space-y-1">
                    {tocItems.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                          activeSection === item.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{idx + 1}. {item.label}</span>
                      </button>
                    ))}
                  </nav>
                </Card>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="space-y-8">
                {sections.map((section, i) => (
                  <motion.div
                    key={section.id}
                    id={section.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: i * 0.03 }}
                    className="scroll-mt-24"
                  >
                    <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-primary font-bold text-lg">{section.number}</span>
                          </div>
                          <div>
                            <CardTitle className="text-xl sm:text-2xl">{section.title}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Separator className="mb-4" />
                        <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base">
                          {section.content}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="overflow-hidden border-0 shadow-lg rounded-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 sm:p-14">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    We Take Your <span className="gradient-text">Privacy Seriously</span>
                  </h2>
                  <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                    If you have any concerns about how we handle your data, please reach out to us.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 px-8 py-6 rounded-2xl font-semibold shadow-xl shadow-primary/25"
                      onClick={() => navigate('contact')}
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Contact Us
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-6 rounded-2xl font-semibold"
                      onClick={() => navigate('terms')}
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Terms & Conditions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
