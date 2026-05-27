import { useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";
import Badge from "./Badge";
import Button from "./Button";
import ChatbotTabs from "./ChatbotTabs";
import { getCurrentUser } from "../services/authService";
import {
  buildResponseFromIntent,
  getBotResponse,
  getFaqs,
  getIntentById,
  getQuickChips,
} from "../services/chatbotService";
import { getJSON, remove, setJSON } from "../utils/storage";
import { cx } from "../utils/classNames";

function createWelcomeMessage() {
  return {
    id: nanoid(),
    role: "bot",
    text: "Hola, soy el asistente de SaludIA. Puedo ayudarte con la app o con bienestar general.",
  };
}

export default function ChatbotWidget() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const storageKey = useMemo(
    () => (user ? `chatHistory:${user.id}` : "chatHistory:guest"),
    [user]
  );

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("help");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    const stored = getJSON(storageKey, []);
    return stored.length ? stored : [createWelcomeMessage()];
  });

  const quickChips = getQuickChips();
  const faqs = getFaqs();
  const scrollRef = useRef(null);

  useEffect(() => {
    setJSON(storageKey, messages);
  }, [messages, storageKey]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, activeTab]);

  if (!user) return null;

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = (text) => {
    const content = text.trim();
    if (!content) return;

    const userMessage = {
      id: nanoid(),
      role: "user",
      text: content,
    };

    const category = activeTab === "faq" ? "help" : activeTab;
    const response = getBotResponse({ message: content, category });
    const botMessage = {
      id: nanoid(),
      role: "bot",
      text: response.text,
      actions: response.actions || [],
      suggestions: response.suggestions || [],
      disclaimer: response.disclaimer || null,
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
  };

  const handleFaqClick = (faq) => {
    const userMessage = { id: nanoid(), role: "user", text: faq.question };
    const intent = getIntentById(faq.intentId);
    const response = buildResponseFromIntent(intent);
    const botMessage = {
      id: nanoid(),
      role: "bot",
      text: response.text,
      actions: response.actions || [],
      suggestions: response.suggestions || [],
      disclaimer: response.disclaimer || null,
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
  };

  const handleClear = () => {
    const confirmClear = window.confirm("Quieres borrar la conversacion?");
    if (!confirmClear) return;
    remove(storageKey);
    setMessages([createWelcomeMessage()]);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
      {open && (
        <div className="mb-3 w-[340px] overflow-hidden rounded-2xl border border-ink/10 bg-panel shadow-soft md:w-[380px]">
          <div className="flex items-center justify-between border-b border-ink/10 bg-ink/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <Badge variant="info">Asistente SaludIA</Badge>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-ink/60 hover:text-ink"
              >
                Borrar conversacion
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-ink/10 px-2 py-1 text-xs text-ink/60 hover:bg-ink/5"
              >
                Cerrar
              </button>
            </div>
          </div>

          <div className="space-y-3 px-4 py-3">
            <ChatbotTabs value={activeTab} onChange={setActiveTab} />

            {activeTab === "faq" && (
              <div className="grid gap-2">
                {faqs.map((faq) => (
                  <button
                    key={faq.id}
                    type="button"
                    onClick={() => handleFaqClick(faq)}
                    className="rounded-xl border border-ink/10 bg-ink/5 px-3 py-2 text-left text-xs text-ink/80 hover:bg-ink/10"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="max-h-[280px] space-y-3 overflow-y-auto border-y border-ink/10 bg-white/70 px-4 py-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cx(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cx(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-accent text-white"
                      : "border border-ink/10 bg-white text-ink"
                  )}
                >
                  <p>{message.text}</p>
                  {message.disclaimer && (
                    <p className="mt-2 text-[11px] text-muted">
                      {message.disclaimer}
                    </p>
                  )}
                  {message.actions?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.actions.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          onClick={() => action.to && navigate(action.to)}
                          className="rounded-full border border-ink/10 bg-ink/5 px-2.5 py-1 text-[11px] text-ink/70 hover:bg-ink/10"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {message.suggestions?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion) => (
                        <button
                          key={suggestion.label}
                          type="button"
                          onClick={() => handleSend(suggestion.message)}
                          className="rounded-full border border-ink/10 bg-white px-2.5 py-1 text-[11px] text-ink/70 hover:bg-ink/5"
                        >
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          <div className="space-y-3 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {quickChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleSend(chip.message)}
                  className="rounded-full border border-ink/10 bg-ink/5 px-3 py-1 text-[11px] text-ink/70 hover:bg-ink/10"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="Escribe tu duda aqui"
                className="flex-1 rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none"
              />
              <Button size="sm" onClick={() => handleSend(input)}>
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
      >
        {open ? "Cerrar" : "Asistente"}
      </button>
    </div>
  );
}
