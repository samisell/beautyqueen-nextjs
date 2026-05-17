# BeautyVote Telegram Bot Documentation

## Overview

The BeautyVote Telegram Bot is a lightweight HTTP server that integrates Telegram with the BeautyVote web application. It handles user interactions in Telegram and directs them to the web app for authentication and core functionality.

## Features

- Receives webhook calls from Telegram
- Handles `/start`, `/help`, `/vote`, and `/profile` commands
- Sends messages with "Open App" buttons that link to the web app
- Configurable menu button for persistent access to the web app
- Does NOT handle authentication - that's done by the Next.js app via initData validation

## Architecture

```
Telegram User → Telegram Bot (webhook) → Telegram Bot Server → Web App
                                    ↓
                            Authentication Service (/api/auth/telegram)
```

## Files

- `index.ts` - Main bot server (HTTP server + webhook handler)
- `setup.ts` - Bot configuration script
- `package.json` - Dependencies and scripts

## Environment Variables

Required in `.env` file:
- `TELEGRAM_BOT_TOKEN` - Authentication bot token from @BotFather
- `TELEGRAM_WEB_APP_URL` - URL of your BeautyVote app (used for web app buttons)
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` - Bot username for display purposes
- `TELEGRAM_SUPPORT_BOT_TOKEN` - Separate bot token for support notifications
- `TELEGRAM_ADMIN_CHAT_ID` - Your Telegram ID for receiving support notifications

## Setup

### Initial Configuration

1. Create a bot via @BotFather on Telegram
2. Copy the bot token
3. Add to your `.env` file:
   ```
   TELEGRAM_BOT_TOKEN=your_token_here
   TELEGRAM_WEB_APP_URL=https://your-domain.com
   NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
   ```

4. Run the setup script:
   ```bash
   cd mini-services/telegram-bot
   node setup.ts
   ```

### What the Setup Script Does

1. Verifies the bot token works by calling `getMe`
2. Sets the bot's description and short description
3. Configures the menu button (always visible at bottom of chat) to open the web app
4. Sets bot commands: `/start`, `/help`, `/vote`, `/profile`
5. Displays bot information and next steps

## Webhook Configuration

### Production Server

Set a webhook pointing to your production server:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhook"}'
```

### Development

For local development, you can:
1. Use long-polling mode: `node index.ts` (or `bun run start`)
2. Or use a tunneling service like ngrok:
   ```bash
   ngrok http 3010
   ```
   Then use the ngrok URL in the setWebhook command.

## Bot Commands

- `/start` - Welcome message with "Open App" button
- `/help` - Shows help and instructions
- `/vote` - Prompts user to open the app to vote
- `/profile` - Sends a button to open the user's profile page

## Message Handling

When a user sends any message to the bot:
- If it's a recognized command (`/start`, `/help`, etc.), the corresponding handler is called
- For any other message, the bot responds with a prompt to open the app

## Web App Integration

The Telegram bot does NOT handle authentication. Instead:

1. When user clicks "Open App" button, Telegram opens your web app
2. The web app detects it's running in Telegram WebApp via `window.Telegram.WebApp`
3. It reads `initData` from `window.Telegram.WebApp.initData`
4. The `useTelegram` hook validates this data by sending it to `/api/auth/telegram`
5. Authentication service validates the cryptographic signature using your bot token
6. On success, user is logged in (existing) or auto-registered (new)
7. App sets authentication cookies and redirects user

## Support System Notes

The repository includes configuration for a separate Telegram support bot:
- `TELEGRAM_SUPPORT_BOT_TOKEN` - Token for support notifications bot
- `TELEGRAM_ADMIN_CHAT_ID` - Your Telegram ID to receive notifications

However, the actual implementation of the Telegram support chat functionality is not present in the current codebase. What exists is:
- A ticket-based support system in the web app (`/support` page)
- Form validation, file uploads, and ticket tracking
- Configured tokens for potential Telegram support integration

To implement actual Telegram ↔ user chat functionality, additional work would be needed to:
1. Create a listener service for the support bot
2. Forward messages between users and admins via Telegram
3. Store conversation history in the database
4. Build admin interface for managing support conversations

## Testing

### Manual Testing Flow

1. Ensure your Next.js dev server is running (`bun run dev`)
2. Ensure your Cloudflare tunnel (or equivalent) is forwarding to your dev server
3. Open Telegram and chat with your bot (`@beautyqueenwin_bot`)
4. Press `/start` or click the menu button
5. Verify you receive a welcome message with an "Open App" button
6. Click "Open App" - this should open your web app in Telegram's built-in browser
7. Verify the web app loads and automatically authenticates you
8. Check that you're redirected to the dashboard (or appropriate page)

### Testing Authentication Endpoint Directly

You can test the authentication endpoint without Telegram:
```bash
curl -X POST https://your-web-app-url.com/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData":"query_id=AAG...&user=%7B%22id%22%3A123456%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1715900000&hash=abc123..."}'
```

Replace the `initData` value with a valid Telegram initData string (URL-encoded).

## Troubleshooting

### Bot Not Responding

1. Verify the bot is running: `ps aux | grep index.ts`
2. Check if port 3010 is accessible: `curl http://localhost:3010/health`
3. Check logs for errors
4. Verify webhook is set correctly: `curl https://api.telegram.org/bot<token>/getWebhookInfo`

### Web App Not Opening

1. Verify `TELEGRAM_WEB_APP_URL` is correct in `.env`
2. Re-run setup script after changing the URL
3. Check that your web app is accessible at that URL
4. Verify the menu button shows the correct URL in Telegram

### Authentication Failing

1. Verify `TELEGRAM_BOT_TOKEN` matches between bot server and Next.js app
2. Check that the Next.js app is validating initData correctly
3. Look at server logs for authentication errors
4. Ensure the bot token used in validation matches the one used to set up the bot

## Security Considerations

- The bot token should be kept secret and never exposed in client-side code
- Webhook URLs should use HTTPS in production
- Rate limiting is implemented in the authentication endpoint (15 requests/min/IP)
- Input validation is performed on all incoming data
- The bot does not handle sensitive user data - authentication is delegated to the Next.js app

## Dependencies

- Node.js (v18+ recommended)
- dotenv (for loading environment variables)
- node-fetch (built-in in Node.js v18+)

## Development

To run the bot in development mode:
```bash
cd mini-services/telegram-bot
node index.ts
```

Or with automatic restart (if using bun):
```bash
bun run dev
```

## Deployment

For production deployment:
1. Ensure environment variables are properly set
2. Set up a process manager (PM2, systemd, etc.) to keep the bot running
3. Configure webhook to point to your production domain
4. Monitor logs for errors
5. Set up automatic restart on failure

## Contact

For questions or issues, refer to the BeautyVote project documentation or contact the development team.