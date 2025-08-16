const express = require('express');
const cors = require('cors');
const sequelize = require('./database.js');
const Profile = require('./models/profile.js');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('LinkedIn Scraper API Running ✅'));

app.post('/api/profiles', async (req, res) => {
    try {
        const profile = await Profile.create(req.body);
        res.status(201).json(profile);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/profiles', async (req, res) => {
    try {
        const profiles = await Profile.findAll();
        res.json(profiles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced successfully');
        app.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));
    } catch (err) {
        console.error('❌ Database error:', err);
        process.exit(1);
    }
})();
