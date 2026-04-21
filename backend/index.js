const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const https = require('https');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to Nation Trends MongoDB Atlas'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- NODEMAILER TRANSPORTER ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify Transporter
transporter.verify((error, success) => {
  if (error) {
    console.log('--- NODEMAILER BUREAU ERROR ---');
    console.log(error);
    console.log('-------------------------------');
  } else {
    console.log('Nodemailer Bureau is operational and ready to transmit.');
  }
});

// --- EMAIL TEMPLATES ---
const getPremiumTemplate = (title, content, type = 'notification') => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nation Trends India</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="padding: 40px 0 30px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- LOGO HEADER -->
                    <tr>
                        <td align="center" style="padding: 30px 0 30px 0; border-bottom: 1px solid #eeeeee;">
                            <img src="https://nation-trends-india.vercel.app/nt-favicon.png" alt="Nation Trends India" width="80" style="display: block; border-radius: 8px;" />
                            <h1 style="margin: 15px 0 0 0; color: #1a365d; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">NATION TRENDS <span style="color: #e53e3e;">INDIA</span></h1>
                            <p style="margin: 5px 0 0 0; color: #718096; font-size: 9px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase;">Stay Informed, Stay Ahead</p>
                        </td>
                    </tr>
                    <!-- MAIN CONTENT -->
                    <tr>
                        <td style="padding: 40px 30px 40px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #2d3748; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase; padding-bottom: 25px;">
                                        ${title}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; padding-bottom: 30px;">
                                        ${content}
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" style="border-radius: 4px;" bgcolor="#1a365d">
                                                    <a href="https://nation-trends-india.vercel.app/" style="font-size: 12px; font-weight: 800; font-family: sans-serif; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 4px; display: inline-block; text-transform: uppercase; letter-spacing: 2px;">Visit Our Website</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- FOOTER -->
                    <tr>
                        <td style="background-color: #1a365d; padding: 40px 30px 40px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 20px;">
                                        &copy; 2026 Nation Trends India &bull; All Rights Reserved
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="color: #a0aec0; font-size: 10px; font-weight: 400; line-height: 1.5;">
                                        You are receiving this email because you are a part of our news community. <br/>
                                        Surat, Gujarat, India 395006
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// --- SCHEMAS ---

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  subheadline: String,
  category: String,
  image: String,
  imageCaption: String,
  multipleImages: [String],
  date: String,
  author: String,
  status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
  placement: { type: String, enum: ['Standard', 'Featured', 'Breaking'], default: 'Standard' },
  views: { type: Number, default: 0 },
  excerpt: String,
  content: [mongoose.Schema.Types.Mixed], // Array for structured sections
  tags: [String],
  readingTime: String,
  metaTitle: String,
  metaDescription: String,
  sourceUrl: String
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

const subscriberSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  emailSent: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

const settingsSchema = new mongoose.Schema({
  title: String,
  tagline: String,
  email: String,
  phone: String,
  address: String,
  foundedYear: String,
  audienceCount: String,
  breakingNews: String,
  siteVisits: { type: Number, default: 0 }
});

const Settings = mongoose.model('Settings', settingsSchema);

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isBlocked: { type: Boolean, default: false },
  savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// --- ROUTES ---

// Articles
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/articles', async (req, res) => {
  try {
    const { title, excerpt, content } = req.body;
    if (!title) return res.status(400).json({ error: 'Headline is required to broadcast news.' });

    const newArticle = new Article(req.body);
    const saved = await newArticle.save();
    
    // BROADCAST TO SUBSCRIBERS
    try {
      const activeSubs = await Subscriber.find({ isBlocked: false });
      if (activeSubs.length > 0) {
        console.log(`Broadcasting new article to ${activeSubs.length} intelligence recipients...`);
        
        const newsAlertTemplate = (article) => `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #0f172a; padding: 20px 10px; text-align: center;">
              <img src="https://nation-trends-india.vercel.app/nt-favicon.png" width="40" style="margin-bottom: 10px;" />
              <span style="color: #E53E3E; font-size: 9px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; display: block; margin-bottom: 5px;">BREAKING NEWS</span>
              <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">NATION TRENDS INDIA</h1>
            </div>
            <div style="position: relative; width: 100%; height: 250px; overflow: hidden;">
               <img src="${article.image}" alt="${article.title}" style="width: 100%; height: 100%; object-cover: center; display: block;" />
               <div style="position: absolute; bottom: 0; left: 0; background: #E53E3E; color: #ffffff; padding: 10px 20px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">${article.category}</div>
            </div>
            <div style="padding: 40px 30px; color: #0f172a; line-height: 1.6;">
              <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 20px; color: #0f172a; text-transform: uppercase; letter-spacing: -0.5px; font-style: italic;">${article.title}</h2>
              <p style="font-size: 16px; color: #475569; font-weight: 500; font-style: italic; margin-bottom: 30px;">"${article.excerpt}"</p>
              <div style="margin-top: 40px; text-align: center;">
                <a href="https://nation-trends-india.vercel.app/article/${article.slug}" style="display: inline-block; background-color: #E53E3E; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 4px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">Read Full News</a>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">&copy; 2026 Nation Trends India</p>
            </div>
          </div>
        `;

        // Send emails in background
        activeSubs.forEach(async (sub) => {
          try {
            await transporter.sendMail({
              from: `"Nation Trends India" <${process.env.EMAIL_USER}>`,
              to: sub.email,
              subject: `[LIVE UPDATE] ${saved.title}`,
              html: newsAlertTemplate(saved)
            });
          } catch (e) {
             console.error(`Failed to notify ${sub.email}:`, e.message);
          }
        });
      }
    } catch (broadcastErr) {
      console.error('Newsletter Broadcast Error:', broadcastErr);
    }

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/articles/:id', async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/articles/:id', async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/articles/views/:slug', async (req, res) => {
  try {
    const art = await Article.findOneAndUpdate({ slug: req.params.slug }, { $inc: { views: 1 } }, { new: true });
    res.json(art);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settings & Breaking News
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        title: 'Nation Trends India',
        tagline: 'THE PULSE OF A NEW INDIA',
        email: 'jatin2005@gmail.com',
        phone: '1111111111',
        address: 'Surat, Gujarat, India 395006',
        foundedYear: '2026',
        audienceCount: '100+',
        breakingNews: 'Breaking: Major political shifts expected in upcoming state polls.'
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Messages
app.get('/api/messages', async (req, res) => {
  try {
    const msgs = await Message.find().sort({ date: -1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const msg = new Message(req.body);
    await msg.save();

    // Send Email to Admin
    const emailContent = `
      <p>A new message has been received from your website:</p>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px;"><strong>Name:</strong> ${msg.name}</p>
        <p style="margin: 0 0 10px;"><strong>Email:</strong> ${msg.email}</p>
        <p style="margin: 0 0 10px;"><strong>Subject:</strong> ${msg.subject}</p>
        <p style="margin: 20px 0 0;"><strong>Message:</strong></p>
        <p style="margin: 10px 0 0; font-style: italic; color: #334155;">"${msg.message}"</p>
      </div>
      <p>You can reply to this user from your admin dashboard.</p>
    `;

    console.log(`Attempting to transmit Message from ${msg.email}...`);
    const info = await transporter.sendMail({
      from: `"Nation Trends India" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `[New Contact Message] ${msg.subject}`,
      html: getPremiumTemplate('New Website Message', emailContent)
    });
    console.log('Transmission Successful. Message ID:', info.messageId);

    res.json(msg);
  } catch (err) {
    console.error('CRITICAL TRANSMISSION FAILURE:', err);
    res.status(500).json({ error: 'Bureau transmission failed. Internal error.' });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subscribers
app.get('/api/subscribers', async (req, res) => {
  try {
    const subs = await Subscriber.find().sort({ date: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subscribers', async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await Subscriber.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Identity already enrolled in intelligence flow.' });

    const sub = new Subscriber(req.body);
    await sub.save();

    // Send Welcome Email to Subscriber
    const welcomeContent = `
      <p>Thank you for joining the <strong>Nation Trends India</strong> community!</p>
      <p>We are excited to have you with us. You will now receive the most important news updates directly in your inbox.</p>
      <p>Our team is working hard to bring you the best stories from politics, business, technology, and more.</p>
      <div style="margin: 30px 0; padding: 20px; border-left: 4px solid #E53E3E; background-color: #fffaf0;">
        <p style="margin: 0; font-weight: 700;">Status: Subscription Active</p>
        <p style="margin: 5px 0 0; font-size: 13px;">Email: ${email}</p>
      </div>
    `;

    try {
      console.log(`Attempting to enroll identity: ${email}...`);
      await transporter.sendMail({
        from: `"Nation Trends India" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to Nation Trends India',
        html: getPremiumTemplate('Thanks for joining us!', welcomeContent)
      });
      // CRITICAL: Update and fetch the latest document before sending response
      const updatedSub = await Subscriber.findOneAndUpdate({ email }, { emailSent: true }, { new: true });
      console.log('Welcome Email Dispatched.');

      // Notify Admin
      const adminNotif = `
        <p>A new civil identity has enrolled in the intelligence flow:</p>
        <p style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 20px 0;">${email}</p>
        <p>Total subscribers count continues to scale.</p>
      `;

      await transporter.sendMail({
        from: `"Nation Trends India" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: '[INTEL] New Subscriber Enrolled',
        html: getPremiumTemplate('New Enrollment', adminNotif)
      });

      return res.json(updatedSub);
    } catch (mailErr) {
      console.error('Mail delivery failed but subscriber saved:', mailErr);
      return res.json(sub);
    }
  } catch (err) {
    console.error('SUBSCRIBER ENROLLMENT FAILURE:', err);
    res.status(500).json({ error: 'Bureau enrollment failed. Internal error.' });
  }
});

app.patch('/api/subscribers/:id/block', async (req, res) => {
  try {
    const sub = await Subscriber.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Subscriber not found.' });
    sub.isBlocked = !sub.isBlocked;
    await sub.save();
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI News Pulse Generator
app.post('/api/ai/pulse', async (req, res) => {
  const narratives = [
    {
      title: "Parliamentary Special Session: Women's Reservation Bill Becomes Reality",
      category: "Politics",
      image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200",
      excerpt: "In a historic move, the Parliament of India has officially passed the long-awaited Women's Reservation Bill.",
      content: "The passage of the Women's Reservation Bill marks a seismic shift in the Indian political landscape. Prime Minister Narendra Modi characterized the legislation as a 'right, not a favor,' emphasizing the critical role of women in the nation's journey toward a 'Viksit Bharat'. The bill, which reserves 33% of seats in the Lok Sabha and State Legislative Assemblies for women, was met with overwhelming support, despite intense debates regarding the timing of delimitation. Analysts suggest this move will significantly impact the 2029 general elections, introducing a new generation of female leadership into the highest decision-making bodies of the country."
    },
    {
      title: "IPL 2026: RCB Clinches Thrilling Victory Over LSG at Chinnaswamy",
      category: "Sports",
      image: "https://images.unsplash.com/photo-1531415074941-6ef21368a594?auto=format&fit=crop&q=80&w=1200",
      excerpt: "Royal Challengers Bengaluru secured a 5-wicket win in a high-stakes encounter against Lucknow Super Giants.",
      content: "The M. Chinnaswamy Stadium erupted in joy as Royal Challengers Bengaluru (RCB) defeated Lucknow Super Giants (LSG) in a match that went down to the penultimate over. Chasing a formidable target of 192, Bengaluru's top order provided a solid foundation, while the middle-order fireworks secured the victory. This win propels RCB into the top four of the IPL 2026 points table, intensifying the race for the playoffs. Fans praised the team's resilience and the strategic depth shown in the death overs, marking this as a potential turning point in their campaign."
    },
    {
      title: "India Achieves Record $860 Billion Exports in Fiscal Year 2025-26",
      category: "Business",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200",
      excerpt: "Union Minister Piyush Goyal announces a landmark achievement in international trade figures.",
      content: "India has reached a historic milestone in its global trade journey, recording $860 billion in total exports for the 2025-26 fiscal year. This 15% year-on-year growth underscores the strengthening of the 'Make in India' initiative and the resilience of the Indian supply chain amidst global economic volatility. Sectoral performance was particularly strong in electronics, pharmaceuticals, and agricultural products. Economic experts believe that the continued focus on manufacturing hubs and trade agreements will likely push India toward the $1 trillion export target by 2030, further solidifying its position as a global economic powerhouse."
    }
  ];

  try {
    const selected = narratives[Math.floor(Math.random() * narratives.length)];
    const slug = selected.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();
    
    const newArticle = new Article({
      ...selected,
      slug,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: "AI News Pulse",
      views: Math.floor(Math.random() * 500) + 100
    });

    const saved = await newArticle.save();

    // BROADCAST TO SUBSCRIBERS
    try {
      const activeSubs = await Subscriber.find({ isBlocked: false });
      if (activeSubs.length > 0) {
        const newsAlertTemplate = (article) => `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #0f172a; padding: 20px 10px; text-align: center;">
              <img src="https://nation-trends-india.vercel.app/nt-favicon.png" width="40" style="margin-bottom: 10px;" />
              <span style="color: #E53E3E; font-size: 9px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; display: block; margin-bottom: 5px;">AI NEWS FLASH</span>
              <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">NATION TRENDS INDIA</h1>
            </div>
            <div style="position: relative; width: 100%; height: 250px; overflow: hidden;">
               <img src="${article.image}" alt="${article.title}" style="width: 100%; height: 100%; object-cover: center; display: block;" />
               <div style="position: absolute; bottom: 0; left: 0; background: #E53E3E; color: #ffffff; padding: 10px 20px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">${article.category}</div>
            </div>
            <div style="padding: 40px 30px; color: #0f172a; line-height: 1.6;">
              <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 20px; color: #0f172a; text-transform: uppercase; letter-spacing: -0.5px; font-style: italic;">${article.title}</h2>
              <p style="font-size: 16px; color: #475569; font-weight: 500; font-style: italic; margin-bottom: 30px;">"${article.excerpt}"</p>
              <div style="margin-top: 40px; text-align: center;">
                <a href="https://nation-trends-india.vercel.app/article/${article.slug}" style="display: inline-block; background-color: #E53E3E; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 4px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">Read Full News</a>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">&copy; 2026 Nation Trends India</p>
            </div>
          </div>
        `;

        activeSubs.forEach(async (sub) => {
          try {
            await transporter.sendMail({
              from: `"Nation Trends India" <${process.env.EMAIL_USER}>`,
              to: sub.email,
              subject: `[AI PULSE] ${saved.title}`,
              html: newsAlertTemplate(saved)
            });
          } catch (e) {
             console.error(`Failed to notify ${sub.email}:`, e.message);
          }
        });
      }
    } catch (err) {
      console.error('AI Broadcast Error:', err);
    }

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users & Auth
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Identity already registered.' });
    
    const user = new User({ name, email, password });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Invalid identification credentials.' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ error: 'Access Denied. Your identity has been restricted by the NTI Bureau.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/:id/save', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { articleId } = req.body;
    if (!user.savedArticles.includes(articleId)) {
        user.savedArticles.push(articleId);
        await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// External News Discovery Proxy (NewsAPI.org) using native HTTPS with Headers
app.get('/api/external-news', (req, res) => {
  const API_KEY = process.env.NEWS_API_KEY || '2582877960d740c087968593a1f185c8';
  const query = req.query.q || '';
  const endpoint = query 
    ? `/v2/everything?q=${encodeURIComponent(query)}&pageSize=6&apiKey=${API_KEY}`
    : `/v2/top-headlines?country=in&pageSize=6&apiKey=${API_KEY}`;
  
  const options = {
    hostname: 'newsapi.org',
    path: endpoint,
    headers: {
      'User-Agent': 'NationTrendsIndia/1.0'
    }
  };

  https.get(options, (apiRes) => {
    let rawData = '';
    apiRes.on('data', (chunk) => { rawData += chunk; });
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(rawData);
        
        if (apiRes.statusCode !== 200 || !parsed.articles) {
          // Return Robust Prestige Fallbacks
          return res.json([
            { id: 991, title: "Special Report: India's Infrastructure Revolution 2026", category: "India", trend: "Critical", image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800", description: "A comprehensive audit of the mega-structures defining the new Indian skyline...", source: "Internal Bureau" },
            { id: 992, title: "Tech Pulse: The Rise of Bengaluru's Silicon Corridor", category: "Technology", trend: "Rising", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800", description: "Investigating the next phase of India's digital dominance in the global market...", source: "Tech Intel" },
            { id: 993, title: "IPL 2026: Epic Showdown in Wankhede Tonight", category: "Sports", trend: "Viral", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800", description: "The financial capital braces for high-intensity cricket...", source: "Sports Bureau" }
          ]);
        }

        const formatted = parsed.articles.map((art, idx) => ({
          id: idx + 900,
          title: art.title,
          category: query ? (query.charAt(0).toUpperCase() + query.slice(1)) : 'India',
          trend: 'Latest',
          image: art.urlToImage || `https://images.unsplash.com/photo-1585829365234-781fcd50c40b?auto=format&fit=crop&q=80&w=800`,
          description: art.description || "Synthesizing full investigative documentation...",
          source: art.source.name
        }));
        res.json(formatted);
      } catch (e) {
        res.status(500).json({ error: 'Data parsing failed.' });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ error: 'Connection failed.' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend Server operational on port ${PORT}`));
