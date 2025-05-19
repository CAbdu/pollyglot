import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = 3001;

// Configuration CORS plus permissive
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Gérer les requêtes OPTIONS
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// Vérification de la clé API
if (!process.env.OPENAI_API_KEY) {
    console.error('❌ ERREUR: OPENAI_API_KEY non trouvée dans le fichier .env');
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Fonction pour vérifier si l'API OpenAI est disponible
async function checkOpenAIAvailability() {
    try {
        await openai.models.list();
        return true;
    } catch (error) {
        console.error('Erreur de connexion à OpenAI:', error.message);
        return false;
    }
}

// Middleware pour vérifier la disponibilité de l'API
async function checkAPI(req, res, next) {
    const isAvailable = await checkOpenAIAvailability();
    if (!isAvailable) {
        return res.status(503).json({
            error: 'Service temporairement indisponible',
            details: 'Le service de correction/traduction est momentanément indisponible. Veuillez réessayer dans quelques instants.'
        });
    }
    next();
}

app.post('/api/translate', checkAPI, async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        console.log('Received translation request:', { text, targetLang });
        
        const languageMap = {
            fr: 'French',
            es: 'Spanish',
            jp: 'Japanese'
        };

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a professional translator."
                },
                {
                    role: "user",
                    content: `Translate the following text to ${languageMap[targetLang]}:\n\n${text}`
                }
            ],
            max_tokens: 300
        });

        const translation = completion.choices[0].message.content;
        res.json({ translation });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({
            error: 'Erreur lors de la traduction',
            details: error.message
        });
    }
});

app.post('/api/correct', checkAPI, async (req, res) => {
    try {
        const { text } = req.body;
        console.log('Received correction request:', { text });
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a professional French language corrector. Correct any spelling, grammar, or punctuation errors in the text while maintaining its original meaning. Return only the corrected text without any explanations."
                },
                {
                    role: "user",
                    content: text
                }
            ],
            max_tokens: 300
        });

        const correctedText = completion.choices[0].message.content;
        res.json({ correctedText });
    } catch (error) {
        console.error('Correction error:', error);
        res.status(500).json({
            error: 'Erreur lors de la correction du texte',
            details: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
}); 