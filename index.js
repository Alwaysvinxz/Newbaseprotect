const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ==== CONFIG ====
const botToken = '8448177949:AAFdre3QcEuPKztlMjOOu5nu0TA7BVoIoT8';
const adminId = '5375187784';
const github = {
  token: 'https://raw.githubusercontent.com/Alwaysvinxz/Newbaseprotect/refs/heads/main/token.json',
  repoOwner: 'Alwaysvinxz',
  repoName: 'akun',
  akunPath: 'akun.json',
  tokenPath: 'token.json'
};

// ==== INIT BOT ====
const bot = new Telegraf(botToken);

// ==== ROLE FILE ====
const roleFile = path.join(__dirname, 'admin.json');
if (!fs.existsSync(roleFile)) fs.writeFileSync(roleFile, JSON.stringify({ owners: [], moderators: [], resellers: [] }, null, 2));
function loadRoles() { return JSON.parse(fs.readFileSync(roleFile)); }
function saveRoles(data) { fs.writeFileSync(roleFile, JSON.stringify(data, null, 2)); }
function isAdmin(id) { return id.toString() === adminId.toString(); }
function isModerator(id) { const { moderators } = loadRoles(); return moderators.includes(id.toString()) || isAdmin(id); }
function isOwner(id) { const { owners } = loadRoles(); return owners.includes(id.toString()) || isModerator(id); }
function isReseller(id) { const { resellers } = loadRoles(); return resellers.includes(id.toString()) || isOwner(id); }
function addRole(type, id) { const roles = loadRoles(); if (!roles[type].includes(id)) { roles[type].push(id); saveRoles(roles); } }
function removeRole(type, id) { const roles = loadRoles(); roles[type] = roles[type].filter(i => i !== id); saveRoles(roles); }

// ==== GITHUB HANDLER ====
const headers = {
  Authorization: `Bearer ${github.token}`, // ✅ FIXED: pakai Bearer, bukan token
  Accept: 'application/vnd.github.v3+json'
};

async function getGitHubContent(filePath) {
  try {
    const { data } = await axios.get(
      `https://api.github.com/repos/${github.repoOwner}/${github.repoName}/contents/${filePath}`,
      { headers }
    );
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return { content: JSON.parse(content), sha: data.sha };
  } catch (err) {
    console.error("❌ GITHUB ERROR:", err.response?.data || err.message);
    if (err.response?.status === 404) return { content: [], sha: null };
    throw new Error("Gagal mengambil data dari GitHub.");
  }
}

async function updateGitHubContent(filePath, newContent, sha) {
  const payload = {
    message: `Update file ${filePath}`,
    content: Buffer.from(JSON.stringify(newContent, null, 2)).toString('base64'),
    sha: sha || undefined
  };
  await axios.put(
    `https://api.github.com/repos/${github.repoOwner}/${github.repoName}/contents/${filePath}`,
    payload,
    { headers }
  );
}

// ==== Akun Handler ====
async function addAkun(username, password) {
  const { content, sha } = await getGitHubContent(github.akunPath);
  const exist = content.find(u => u.username === username);
  if (exist) throw new Error("Username sudah terdaftar.");
  content.push({ username, password });
  await updateGitHubContent(github.akunPath, content, sha);
}

async function deleteAkun(username) {
  const { content, sha } = await getGitHubContent(github.akunPath);
  const filtered = content.filter(u => u.username !== username);
  if (filtered.length === content.length) throw new Error("Username tidak ditemukan.");
  await updateGitHubContent(github.akunPath, filtered, sha);
}

// ==== Token Handler ====
async function addToken(token) {
  const { content, sha } = await getGitHubContent(github.tokenPath);

  // Validasi bentuk objek
  if (!content.tokens || !Array.isArray(content.tokens)) {
    throw new Error("Format token.json tidak valid (harus ada 'tokens' array)");
  }

  if (content.tokens.includes(token)) throw new Error("Token sudah ada.");
  content.tokens.push(token);
  await updateGitHubContent(github.tokenPath, content, sha);
}

async function deleteToken(token) {
  const { content, sha } = await getGitHubContent(github.tokenPath);

  if (!content.tokens || !Array.isArray(content.tokens)) {
    throw new Error("Format token.json tidak valid.");
  }

  const filtered = content.tokens.filter(t => t !== token);
  if (filtered.length === content.tokens.length) throw new Error("Token tidak ditemukan.");
  content.tokens = filtered;

  await updateGitHubContent(github.tokenPath, content, sha);
}


bot.start(async (ctx) => {
  try {
    await ctx.replyWithPhoto(
      { url: 'https://files.catbox.moe/mym1k1.jpg' },
      {
        caption: `
\`\`\`
( 🍁 ) - 情報 𝗢𝗹𝗮𝗮 Welcome!
Этот бот готов помочь вам в WhatsApp и Telegram.
Быстрая, гибкая и безопасная автоматизация у вас под рукой.

┏━━⪼「ɪɴғᴏʀᴍᴀᴛɪᴏɴ」⪻━━
┃ 𖥂 𝙰𝚞𝚝𝚑𝚘𝚛 𝚂𝚌𝚛𝚒𝚙𝚝 : @Vinzzblaster
┃ 𖥂 𝙱𝚘𝚝𝙽𝚊𝚖𝚎 : 𝙿𝚛𝚘𝚝𝚎𝚌𝚝 𝙴𝚕𝚞𝚌𝚊𝚝𝚒𝚘𝚗
┃ 𖥂 𝚅𝚎𝚛𝚜𝚒𝚘𝚗 𝙱𝚘𝚝𝚜 : 𝟸.𝟸 
┗━━━━━━━━━━━━━━⪼

┏━━⪼「𝘼𝙇𝙇𝘽𝙐𝙔𝙔𝙀𝙍 & 𝙋𝙏 & 𝙈𝘿𝙍𝙏」⪻━━
┃𖥂 /addreseller <id>
┃𖥂 /delreseller <id>
┃𖥂 /addpt <id>
┃𖥂 /delpt <id>
┃𖥂 /addmoderator <id>
┃𖥂 /delmoderator <id>
┗━━━━━━━━━━━━━━▣

┏━━⪼「𝙊𝙉𝙇𝙔 𝘿𝙀𝙑𝙇𝙊𝙑𝙀𝙍」⪻━━
┃𖥂 /listakun → Lihat daftar akun
┃𖥂 /addakun → Tambah akun baru
┃𖥂 /delakun → Hapus akun
┃𖥂 /addtoken → Tambah token baru
┃𖥂 /deltoken → Hapus token
┃𖥂 /listtoken → Lihat token
┃𖥂 /connect → Tambahkan sender
┃𖥂 /delsender → Menghapus sender
┃𖥂 /listsender → List sender on
┃𖥂 /ProtectX → Perpanjang
┗━━━━━━━━━━━━━━▣ 
\`\`\`
`,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.url('DEVELOPER🕊️', 'https://t.me/Vinzzblasternew'),
        ]),
      }
    );
  } catch (err) {
    console.error(err);
  }
});

// ==== Sender Commands ====
bot.command("connect", async (ctx) => {
  const userId = ctx.from.id.toString();
  if (!isOwner(userId)) return ctx.reply("Hanya owner yang bisa menambahkan sender.");
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return await ctx.reply("Masukkan nomor WA: `/connect 62xxxx`", { parse_mode: "MarkdownV2" });
  }

  const BotNumber = args[1];
  await ctx.reply(`⏳ Memulai pairing ke nomor ${BotNumber}...`);
  await connectToWhatsApp(BotNumber, ctx.chat.id, ctx);
});

bot.command("listsender", (ctx) => {
  if (sessions.size === 0) return ctx.reply("Tidak ada sender aktif.");
  const list = [...sessions.keys()].map(n => `• ${n}`).join("\n");
  ctx.reply(`*Daftar Sender Aktif:*\n${list}`, { parse_mode: "MarkdownV2" });
});

bot.command("delsender", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Contoh: /delsender 628xxxx");

  const number = args[1];
  if (!sessions.has(number)) return ctx.reply("Sender tidak ditemukan.");

  try {
    const sessionDir = sessionPath(number);
    sessions.get(number).end();
    sessions.delete(number);
    fs.rmSync(sessionDir, { recursive: true, force: true });

    const data = JSON.parse(fs.readFileSync(file_session));
    const updated = data.filter(n => n !== number);
    fs.writeFileSync(file_session, JSON.stringify(updated));

    ctx.reply(`Sender ${number} berhasil dihapus.`);
  } catch (err) {
    console.error(err);

  }
});


// Perpanjang masa aktiff
bot.command("ProtectX", (ctx) => {
  const userId = ctx.from.id;
  if (!isReseller(userId) && !isAdmin(userId) && !isOwner(userId)) {
    return ctx.reply("❌ Hanya Reseller/Admin yang bisa memperpanjang masa aktif.");
  }

  const args = ctx.message.text.split(" ");
  if (args.length !== 3) return ctx.reply("Format: /ProtectX Username Durasi");

  const [_, username, durasi] = args;
  const days = parseInt(durasi);
  if (isNaN(days) || days <= 0) return ctx.reply("❌ Durasi harus berupa angka lebih dari 0.");

  const users = getUsers();
  const index = users.findIndex(u => u.username === username);
  if (index === -1) return ctx.reply("❌ Username tidak ditemukan.");
  if (users[index].role === "admin") return ctx.reply("⛔ Tidak bisa memperpanjang masa aktif untuk user role admin.");

  const now = Date.now();
  const base = users[index].expired > now ? users[index].expired : now;
  users[index].expired = base + (days * 86400000);

  saveUsers(users);
  ctx.reply(`✅ Masa aktif *${username}* berhasil diperpanjang hingga ${new Date(users[index].expired).toLocaleString("id-ID")}`, { parse_mode: "MarkdownV2" });
});


// ==== Token Commands ====
bot.command('addtoken', async (ctx) => {
  if (!isReseller(ctx.from.id)) return ctx.reply("❌ Akses ditolak.");
  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply("Format: /addtoken [token]");
  try {
    await addToken(args[1]);
    ctx.reply(`✅ Token ditambahkan: ${args[1]}`);
  } catch (err) {
    ctx.reply("⚠️ " + err.message);
  }
});

bot.command('deltoken', async (ctx) => {
  if (!isReseller(ctx.from.id)) return ctx.reply("❌ Akses ditolak.");
  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply("Format: /deltoken [token]");
  try {
    await deleteToken(args[1]);
    ctx.reply(`🗑️ Token dihapus: ${args[1]}`);
  } catch (err) {
    ctx.reply("⚠️ " + err.message);
  }
});

bot.command('listtoken', async (ctx) => {
  if (!isModerator(ctx.from.id)) return ctx.reply("❌ Akses ditolak.");
  try {
    const { content } = await getGitHubContent(github.tokenPath);
    if (!content.tokens || !content.tokens.length) return ctx.reply("📭 Tidak ada token.");
    const msg = content.tokens.map((t, i) => `${i + 1}. ${t}`).join('\n');
    ctx.reply("📋 Daftar Token:\n" + msg);
  } catch (err) {
    console.error("❌ listtoken error:", err.message);
    ctx.reply("⚠️ Gagal mengambil token.");
  }
});


// ==== Akun Commands ====
bot.command('addakun', async (ctx) => {
  if (!isReseller(ctx.from.id)) return ctx.reply("❌ Akses ditolak.");
  const args = ctx.message.text.split(' ');
  if (args.length < 3) return ctx.reply("Format: /addakun [username] [password]");
  try {
    await addAkun(args[1], args[2]);
    ctx.reply("✅ Akun ditambahkan.");
  } catch (err) {
    ctx.reply("⚠️ " + err.message);
  }
});

bot.command('delakun', async (ctx) => {
  if (!isReseller(ctx.from.id)) return ctx.reply("❌ Akses ditolak.");
  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply("Format: /delakun [username]");
  try {
    await deleteAkun(args[1]);
    ctx.reply("✅ Akun dihapus.");
  } catch (err) {
    ctx.reply("⚠️ " + err.message);
  }
});

bot.command('listakun', async (ctx) => {
  if (!isModerator(ctx.from.id)) return ctx.reply("❌ Akses ditolak.");
  try {
    const { content } = await getGitHubContent(github.akunPath);
    if (!content.length) return ctx.reply("📭 Tidak ada akun.");
    const msg = content.map((u, i) => `${i + 1}. Username: ${u.username}`).join('\n');
    ctx.reply("📋 Daftar Akun:\n" + msg);
  } catch {
    ctx.reply("⚠️ Gagal mengambil data akun.");
  }
});

// ==== Role Commands ====
bot.command('addreseller', (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Akses ditolak.");
  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply("Format: /addreseller [id]");
  addRole('resellers', args[1]);
  ctx.reply("✅ Reseller ditambahkan.");
});

bot.command('delreseller', (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Akses ditolak.");
  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply("Format: /delreseller [id]");
  removeRole('resellers', args[1]);
  ctx.reply("✅ Reseller dihapus.");
});

bot.command('addpt', (ctx) => {
  if (!isModerator(ctx.from.id)) return ctx.reply("❌ Akses ditolak.");
  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply("Format: /addpt [id]");
  addRole('owners', args[1]);
  ctx.reply("✅ Owner ditambahkan.");
});

bot.command('delpt', (ctx) => {
  if (!isModerator(ctx.from.id)) return ctx.reply("❌ Akses ditolak.");
  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply("Format: /delpt [id]");
  removeRole('owners', args[1]);
  ctx.reply("✅ Owner dihapus.");
});

bot.command('addmoderator', (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("❌ Akses hanya untuk admin.");
  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply("Format: /addmoderator [id]");
  addRole('moderators', args[1]);
  ctx.reply("✅ Moderator ditambahkan.");
});

bot.command('delmoderator', (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("❌ Akses hanya untuk admin.");
  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply("Format: /delmoderator [id]");
  removeRole('moderators', args[1]);
  ctx.reply("✅ Moderator dihapus.");
});

// ==== Launch Bot ====
bot.launch();
console.log("🤖 Bot Telegram Gabungan Berjalan...");
