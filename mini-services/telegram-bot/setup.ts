// ─────────────────────────────────────────────────────────────────────────────
// BeautyVote Telegram Bot — Setup Script
// ─────────────────────────────────────────────────────────────────────────────
// Run this script to configure your Telegram bot:
//   bun run setup
//
// This script will:
// 1. Verify the bot token works
// 2. Set the bot's description and short description
// 3. Configure the "Open App" button (Menu Button)
// 4. Set webhook commands
//
// Prerequisites:
//   - TELEGRAM_BOT_TOKEN in .env (get from @BotFather)
//   - TELEGRAM_WEB_APP_URL in .env (your app's URL)
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config({ path: '.env' });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.TELEGRAM_WEB_APP_URL || 'https://beautyvote.app';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set.');
  console.error('   Steps:');
  console.error('   1. Open Telegram and search for @BotFather');
  console.error('   2. Send /newbot and follow the prompts');
  console.error('   3. Copy the bot token');
  console.error('   4. Add TELEGRAM_BOT_TOKEN=your_token to .env');
  process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function apiCall(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data;
}

async function setup() {
  console.log('🚀 Setting up BeautyVote Telegram Bot...\n');

  // Step 1: Verify bot token
  console.log('📡 Step 1/6: Verifying bot token...');
  const me = await apiCall('getMe', {});
  if (!me.ok) {
    console.error('   ❌ Invalid bot token. Please check your TELEGRAM_BOT_TOKEN.');
    process.exit(1);
  }
  console.log(`   ✅ Bot: @${me.result.username} (${me.result.first_name})`);

  // Step 2: Set bot description
  console.log('📝 Step 2/6: Setting bot description...');
  await apiCall('setMyDescription', {
    description: `BeautyVote — Vote for your favorite contestants and help them win amazing prizes!\n\nJust tap "Start" and you'll be automatically signed in. No registration needed!`,
  });
  console.log('   ✅ Description set');

  // Step 3: Set short description
  console.log('📝 Step 3/6: Setting short description...');
  await apiCall('setMyShortDescription', {
    short_description: 'Vote for beauty contestants • Auto-login via Telegram',
  });
  console.log('   ✅ Short description set');

  // Step 4: Set menu button (the button always visible at the bottom of chat)
  console.log('🔘 Step 4/6: Setting menu button...');
  await apiCall('setChatMenuButton', {
    chat_id: 0, // 0 means "set for all users"
    menu_button: {
      type: 'web_app',
      text: '🌟 Open BeautyVote',
      web_app: { url: WEB_APP_URL },
    },
  });
  console.log(`   ✅ Menu button set → ${WEB_APP_URL}`);

  // Step 5: Set bot commands
  console.log('📋 Step 5/6: Setting bot commands...');
  await apiCall('setMyCommands', {
    commands: [
      { command: 'start', description: 'Open BeautyVote app' },
      { command: 'help', description: 'Show help and instructions' },
      { command: 'vote', description: 'Go to voting page' },
      { command: 'profile', description: 'View your profile' },
    ],
  });
  console.log('   ✅ Commands set: /start, /help, /vote, /profile');

  // Step 6: Get bot info
  console.log('📊 Step 6/6: Bot information...');
  console.log(`   Bot Name: ${me.result.first_name}`);
  console.log(`   Username: @${me.result.username}`);
  console.log(`   Bot ID: ${me.result.id}`);
  console.log(`   Web App URL: ${WEB_APP_URL}`);
  console.log(`   Can join groups: ${me.result.can_join_groups ? 'Yes' : 'No'}`);

  console.log('\n✅ Bot setup complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Next steps:');
  console.log('');
  console.log('1. Set a webhook for your production server:');
  console.log(`   curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"url": "https://your-domain.com/?XTransformPort=3010/webhook"}'`);
  console.log('');
  console.log('2. Or use long-polling mode (dev):');
  console.log('   bun run dev');
  console.log('');
  console.log('3. Test your bot on Telegram:');
  console.log(`   https://t.me/${me.result.username}`);
  console.log('');
  console.log('4. To set a webhook in development using ngrok:');
  console.log('   ngrok http 3010');
  console.log('   Then use the ngrok URL in the setWebhook command above.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

setup().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
