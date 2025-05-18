import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Afficher le chemin du fichier .env
const envPath = join(__dirname, '.env');
console.log('Looking for .env file at:', envPath);

// Charger les variables d'environnement depuis .env
dotenv.config({ path: envPath });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Vérifier que la clé API est bien chargée
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('❌ ERREUR: OPENAI_API_KEY non trouvée dans le fichier .env');
  process.exit(1);
}

// Afficher les 4 premiers caractères de la clé pour vérifier
console.log('API Key loaded:', OPENAI_API_KEY ? `Yes (starts with: ${OPENAI_API_KEY.substring(0, 4)}...)` : 'No');

app.post('/api/translate', async (req, res) => {
  const { text, targetLang } = req.body;
  console.log('Received request:', { text, targetLang });
  
  const languageMap = {
    fr: 'French',
    es: 'Spanish',
    jp: 'Japanese'
  };
  const messages = [
    { role: 'system', content: 'You are a professional translator.' },
    { role: 'user', content: `Translate the following text to ${languageMap[targetLang]}:\n\n${text}` }
  ];

  const requestBody = {
    model: 'gpt-4.1',
    messages: messages,
    max_tokens: 300
  };

  try {
    console.log('Sending request to OpenAI with body:', JSON.stringify(requestBody, null, 2));
    console.log('Using API key starting with:', OPENAI_API_KEY.substring(0, 7) + '...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    console.log('OpenAI response:', data);
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      res.json({ translation: data.choices[0].message.content });
    } else {
      console.error('OpenAI API error response:', data);
      res.status(500).json({ error: 'Aucune traduction reçue.' });
    }
  } catch (error) {
    console.error('❌ API error:', error);
    res.status(500).json({ error: 'Erreur lors de la traduction.' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur de traduction démarré sur http://localhost:${PORT}`);
}); 