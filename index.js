const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: './data/database.sqlite' });

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

// ✅ Web server for uptime
app.get('/', (req, res) => {
  res.status(200).send('✅ Bot is online!');
});

app.listen(3000, () => {
  console.log('🌐 Web server running on port 3000');
});

// ✅ Discord bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ✅ Neon subscription role and rewards
const neonRoleId = '1380520610475802645';
const roleLevel1to5 = '1385676687097725100';
const roleLevel6to10 = '1385677094356254720';

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  // !neon info command
  if (message.content === '!neon info') {
    return message.reply(`✨ **NEON SUBSCRIPTION INFO** ✨

💰 **Price:** ₹20 only!

🛡️ **Perks:**
• Booster Role (+300% Arcane XP)
• 5000 Arcane XP instantly
• Neon level system access
• Exclusive news & discounts
• Premium bot features

DM an admin to subscribe!`);
  }

  // !neon level command
  if (message.content === '!neon level' || message.content === '!Neon level') {
    if (message.member?.roles?.cache?.has(neonRoleId)) {
      const level = (await db.get(`level_${userId}`)) || 1;
      const xp = (await db.get(`xp_${userId}`)) || 0;
      return message.reply(`🧪 You're level ${level} with ${xp} XP.`);
    } else {
      return message.reply('⚠️ You are not subscribed to **Neon**. Please subscribe to gain access to XP and level features.');
    }
  }

  // XP gain only for Neon members
  if (!message.member?.roles?.cache?.has(neonRoleId)) return;

  const xpGained = Math.floor(Math.random() * 10) + 5;
  const currentXP = (await db.get(`xp_${userId}`)) || 0;
  const newXP = currentXP + xpGained;
  await db.set(`xp_${userId}`, newXP);

  const currentLevel = (await db.get(`level_${userId}`)) || 1;
  const neededXP = currentLevel * 100;

  if (newXP >= neededXP) {
    const newLevel = currentLevel + 1;
    await db.set(`level_${userId}`, newLevel);
    await db.set(`xp_${userId}`, 0);
    message.channel.send(`🎉 GG <@${userId}>, you reached level ${newLevel}!`);

    // Role rewards
    const member = message.member;
    if (newLevel >= 1 && newLevel <= 5) {
      await member.roles.add(roleLevel1to5).catch(console.error);
      await member.roles.remove(roleLevel6to10).catch(() => {});
    }

    if (newLevel >= 6 && newLevel <= 10) {
      await member.roles.add(roleLevel6to10).catch(console.error);
      await member.roles.remove(roleLevel1to5).catch(() => {});
    }
  }
});

client.login(process.env.TOKEN);
