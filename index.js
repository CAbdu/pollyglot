// === Nouvelle logique de chat ===

const chatHistoryDiv = document.querySelector('.chat-history');
const chatInput = document.querySelector('.chat-input');
const sendBtn = document.querySelector('.send-message');
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

async function handleSend() {
  const inputText = chatInput.value.trim();
  const selectedLang = document.querySelector('input[name="lang"]:checked').value;
  if (!inputText) return;
  // Ajoute le message utilisateur à l'historique
  chatHistory.push({ role: 'user', content: inputText });
  renderChat();
  chatInput.value = '';
  // Appel API pour la traduction
  const translation = await translateText(inputText, selectedLang);
  chatHistory.push({ role: 'assistant', content: translation });
  renderChat();
}

sendBtn.addEventListener('click', handleSend);
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
    const data = await response.json();
    if (data.translation) {
      return data.translation;
    } else {
      return data.error || 'Aucune traduction reçue.';
    }
  } catch (error) {
    console.error('❌ API error:', error);
    return "An error occurred while translating.";
  }
}