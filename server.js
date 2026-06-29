const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: [
    // Заміни на свій GitHub Pages URL
    'https://YOUR-GITHUB-USERNAME.github.io',
    'http://localhost:8080',
  ],
}));

// Health check
app.get('/', (req, res) => res.json({ ok: true, service: 'Ліна proxy' }));

// Claude proxy
app.post('/chat', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Claude API error:', err);
    res.status(502).json({ error: 'Upstream error' });
  }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
