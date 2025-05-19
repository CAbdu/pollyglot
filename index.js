// === Nouvelle logique de chat ===

const chatHistoryDiv = document.querySelector('.chat-history');
const chatInput = document.querySelector('.chat-input');
const sendBtn = document.querySelector('.send-message');
const correctButton = document.querySelector('.correct-message');
let chatHistory = [];

function renderChat() {
  chatHistoryDiv.innerHTML = '';
  chatHistory.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message ' + msg.role;
    msgDiv.innerHTML = `<strong>${msg.role === 'user' ? 'Vous' : 'PollyGlot'} :</strong> <span>${msg.content}</span>`;
    chatHistoryDiv.appendChild(msgDiv);
  });
  chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
}

function showError(message, details = '') {
  chatHistory.push({
    role: 'assistant',
    content: `❌ ${message}${details ? `\n${details}` : ''}`
  });
  renderChat();
}

async function handleSend() {
  const inputText = chatInput.value.trim();
  const selectedLang = document.querySelector('input[name="lang"]:checked').value;
  if (!inputText) return;
  
  // Ajoute le message utilisateur à l'historique
  chatHistory.push({ role: 'user', content: inputText });
  renderChat();
  chatInput.value = '';
  
  try {
    // Appel API pour la traduction
    const translation = await translateText(inputText, selectedLang);
    chatHistory.push({ role: 'assistant', content: translation });
  } catch (error) {
    showError('Erreur lors de la traduction', error.message);
  }
  renderChat();
}

// Fonction pour corriger le texte
async function correctText(text) {
    try {
        const response = await fetch('http://localhost:3001/api/correct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || errorData.error || 'Erreur lors de la correction');
        }
        
        const data = await response.json();
        return data.correctedText;
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
}

// Gestionnaire d'événement pour le bouton de correction
correctButton.addEventListener('click', async () => {
    const text = chatInput.value.trim();
    if (text) {
        try {
            const correctedText = await correctText(text);
            chatInput.value = correctedText;
            
            // Ajouter un message dans l'historique
            chatHistory.push({ 
                role: 'assistant', 
                content: `Correction : "${text}" → "${correctedText}"` 
            });
        } catch (error) {
            showError('Erreur lors de la correction', error.message);
        }
        renderChat();
    }
});

// Gestionnaire d'événement pour le bouton d'envoi
sendBtn.addEventListener('click', handleSend);

// Gestionnaire d'événement pour la touche Entrée
chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
    }
});

async function translateText(text, targetLang) {
    try {
        const response = await fetch('http://localhost:3001/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, targetLang })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || errorData.error || 'Erreur lors de la traduction');
        }

        const data = await response.json();
        if (data.translation) {
            return data.translation;
        } else {
            throw new Error('Aucune traduction reçue');
        }
    } catch (error) {
        console.error('❌ API error:', error);
        throw error;
    }
}