'use client';

import { motion } from 'framer-motion';
import {
  Crown,
  Shield,
  BarChart3,
  Lock,
  Gift,
  Users,
  Heart,
  Trophy,
  Star,
  CheckCircle2,
  Globe,
  Target,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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

const features = [
  {
    icon: Shield,
    title: 'Fair Voting',
    desc: 'Our advanced anti-fraud system ensures every vote counts. One person, one voice — guaranteed fairness.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: BarChart3,
    title: 'Real-time Results',
    desc: 'Watch the leaderboard update live as votes pour in. Never miss a moment of the excitement.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Lock,
    title: 'Secure Platform',
    desc: 'Your data and transactions are protected with enterprise-grade security and encryption.',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: Gift,
    title: 'Amazing Rewards',
    desc: 'Winners take home incredible prizes. From cash awards to brand endorsements — the rewards are huge!',
    color: 'from-amber-500 to-yellow-500',
  },
];

const teamMembers = [
  {
    name: 'Aisha Okonkwo',
    role: 'Founder & CEO',
    bio: 'Passionate about empowering women through technology and events.',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Aisha',
  },
  {
    name: 'Chinedu Eze',
    role: 'Head of Technology',
    bio: 'Full-stack engineer with 10+ years of experience in scalable platforms.',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Chinedu',
  },
  {
    name: 'Funke Adeyemi',
    role: 'Creative Director',
    bio: 'Award-winning designer who brings beauty and vision to everything we do.',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Funke',
  },
  {
    name: 'Emeka Nwosu',
    role: 'Operations Manager',
    bio: 'Ensures every event runs smoothly from start to finish.',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Emeka',
  },
];

const platformStats = [
  { value: '50K+', label: 'Registered Voters', icon: Users },
  { value: '12', label: 'Contestants', icon: Crown },
  { value: '3', label: 'Tournament Stages', icon: Trophy },
  { value: '100K+', label: 'Votes Cast', icon: Heart },
];

export default function AboutPage() {
  const { navigate } = useNavigationStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeInUp} custom={0}>
              <Badge
                variant="secondary"
                className="mb-6 bg-primary/10 text-primary border-primary/20"
              >
                <Globe className="w-3 h-3 mr-1" />
                About Us
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
            >
              Empowering Beauty,{' '}
              <span className="gradient-text">Celebrating Queens</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              BeautyVote is the leading online voting platform dedicated to fair
              competitions, transparent results, and empowering contestants to
              achieve their dreams.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold mb-6"
            >
              Our <span className="gradient-text">Mission</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              We believe every voice matters. Our mission is to create a
              transparent, secure, and engaging platform where beauty contestants
              can showcase their talent and personality, while the community
              votes fairly to determine the true queen. We aim to democratize
              beauty competitions by leveraging technology for real-time,
              tamper-proof voting.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2
              variants={fadeInUp}
              custom={0}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              Why Choose <span className="gradient-text">BeautyVote?</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={1}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              Our platform is built with the best technology and practices to
              ensure a flawless experience.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full text-center p-6 hover:shadow-xl transition-all duration-300 border-0 group">
                  <CardContent className="p-0 flex flex-col items-center">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2
              variants={fadeInUp}
              custom={0}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              Meet Our <span className="gradient-text">Team</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={1}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              The passionate people behind BeautyVote who make it all happen.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full text-center p-6 hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-0 flex flex-col items-center">
                    <Avatar className="h-24 w-24 border-4 border-primary/20 mb-4 group-hover:border-primary/50 transition-colors">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-bold">{member.name}</h3>
                    <p className="text-sm text-primary font-medium mb-2">
                      {member.role}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {platformStats.map((stat) => (
                <Card key={stat.label} className="text-center p-6 border-0 shine">
                  <CardContent className="p-0 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-3xl font-bold gradient-text mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to <span className="gradient-text">Join Us?</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Become part of the BeautyVote community today and help crown the
              next queen!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 px-8 py-6 rounded-2xl font-semibold shadow-xl shadow-primary/25"
                onClick={() => navigate('register')}
              >
                <Star className="w-5 h-5 mr-2" />
                Register Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 rounded-2xl font-semibold"
                onClick={() => navigate('contact')}
              >
                Get In Touch
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
