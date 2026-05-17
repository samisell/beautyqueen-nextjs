'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  ChevronRight,
  ArrowRight,
  Shield,
  Users,
  Vote,
  Trophy,
  CreditCard,
  Gift,
  Lock,
  FileText,
  AlertCircle,
  Gavel,
  Contact,
  CheckCircle2,
  Menu,
  X,
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
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const tocItems = [
  { id: 'section-1', label: 'Acceptance of Terms', icon: CheckCircle2 },
  { id: 'section-2', label: 'Eligibility', icon: Users },
  { id: 'section-3', label: 'Account Registration & Security', icon: Lock },
  { id: 'section-4', label: 'Voting Rules', icon: Vote },
  { id: 'section-5', label: 'Contestant Rules', icon: Shield },
  { id: 'section-6', label: 'Tournament Rules', icon: Trophy },
  { id: 'section-7', label: 'Payment Terms', icon: CreditCard },
  { id: 'section-8', label: 'Prize Distribution', icon: Gift },
  { id: 'section-9', label: 'Intellectual Property', icon: FileText },
  { id: 'section-10', label: 'Limitation of Liability', icon: AlertCircle },
  { id: 'section-11', label: 'Privacy', icon: Lock },
  { id: 'section-12', label: 'Changes to Terms', icon: FileText },
  { id: 'section-13', label: 'Governing Law', icon: Gavel },
  { id: 'section-14', label: 'Contact Information', icon: Contact },
];

const sections = [
  {
    id: 'section-1',
    number: 1,
    title: 'Acceptance of Terms',
    content: `By accessing or using BeautyVote ("the Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you must not use the Platform.

These Terms constitute a legally binding agreement between you ("User," "you," or "your") and BeautyVote ("we," "us," or "our"). By creating an account, voting, registering as a contestant, or engaging in any activity on the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms.

We reserve the right to modify these Terms at any time. Continued use of the Platform after any changes constitutes acceptance of the modified Terms.`,
  },
  {
    id: 'section-2',
    number: 2,
    title: 'Eligibility',
    content: `To use BeautyVote, you must meet the following eligibility requirements:

• You must be at least 18 (eighteen) years of age.
• You must not be barred from using the Platform under any applicable law.
• You must be a resident of a country where our services are legally available.
• Each person is permitted only ONE (1) account. Creating multiple accounts is strictly prohibited and will result in immediate and permanent ban of all associated accounts.

If you are registering as a contestant, you must also:
• Be 18 years or older at the time of registration.
• Have valid identification documents.
• Agree to the Contestant Rules outlined in Section 5.

We reserve the right to verify your identity and age at any time. Failure to provide satisfactory proof of identity may result in account suspension or termination.`,
  },
  {
    id: 'section-3',
    number: 3,
    title: 'Account Registration & Security',
    content: `When you create an account on BeautyVote, you agree to:

• Provide accurate, current, and complete information during registration.
• Maintain and promptly update your account information to keep it accurate, current, and complete.
• Maintain the security and confidentiality of your login credentials.
• Accept all responsibility for activities that occur under your account.
• Immediately notify us of any unauthorized use of your account.

We will not be liable for any loss or damage arising from your failure to protect your account credentials. You may not transfer your account to another person or use another person's account without permission.

Accounts found to be using false information will be suspended pending verification. Persistent violations may result in permanent account termination.`,
  },
  {
    id: 'section-4',
    number: 4,
    title: 'Voting Rules',
    content: `The following rules govern all voting activities on BeautyVote:

• All votes require payment of ₦200 (two hundred Naira) per vote. There are NO free votes available on this platform.
• Votes are final once cast and CANNOT be reversed, changed, or refunded under any circumstances.
• Users may purchase vote packages that include bonus votes. Bonus votes are non-transferable and non-refundable.
• Votes must be cast through the official Platform interface only. Votes cast through any other method will not be counted.
• Each vote package purchase is final. No refunds will be issued for purchased votes, whether used or unused.
• Users may vote for any contestant without limit, subject to payment of the applicable fee per vote.

Prohibited voting activities include but are not limited to:
• Using bots, scripts, or automated tools to cast votes.
• Coordinating vote manipulation with other users.
• Creating multiple accounts to cast additional votes.
• Offering or accepting payment for votes outside the Platform.

Any violation of these voting rules will result in immediate disqualification of affected votes and potential account suspension.`,
  },
  {
    id: 'section-5',
    number: 5,
    title: 'Contestant Rules',
    content: `Contestants on BeautyVote must adhere to the following rules:

• All photos submitted must be authentic and belong to the contestant. Stock photos, heavily edited images, or images of other persons are strictly prohibited.
• Contestants must not engage in harassment, bullying, or intimidation of other contestants, voters, or Platform staff.
• Contestants must not offer incentives outside the Platform for votes (e.g., paying voters directly, offering personal favors).
• All information provided in contestant profiles must be truthful and accurate.
• Contestants must comply with all Platform guidelines regarding photo quality, content restrictions, and bio requirements.

BeautyVote reserves the right to:
• Disqualify any contestant at any time for violation of these rules.
• Remove or request modification of contestant content that violates our guidelines.
• Suspend or terminate contestant accounts for repeated violations.
• Make final determinations regarding contestant eligibility and disqualification.

Disqualified contestants will forfeit any votes received and any prize claims.`,
  },
  {
    id: 'section-6',
    number: 6,
    title: 'Tournament Rules',
    content: `BeautyVote tournaments operate under the following structure and rules:

• Each tournament consists of multiple stages: Preliminary, Semi-Final, and Final rounds.
• Contestants progress through stages based on total votes received.
• At the end of each stage, the lowest-performing contestants may be eliminated based on vote counts.
• The number of contestants eliminated at each stage is determined by BeautyVote administration and may vary.
• Tournament schedules, including start and end dates for each stage, are published on the Platform and may be adjusted at our discretion.

Administrative decisions regarding:
• Stage progression and elimination are FINAL.
• Vote count verification and adjustment are binding.
• Tournament scheduling changes are at our sole discretion.
• Dispute resolution related to tournament outcomes.

We strive to maintain a fair and transparent competition. However, all administrative decisions related to tournaments are final and not subject to appeal.`,
  },
  {
    id: 'section-7',
    number: 7,
    title: 'Payment Terms',
    content: `The following payment terms apply to all transactions on BeautyVote:

Vote Pricing:
• Each vote costs ₦200 (two hundred Naira).
• Vote packages are available at various price points with potential bonus votes.

Accepted Payment Methods:
• Flutterwave — Credit/Debit cards, bank transfers
• Paystack — Credit/Debit cards, bank transfers
• Offline Payment — Direct bank transfer to our designated accounts

Payment Policies:
• All payments are processed securely through our payment partners.
• Vote purchases are FINAL and NON-REFUNDABLE.
• Votes are credited to your account immediately after successful payment confirmation.
• For offline payments, votes will be credited after payment verification (typically within 2-24 hours).
• BeautyVote does not store your payment card details. All financial data is handled by our PCI-DSS compliant payment processors.

Failed Payments:
• If a payment fails but funds were debited, please contact support with your transaction reference for resolution.
• Payments not resolved within 7 business days may be eligible for manual review.`,
  },
  {
    id: 'section-8',
    number: 8,
    title: 'Prize Distribution',
    content: `Prize distribution follows these guidelines:

Winner Notification:
• Winners will be contacted within seven (7) days of the final results announcement via the email address registered to their account.
• Winners must respond within fourteen (14) days of notification to claim their prize.
• Failure to respond within the specified period may result in forfeiture of the prize.

Verification Requirements:
• Winners must provide valid government-issued identification for verification.
• Winners must provide valid Nigerian bank account details for cash prize transfers.
• Additional verification may be required at our discretion.

Prize Transfer:
• Cash prizes will be transferred within thirty (30) business days after successful verification.
• Non-cash prizes (trophies, photoshoot packages, etc.) will be arranged within sixty (60) days.
• Prize transfer logistics will be communicated to winners via email.

Tax Obligations:
• Winners are solely responsible for any taxes applicable to their prizes under Nigerian law.
• BeautyVote will provide necessary documentation for tax purposes upon request.`,
  },
  {
    id: 'section-9',
    number: 9,
    title: 'Intellectual Property',
    content: `All content on BeautyVote, including but not limited to logos, designs, text, graphics, images, and software, is the property of BeautyVote or its content suppliers and is protected by intellectual property laws.

User Content:
• By submitting photos, bio information, or other content to the Platform, you grant BeautyVote a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display such content for Platform-related purposes.
• You retain ownership of your original content.
• You represent that you have the right to grant this license for all content you submit.

Restrictions:
• You may not copy, modify, distribute, sell, or lease any part of our Platform.
• You may not reverse-engineer or attempt to extract the source code of our Platform.
• You may not use our branding, logos, or trademarks without prior written permission.

Unauthorized use of our intellectual property may result in legal action.`,
  },
  {
    id: 'section-10',
    number: 10,
    title: 'Limitation of Liability',
    content: `To the fullest extent permitted by applicable law:

• BeautyVote shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Platform.
• Our total liability to you for any claims arising from these Terms shall not exceed the amount you have paid to us in the twelve (12) months preceding the claim.
• We are not liable for any loss of votes, data, or other losses resulting from technical issues, including but not limited to server outages, bugs, or maintenance.
• We are not responsible for the actions or statements of contestants, voters, or third parties on the Platform.
• We do not guarantee uninterrupted or error-free operation of the Platform.

You agree to indemnify and hold harmless BeautyVote, its officers, directors, employees, agents, and affiliates from any claims, damages, losses, or expenses arising from your violation of these Terms or your use of the Platform.`,
  },
  {
    id: 'section-11',
    number: 11,
    title: 'Privacy',
    content: `Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.

By using BeautyVote, you consent to the collection and use of your information as described in our Privacy Policy. Key points include:

• We collect personal information such as your name, email address, phone number, and bank details when you register and use our services.
• We use your information to provide and improve our services, process payments, and communicate with you.
• We never sell your personal information to third parties.
• We share your information only with payment processors as necessary to facilitate transactions.
• You have the right to access, correct, and request deletion of your personal data.

To read our complete Privacy Policy, please click here or navigate to the Privacy Policy page.`,
  },
  {
    id: 'section-12',
    number: 12,
    title: 'Changes to Terms',
    content: `BeautyVote reserves the right to modify, update, or replace these Terms at any time at our sole discretion.

Notification of Changes:
• We will notify users of significant changes via email to the address registered to your account.
• We may also display prominent notices on the Platform.
• The "Last Updated" date at the top of these Terms will be revised with each update.

Effect of Changes:
• Changes become effective immediately upon posting unless otherwise stated.
• Your continued use of the Platform after changes are posted constitutes acceptance of the revised Terms.
• If you do not agree with the changes, you must stop using the Platform and may request account deletion.

We encourage you to review these Terms periodically to stay informed of any updates.`,
  },
  {
    id: 'section-13',
    number: 13,
    title: 'Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions.

Dispute Resolution:
• Any disputes arising from these Terms or your use of the Platform shall first be attempted to be resolved through good-faith negotiation.
• If negotiation fails, disputes shall be submitted to exclusive jurisdiction of the courts of Lagos State, Nigeria.
• You agree to waive any right to a jury trial in connection with any dispute arising under these Terms.

These Terms constitute the entire agreement between you and BeautyVote regarding the use of the Platform, superseding any prior agreements or understandings.

If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.`,
  },
  {
    id: 'section-14',
    number: 14,
    title: 'Contact Information',
    content: `If you have any questions, concerns, or requests regarding these Terms and Conditions, please contact us through the following channels:

Email: support@beautyvote.com
Phone: +234 800 123 4567
Address: Victoria Island, Lagos, Nigeria

Business Hours:
Monday – Friday: 9:00 AM – 6:00 PM WAT
Saturday: 10:00 AM – 4:00 PM WAT
Sunday: Closed

For urgent matters, please email us at support@beautyvote.com with the subject line "URGENT: [Brief Description]". We will prioritize your inquiry accordingly.

You may also visit our Support Center to create a support ticket or browse our FAQ section for instant answers.`,
  },
];

export default function TermsPage() {
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
            src="/cleopas-monbest-LtJMm2rIopY-unsplash.jpg"
            alt="Legal terms"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeInUp} custom={0}>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Scale className="w-3 h-3 mr-1" />
                Legal
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
              Terms & <span className="text-amber-400">Conditions</span>
            </motion.h1>
            <motion.p variants={fadeInUp} custom={2} className="text-white/80 max-w-2xl mx-auto text-lg mb-4">
              Please read these terms carefully before using BeautyVote
            </motion.p>
            <motion.div variants={fadeInUp} custom={3}>
              <Badge className="bg-white/10 text-white/90 border-white/20">
                <FileText className="w-3 h-3 mr-1" />
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
                <Scale className="w-5 h-5" />
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
                    {tocItems.map((item) => (
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
                        <span className="flex-1">{item.number}. {item.label}</span>
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
                    <Scale className="w-5 h-5 text-primary" />
                    Table of Contents
                  </h3>
                  <nav className="space-y-1">
                    {tocItems.map((item) => (
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
                        <span className="flex-1">{item.number}. {item.label}</span>
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
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    Questions About Our <span className="gradient-text">Terms?</span>
                  </h2>
                  <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                    If you have any questions about these Terms & Conditions, please don&apos;t hesitate to reach out.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 px-8 py-6 rounded-2xl font-semibold shadow-xl shadow-primary/25"
                      onClick={() => navigate('contact')}
                    >
                      <Contact className="w-5 h-5 mr-2" />
                      Contact Us
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-6 rounded-2xl font-semibold"
                      onClick={() => navigate('privacy')}
                    >
                      <Lock className="w-5 h-5 mr-2" />
                      Privacy Policy
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
