// Remplace 'VOTRE_CLE_API_OPENAI' par ta vraie clé API OpenAI (attention à la sécurité !)
const OPENAI_API_KEY = 'VOTRE_CLE_API_OPENAI';

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

  // Affichage du résultat (ajoute un élément avec id="output" dans ton HTML si besoin)
  let output = document.getElementById('output');
  if (!output) {
    output = document.createElement('div');
    output.id = 'output';
    document.querySelector('.container').appendChild(output);
  }
  output.textContent = translation;
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
        model: "gpt-4",
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