import os
from dotenv import load_dotenv
from google import genai
from ddgs import DDGS

# Charger les variables d'environnement
load_dotenv()

# Configuration Gemini
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
GEMINI_MODEL = "models/gemini-2.5-flash"

# System Prompt
SYSTEM_PROMPT = """
Tu es Dr. RespirIA, un assistant médical EXPERT spécialisé UNIQUEMENT dans l'asthme.

RÈGLES ABSOLUES :
- Tu réponds UNIQUEMENT aux questions liées à l'asthme
- Si la question est hors sujet → refuse poliment
- Tu ne poses PAS de diagnostic
- Tu ne prescris PAS de médicaments
- Tu fournis des informations médicales fiables
- Ton ton est clair, pédagogique, rassurant et professionnel

GESTION DU RISQUE :
- Si symptômes graves (détresse respiratoire, aggravation rapide, crise sévère) :
  → recommander immédiatement de consulter un médecin ou les urgences

RECHERCHE & SOURCES :
- Si l'information n'est pas certaine, indique que tu vas consulter des sources fiables
- Quand tu donnes une information médicale :
  → cite TOUJOURS des sources fiables
  → OMS (WHO), INSERM, CDC, NHS, PubMed
- Ajoute toujours une section finale :
📚 Sources

FORMAT DES RÉPONSES :
- Titres clairs
- Listes à puces
- Emojis médicaux sobres (🫁⚠️✅)
- Langage compréhensible par le grand public
"""


def web_search(query: str, max_results: int = 5):
    """Recherche web sur l'asthme"""
    results = []
    try:
        ddgs = DDGS()
        search_results = ddgs.text(
            f"asthme {query}",
            region="fr-fr",
            safesearch="moderate",
            max_results=max_results
        )
        
        for r in search_results:
            results.append({
                "title": r["title"],
                "url": r["href"],
                "snippet": r.get("body", "")
            })
    except Exception as e:
        print(f"⚠️ Erreur de recherche web: {e}")
    
    return results


def asthma_chat_basic(question: str, conversation_history: list = None) -> str:
    """Fonction de base pour répondre aux questions sur l'asthme"""
    
    if conversation_history is None:
        conversation_history = []
    
    # Construire le prompt avec l'historique
    full_prompt = f"{SYSTEM_PROMPT}\n\n"
    
    # Limiter aux 10 derniers messages
    recent_history = conversation_history[-10:]
    
    for msg in recent_history:
        if msg["role"] == "user":
            full_prompt += f"Utilisateur : {msg['content']}\n"
        else:
            full_prompt += f"Assistant : {msg['content']}\n"
    
    # Ajouter la question actuelle
    full_prompt += f"Utilisateur : {question}\n"
    
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=full_prompt,
            config={
                "temperature": 0.15,
                "max_output_tokens": 2000
            }
        )
        
        return response.text
        
    except Exception as e:
        error_str = str(e)
        
        # Gérer l'erreur de quota épuisé
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
            return """⏳ **Vous avez atteint votre limite d'utilisation**

Vous avez utilisé toutes vos questions gratuites pour aujourd'hui.

**Que faire ?**
- 🕐 Revenez demain pour de nouvelles questions
- 📱 Votre compteur se réinitialise automatiquement

Merci d'utiliser RespirIA ! Pour toute urgence médicale, contactez votre médecin ou appelez le 15."""
        elif "API" in error_str or "key" in error_str.lower():
            return """😔 **Dr. RespirIA fait une courte pause**

Notre assistant rencontre un petit souci technique.

Veuillez réessayer dans quelques instants. Merci de votre compréhension !"""
        
        # Erreur générique
        return f"❌ Une erreur s'est produite. Veuillez réessayer. (Détail technique : {type(e).__name__})"


def asthma_chat_advanced(question: str, conversation_history: list = None) -> dict:
    """Chatbot avec recherche web automatique si nécessaire"""
    
    if conversation_history is None:
        conversation_history = []
    
    # Obtenir la réponse de base
    base_answer = asthma_chat_basic(question, conversation_history)
    
    # Vérifier si une recherche web est nécessaire
    need_search = any(
        keyword in base_answer.lower()
        for keyword in ["je ne suis pas sûr", "incertain", "données limitées", "recherche"]
    )
    
    sources = []
    if need_search:
        sources = web_search(question)
    
    # Ajouter les sources si trouvées
    if sources:
        sources_text = "\n".join(
            [f"- [{s['title']}]({s['url']})" for s in sources[:5]]
        )
        final_answer = f"""{base_answer}

📚 **Sources complémentaires (recherche web)**  
{sources_text}
"""
    else:
        final_answer = base_answer
    
    return {
        "answer": final_answer,
        "sources": sources,
        "used_web_search": need_search
    }