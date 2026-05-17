// ─────────────────────────────────────────────────────────────────────────────
// BeautyVote Chat Support Bot — Setup Script
// ─────────────────────────────────────────────────────────────────────────────
// Run this script to configure your Telegram support bot:
//   cd mini-services/chat-service && bun run setup
//
// Prerequisites:
//   - TELEGRAM_SUPPORT_BOT_TOKEN in .env (get from @BotFather)
//   - TELEGRAM_ADMIN_CHAT_ID in .env (your Telegram user/chat ID)
//
// Steps:
//   1. Create a NEW bot via @BotFather (separate from the auth bot!)
//   2. Send /start to the new bot in Telegram
//   3. Visit https://api.telegram.org/bot<TOKEN>/getUpdates
//      to find your chat_id in the response
//   4. Add both values to .env
//   5. Run this script
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config({ path: '.env' });

const BOT_TOKEN = process.env.TELEGRAM_SUPPORT_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_SUPPORT_BOT_TOKEN is not set.');
  console.error('');
  console.error('Steps:');
  console.error('   1. Open Telegram and search for @BotFather');
  console.error('   2. Send /newbot and follow the prompts');
  console.error('   3. Copy the bot token');
  console.error('   4. Add TELEGRAM_SUPPORT_BOT_TOKEN=your_token to .env');
  process.exit(1);
}

if (!ADMIN_CHAT_ID) {
  console.error('❌ TELEGRAM_ADMIN_CHAT_ID is not set.');
  console.error('');
  console.error('Steps to find your Chat ID:');
  console.error('   1. Send /start to your new support bot in Telegram');
  console.error('   2. Visit this URL in your browser:');
  console.error(`      https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
  console.error('   3. Look for "chat":{"id": 123456789} in the response');
  console.error('   4. Add TELEGRAM_ADMIN_CHAT_ID=123456789 to .env');
  process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function apiCall(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return await res.json();
}

async function setup() {
  console.log('🚀 Setting up BeautyVote Support Bot...\n');

  // Step 1: Verify bot token
  console.log('📡 Step 1/4: Verifying bot token...');
  const me = await apiCall('getMe', {});
  if (!me.ok) {
    console.error('   ❌ Invalid bot token.');
    process.exit(1);
  }
  console.log(`   ✅ Bot: @${me.result.username} (${me.result.first_name})`);

  // Step 2: Set bot description
  console.log('📝 Step 2/4: Setting bot description...');
  await apiCall('setMyDescription', {
    description:
      'BeautyVote Live Support Bot\n\n' +
      'This bot receives support messages from BeautyVote users. ' +
      'When a user sends a message via the chat widget on the website, ' +
      'it appears here. Simply reply to the message to respond to that user. ' +
      'If you send a new message without replying, it goes to the last active user.',
  });
  console.log('   ✅ Description set');

  // Step 3: Verify admin can receive messages
  console.log('👤 Step 3/4: Verifying admin chat...');
  const testMsg = await apiCall('sendMessage', {
    chat_id: Number(ADMIN_CHAT_ID),
    text: '✅ <b>BeautyVote Support Bot Connected!</b>\n\n' +
      'You will receive chat messages from website users here.\n\n' +
      '💡 <b>How to reply:</b>\n' +
      '• Reply to a specific message to respond to that user\n' +
      '• Send a new message to reply to the last active user\n' +
      '• Each message shows the user\'s name, email, and session ID',
    parse_mode: 'HTML',
  });
  if (!testMsg.ok) {
    console.error(`   ❌ Failed to send test message: ${testMsg.description}`);
    console.error('   Make sure you have started a conversation with the bot first.');
    process.exit(1);
  }
  console.log(`   ✅ Test message sent to admin (chat_id: ${ADMIN_CHAT_ID})`);

  // Step 4: Summary
  console.log('📊 Step 4/4: Summary');
  console.log(`   Bot Name: ${me.result.first_name}`);
  console.log(`   Bot Username: @${me.result.username}`);
  console.log(`   Admin Chat ID: ${ADMIN_CHAT_ID}`);

  console.log('\n✅ Support bot setup complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Next steps:');
  console.log('');
  console.log('1. Start the chat service:');
  console.log('   cd mini-services/chat-service && bun run dev');
  console.log('');
  console.log('2. Set the webhook for production:');
  console.log(`   curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"url": "https://your-domain.com/?XTransformPort=3011/telegram-webhook", "allowed_updates": ["message"]}'`);
  console.log('');
  console.log('3. For development with ngrok:');
  console.log('   ngrok http 3011');
  console.log('   Then use the ngrok HTTPS URL in the setWebhook command.');
  console.log('');
  console.log('4. Check webhook status:');
  console.log(`   https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

setup().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
