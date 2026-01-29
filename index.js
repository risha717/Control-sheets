const { Telegraf } = require('telegraf');
const fs = require('fs');

const BOT_TOKEN = '8006015641:AAHMiqhkmtvRmdLMN1Rbz2EnwsIrsGfH8qU';
const ADMIN_ID = 1858324638;
const CHANNEL_ID = -1003872857468;
const FORCE_JOIN = '@Cinaflixsteem';

const bot = new Telegraf(BOT_TOKEN);

// load data
let db = {};
if (fs.existsSync('./data.json')) {
  db = JSON.parse(fs.readFileSync('./data.json'));
}

// save data
function saveDB() {
  fs.writeFileSync('./data.json', JSON.stringify(db, null, 2));
}

// generate shortcode
function generateCode() {
  return 'CFX' + Math.floor(1000 + Math.random() * 9000);
}

// Detect channel videos
bot.on('channel_post', async (ctx) => {
  const msg = ctx.channelPost;

  if (!msg.video && !msg.document) return;

  const code = generateCode();

  db[code] = {
    channel_id: CHANNEL_ID,
    message_id: msg.message_id
  };

  saveDB();

  await bot.telegram.sendMessage(
    ADMIN_ID,
    `🎬 New Video Added\n\n🔗 Shortcode: ${code}\n📌 Message ID: ${msg.message_id}`
  );
});

// Start command
bot.start(async (ctx) => {
  const code = ctx.startPayload;
  if (!code || !db[code]) {
    return ctx.reply('❌ Invalid or expired link');
  }

  try {
    const member = await ctx.telegram.getChatMember(
      FORCE_JOIN,
      ctx.from.id
    );

    if (member.status === 'left') {
      return ctx.reply(
        '🔒 আগে আমাদের চ্যানেল জয়েন করুন\n\nতারপর আবার লিংকে ক্লিক করুন 👇',
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '📢 Join Channel', url: `https://t.me/${FORCE_JOIN.replace('@','')}` }
            ]]
          }
        }
      );
    }

    const data = db[code];

    await ctx.telegram.copyMessage(
      ctx.chat.id,
      data.channel_id,
      data.message_id
    );

  } catch (e) {
    ctx.reply('⚠️ কিছু সমস্যা হয়েছে, পরে চেষ্টা করুন');
  }
});

bot.launch();
console.log('Cineflix Bot Running...');
