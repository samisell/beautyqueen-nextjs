import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = await Promise.all([
    db.category.upsert({
      where: { name: 'Miss' },
      update: {},
      create: { name: 'Miss', description: 'Female contestants', icon: '👸', order: 0 },
    }),
    db.category.upsert({
      where: { name: 'Mr' },
      update: {},
      create: { name: 'Mr', description: 'Male contestants', icon: '🤴', order: 1 },
    }),
    db.category.upsert({
      where: { name: 'Kids' },
      update: {},
      create: { name: 'Kids', description: 'Young contestants', icon: '⭐', order: 2 },
    }),
    db.category.upsert({
      where: { name: 'Teens' },
      update: {},
      create: { name: 'Teens', description: 'Teenage contestants', icon: '🌟', order: 3 },
    }),
  ]);

  // Create admin user
  const adminPassword = await import('bcryptjs').then(b => b.default.hash('Admin@123', 12));
  const admin = await db.user.upsert({
    where: { email: 'admin@beautyvote.com' },
    update: {},
    create: {
      email: 'admin@beautyvote.com',
      password: adminPassword,
      name: 'Admin',
      role: 'admin',
      referralCode: 'ADMIN001',
      isVerified: true,
    },
  });

  // Create test users
  const testUsers = [];
  for (let i = 1; i <= 5; i++) {
    const pwd = await import('bcryptjs').then(b => b.default.hash(`User${i}@123`, 12));
    const user = await db.user.upsert({
      where: { email: `user${i}@test.com` },
      update: {},
      create: {
        email: `user${i}@test.com`,
        password: pwd,
        name: `Test User ${i}`,
        role: 'user',
        referralCode: `TEST${String(i).padStart(6, '0')}`,
        isVerified: true,
      },
    });
    testUsers.push(user);
  }

  // Create a tournament
  const tournament = await db.tournament.create({
    data: {
      name: 'Beauty Queen 2025',
      description: 'The ultimate beauty competition of the year',
      status: 'active',
    },
  });

  // Create tournament stages
  const now = new Date();
  const stages = await Promise.all([
    db.tournamentStage.create({
      data: {
        tournamentId: tournament.id,
        name: 'Qualifying Round',
        description: 'All contestants compete — top vote-getters advance to the Semi-Finals',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
        status: 'active',
        order: 1,
        minVotes: 20,
        maxContestants: 50,
      },
    }),
    db.tournamentStage.create({
      data: {
        tournamentId: tournament.id,
        name: 'Semi-Finals',
        description: 'The competition heats up — only the best survive',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 28),
        status: 'upcoming',
        order: 2,
        minVotes: 50,
        maxContestants: 20,
      },
    }),
    db.tournamentStage.create({
      data: {
        tournamentId: tournament.id,
        name: 'Grand Finale',
        description: 'The ultimate showdown — crown the winner!',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 29),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 42),
        status: 'upcoming',
        order: 3,
        minVotes: 100,
        maxContestants: 10,
      },
    }),
  ]);

  // Create contestants
  const contestantData = [
    { name: 'Adaora Okafor', category: 'Miss', imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Adaora', votes: 45 },
    { name: 'Chidinma Eze', category: 'Miss', imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Chidinma', votes: 38 },
    { name: 'Emeka Nwachukwu', category: 'Mr', imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Emeka', votes: 32 },
    { name: 'Folake Adeyemi', category: 'Miss', imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Folake', votes: 55 },
    { name: 'Gbenga Akinola', category: 'Mr', imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Gbenga', votes: 28 },
    { name: 'Halima Bello', category: 'Miss', imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Halima', votes: 41 },
    { name: 'Ibrahim Musa', category: 'Mr', imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Ibrahim', votes: 19 },
    { name: 'Joy Okonkwo', category: 'Miss', imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Joy', votes: 63 },
    { name: 'Kunle Balogun', category: 'Mr', imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Kunle', votes: 35 },
    { name: 'Lola Adekunle', category: 'Miss', imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Lola', votes: 50 },
    { name: 'Mercy Igwe', category: 'Kids', imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Mercy', votes: 22 },
    { name: 'Nnamdi Obi', category: 'Mr', imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Nnamdi', votes: 15 },
  ];

  for (const c of contestantData) {
    const cat = categories.find(cat => cat.name === c.category);
    await db.contestant.create({
      data: {
        name: c.name,
        bio: `Meet ${c.name} — a talented contestant competing for the crown!`,
        imageUrl: c.imageUrl,
        category: c.category,
        categoryId: cat?.id,
        status: 'active',
        totalVotes: c.votes,
        stageId: stages[0].id,
      },
    });
  }

  // Create vote packages
  await Promise.all([
    db.votePackage.create({
      data: { name: 'Starter', votes: 5, price: 1000, bonusVotes: 0, isPopular: false, isActive: true, order: 1 },
    }),
    db.votePackage.create({
      data: { name: 'Popular', votes: 15, price: 2500, bonusVotes: 3, isPopular: true, isActive: true, order: 2 },
    }),
    db.votePackage.create({
      data: { name: 'Super', votes: 50, price: 7000, bonusVotes: 10, isPopular: false, isActive: true, order: 3 },
    }),
    db.votePackage.create({
      data: { name: 'Mega', votes: 100, price: 12000, bonusVotes: 25, isPopular: false, isActive: true, order: 4 },
    }),
  ]);

  // Create platform settings
  await Promise.all([
    db.platformSetting.upsert({
      where: { key: 'votePrice' },
      update: {},
      create: { key: 'votePrice', value: '200' },
    }),
    db.platformSetting.upsert({
      where: { key: 'currency' },
      update: {},
      create: { key: 'currency', value: 'NGN' },
    }),
    db.platformSetting.upsert({
      where: { key: 'platformName' },
      update: {},
      create: { key: 'platformName', value: 'Beauty Vote' },
    }),
  ]);

  // Generate some sample votes for realism
  for (const c of contestantData) {
    const contestant = await db.contestant.findFirst({ where: { name: c.name } });
    if (!contestant) continue;

    const voteCount = Math.min(c.votes, 15); // Create some vote records
    for (let i = 0; i < voteCount; i++) {
      const user = testUsers[Math.floor(Math.random() * testUsers.length)];
      await db.vote.create({
        data: {
          contestantId: contestant.id,
          userId: Math.random() > 0.3 ? user.id : null,
          voteType: Math.random() > 0.5 ? 'paid' : 'free',
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log(`  - ${categories.length} categories`);
  console.log(`  - ${testUsers.length + 1} users (1 admin)`);
  console.log(`  - ${contestantData.length} contestants`);
  console.log(`  - 4 vote packages`);
  console.log(`  - 1 tournament with ${stages.length} stages`);
  console.log(`  - 3 platform settings`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
