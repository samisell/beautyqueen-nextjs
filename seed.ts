import { db } from './src/lib/db';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await db.vote.deleteMany();
  await db.notification.deleteMany();
  await db.voteLink.deleteMany();
  await db.referral.deleteMany();
  await db.payment.deleteMany();
  await db.purchasedVote.deleteMany();
  await db.contestant.deleteMany();
  await db.category.deleteMany();
  await db.tournamentStage.deleteMany();
  await db.votePackage.deleteMany();
  await db.user.deleteMany();

  // Create categories
  const categories = await Promise.all([
    db.category.create({ data: { name: 'Miss Photogenic', description: 'Best photographed contestant', icon: '📸', order: 1 } }),
    db.category.create({ data: { name: 'Miss Talent', description: 'Most talented contestant', icon: '🌟', order: 2 } }),
    db.category.create({ data: { name: 'Miss Congeniality', description: 'Most friendly and likeable', icon: '💝', order: 3 } }),
    db.category.create({ data: { name: 'Miss Fashion', description: 'Best fashion sense', icon: '👗', order: 4 } }),
  ]);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await db.user.create({
    data: {
      email: 'admin@beautyvote.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      referralCode: 'ADMIN001',
      isVerified: true,
    },
  });

  // Create test users
  const userPassword = await bcrypt.hash('password123', 10);
  const users = [];
  for (let i = 1; i <= 6; i++) {
    const user = await db.user.create({
      data: {
        email: `user${i}@test.com`,
        password: userPassword,
        name: `Test User ${i}`,
        role: 'user',
        referralCode: `USER${String(i).padStart(4, '0')}`,
        isVerified: true,
      },
    });
    users.push(user);
  }

  // Create vote packages
  const packages = await Promise.all([
    db.votePackage.create({ data: { name: 'Starter Pack', votes: 10, price: 5.00, bonusVotes: 2, isPopular: false, isActive: true, order: 1 } }),
    db.votePackage.create({ data: { name: 'Popular Pack', votes: 50, price: 20.00, bonusVotes: 10, isPopular: true, isActive: true, order: 2 } }),
    db.votePackage.create({ data: { name: 'Premium Pack', votes: 100, price: 35.00, bonusVotes: 25, isPopular: false, isActive: true, order: 3 } }),
    db.votePackage.create({ data: { name: 'Ultimate Pack', votes: 500, price: 150.00, bonusVotes: 150, isPopular: false, isActive: true, order: 4 } }),
  ]);

  // Create tournament stages
  const stages = await Promise.all([
    db.tournamentStage.create({
      data: {
        name: 'Preliminary Round',
        description: 'All contestants compete for audience votes',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-02-28'),
        status: 'completed',
        order: 1,
      },
    }),
    db.tournamentStage.create({
      data: {
        name: 'Semi-Finals',
        description: 'Top 12 contestants advance',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-04-15'),
        status: 'active',
        order: 2,
      },
    }),
    db.tournamentStage.create({
      data: {
        name: 'Grand Finale',
        description: 'Top 6 contestants compete for the crown',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-05-31'),
        status: 'upcoming',
        order: 3,
      },
    }),
  ]);

  // Create contestants
  const contestantData = [
    { name: 'Aisha Johnson', bio: 'A vibrant model and aspiring actress from Lagos with a passion for community service.', category: 'Miss Photogenic', categoryId: categories[0].id, votes: 1247 },
    { name: 'Blessing Okonkwo', bio: 'A medical student who combines beauty with brains. Passionate about healthcare advocacy.', category: 'Miss Congeniality', categoryId: categories[2].id, votes: 1089 },
    { name: 'Chioma Eze', bio: 'Fashion designer and influencer known for her unique African-inspired designs.', category: 'Miss Fashion', categoryId: categories[3].id, votes: 985 },
    { name: 'Diana Okafor', bio: 'A talented singer and songwriter who has won multiple local music competitions.', category: 'Miss Talent', categoryId: categories[1].id, votes: 1432 },
    { name: 'Emmanuella Ibrahim', bio: 'Professional dancer and choreographer with international experience.', category: 'Miss Talent', categoryId: categories[1].id, votes: 876 },
    { name: 'Fatima Abdullahi', bio: 'Software engineer by day, beauty queen by night. Championing women in tech.', category: 'Miss Photogenic', categoryId: categories[0].id, votes: 1105 },
    { name: 'Grace Mbah', bio: 'A culinary artist and food blogger who brings people together through food.', category: 'Miss Congeniality', categoryId: categories[2].id, votes: 923 },
    { name: 'Hannah Peters', bio: 'Environmental activist and model promoting sustainable fashion.', category: 'Miss Fashion', categoryId: categories[3].id, votes: 834 },
    { name: 'Irene Adeyemi', bio: 'A spoken word poet and motivational speaker inspiring young women.', category: 'Miss Talent', categoryId: categories[1].id, votes: 1021 },
    { name: 'Janet Obi', bio: 'Pharmacist and fitness enthusiast promoting holistic wellness.', category: 'Miss Photogenic', categoryId: categories[0].id, votes: 756 },
    { name: 'Kelechi Nwankwo', bio: 'Lawyer and human rights advocate fighting for equality.', category: 'Miss Congeniality', categoryId: categories[2].id, votes: 698 },
    { name: 'Linda Adebayo', bio: 'A rising star in Nollywood with several award nominations.', category: 'Miss Photogenic', categoryId: categories[0].id, votes: 1156 },
  ];

  const contestants = [];
  for (const data of contestantData) {
    const contestant = await db.contestant.create({
      data: {
        name: data.name,
        bio: data.bio,
        imageUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
        category: data.category,
        categoryId: data.categoryId,
        status: data.votes > 900 ? 'active' : 'eliminated',
        totalVotes: data.votes,
        stageId: data.votes > 900 ? stages[1].id : stages[0].id,
      },
    });
    contestants.push(contestant);
  }

  // Create sample votes for contestants
  for (const contestant of contestants) {
    const voteCount = Math.floor(contestant.totalVotes * 0.7);
    const votes = [];
    for (let i = 0; i < Math.min(voteCount, 20); i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      votes.push({
        contestantId: contestant.id,
        userId: randomUser.id,
        voteType: Math.random() > 0.3 ? 'free' : 'paid',
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }
    if (votes.length > 0) {
      await db.vote.createMany({ data: votes });
    }
  }

  // Create purchased votes for test users
  for (const user of users.slice(0, 3)) {
    await db.purchasedVote.create({
      data: {
        userId: user.id,
        packageId: packages[1].id,
        votesAmount: 60,
        votesUsed: Math.floor(Math.random() * 30),
      },
    });
  }

  // Create sample payments
  for (const user of users.slice(0, 3)) {
    await db.payment.create({
      data: {
        userId: user.id,
        packageId: packages[1].id,
        amount: 20.00,
        status: 'completed',
        paymentMethod: 'mock',
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      },
    });
  }

  // Create sample notifications
  for (const user of users.slice(0, 3)) {
    await Promise.all([
      db.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to Beauty Vote!',
          message: 'Start voting for your favorite contestants now.',
          type: 'info',
        },
      }),
      db.notification.create({
        data: {
          userId: user.id,
          title: 'Semi-Finals Started!',
          message: 'The semi-finals round has begun. Vote now!',
          type: 'success',
        },
      }),
    ]);
  }

  console.log('✅ Seeding completed successfully!');
  console.log(`   Created ${categories.length} categories`);
  console.log(`   Created ${users.length + 1} users (1 admin)`);
  console.log(`   Created ${contestants.length} contestants`);
  console.log(`   Created ${packages.length} vote packages`);
  console.log(`   Created ${stages.length} tournament stages`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
