// Remplace 'VOTRE_CLE_API_OPENAI' par ta vraie clé API OpenAI (attention à la sécurité !)
const OPENAI_API_KEY = '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';

// Gestion du clic sur le bouton Translate
// Utilise la classe 'translate' comme dans le HTML

document.querySelector('.translate').addEventListener('click', async function () {
  const inputText = document.querySelector('.input-text').value;
  const selectedLang = document.querySelector('input[name="lang"]:checked').value;

  if (!inputText.trim()) {
    alert("Please write something to translate.");
    return;
  }

  // Appel à l'API pour traduire
  const translation = await translateText(inputText, selectedLang);

  // Masquer la div .select et afficher la traduction dans .translate-text
  const selectDiv = document.querySelector('.select');
  if (selectDiv) selectDiv.style.display = 'none';

  const translateTextDiv = document.querySelector('.translate-text');
  let traductionDiv = document.querySelector('.traduction');
  if (!traductionDiv) {
    traductionDiv = document.createElement('div');
    traductionDiv.className = 'traduction';
    translateTextDiv.appendChild(traductionDiv);
  }
  traductionDiv.innerHTML = `<h2>Traduction :</h2><div>${translation}</div>`;
});

async function translateText(text, targetLang) {
  const languageMap = {
    fr: 'French',
    es: 'Spanish',
    jp: 'Japanese'
  };
  const messages = [
    { role: 'system', content: "You are a professional translator." },
    { role: "user", content: `Translate the following text to ${languageMap[targetLang]}:\n\n${text}` }
  ];
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: messages,
        max_tokens: 300
      })
    });
   
    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      return "Aucune traduction reçue.";
      
    }
    
  } catch (error) {
    console.error("❌ API error:", error);
    return "An error occurred while translating.";
  }
}