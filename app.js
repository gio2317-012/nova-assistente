const chat = document.querySelector("#chat");
const form = document.querySelector("#composer");
const input = document.querySelector("#message");
const mic = document.querySelector("#mic");
const soundButton = document.querySelector("#sound");
const listening = document.querySelector("#listening");
const subtitle = document.querySelector("#subtitle");
let soundOn = true;
let recognition = null;

function addMessage(text, who) {
  const node = document.createElement("div");
  node.className = `message ${who}`;
  if (who === "nova") {
    const sender = document.createElement("span");
    sender.className = "sender";
    sender.textContent = "NOVA";
    node.append(sender);
  }
  node.append(document.createTextNode(text));
  chat.append(node);
  chat.scrollTop = chat.scrollHeight;
}
function speak(text) {
  if (!soundOn || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "it-IT";
  utterance.rate = 0.96;
  utterance.pitch = 1.08;
  const voices = speechSynthesis.getVoices();
  const italian = voices.find(v => v.lang.toLowerCase().startsWith("it"));
  if (italian) utterance.voice = italian;
  speechSynthesis.speak(utterance);
}
function demoReply(text) {
  const t = text.toLowerCase();
  if (/(ciao|buongiorno|buonasera|salve)/.test(t)) return "Ciao! Che bello sentirti. Come posso aiutarti oggi?";
  if (/(come stai|come va)/.test(t)) return "Sto funzionando alla grande, grazie! E tu come stai?";
  if (/(chi sei|come ti chiami)/.test(t)) return "Sono NOVA, il tuo assistente virtuale. Questa è la mia prima versione: posso già ascoltarti e risponderti a voce.";
  if (/(ora|orario|che ore)/.test(t)) return "Sono qui con te! Per l'orario preciso puoi guardare quello del tuo dispositivo.";
  if (/(grazie|ti ringrazio)/.test(t)) return "È un piacere! Quando vuoi, sono qui.";
  return "Ho ricevuto il tuo messaggio: \"" + text + "\". In questa versione iniziale sono attive chat e funzioni vocali dimostrative. Per rispondere liberamente a qualsiasi domanda dobbiamo collegare un vero modello di intelligenza artificiale.";
}
function send(text) {
  const clean = text.trim();
  if (!clean) return;
  addMessage(clean, "user");
  input.value = "";
  const reply = demoReply(clean);
  setTimeout(() => { addMessage(reply, "nova"); speak(reply); }, 350);
}
form.addEventListener("submit", e => { e.preventDefault(); send(input.value); });
soundButton.addEventListener("click", () => {
  soundOn = !soundOn;
  soundButton.classList.toggle("active", soundOn);
  soundButton.textContent = soundOn ? "🔊 Voce attiva" : "🔇 Voce disattivata";
  soundButton.setAttribute("aria-pressed", String(soundOn));
  if (!soundOn && "speechSynthesis" in window) speechSynthesis.cancel();
});
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "it-IT";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => { listening.classList.add("on"); mic.classList.add("listening-now"); subtitle.textContent = "Dimmi pure, ti ascolto."; };
  recognition.onend = () => { listening.classList.remove("on"); mic.classList.remove("listening-now"); subtitle.textContent = "Sono qui. Di cosa vuoi parlare?"; };
  recognition.onerror = e => { addMessage("Non sono riuscita ad avviare il microfono (" + e.error + "). Controlla i permessi del browser.", "nova"); };
  recognition.onresult = e => send(e.results[0][0].transcript);
  mic.addEventListener("click", () => { try { recognition.start(); } catch (_) {} });
} else {
  mic.addEventListener("click", () => addMessage("Il riconoscimento vocale non è supportato da questo browser. Puoi scrivere nella chat oppure usare la dettatura della tastiera.", "nova"));
  mic.title = "Riconoscimento vocale non supportato in questo browser";
}
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
