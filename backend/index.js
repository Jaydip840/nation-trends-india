const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to Nation Trends MongoDB Atlas'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- SCHEMAS ---

const articleSchema = new mongoose.Schema({
  title: String,
  slug: String,
  image: String,
  category: String,
  date: String,
  author: String,
  views: { type: Number, default: 0 },
  excerpt: String,
  content: String
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
    const newArticle = new Article(req.body);
    const saved = await newArticle.save();
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
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const sub = new Subscriber(req.body);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend Server operational on port ${PORT}`));
