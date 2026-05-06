import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Bot, MessageCircle, Minus, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const WELCOME =
  "Hello! I'm your GDS Recruitment Assistant. Ask me anything about the application process, eligibility, fees, or status.";

const SUGGESTIONS = [
  "What is the eligibility criteria?",
  "How to apply online?",
  "What documents are needed?",
  "What is the application fee?",
  "When is the last date?",
];

const FAQ: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: [
      "eligibility",
      "qualify",
      "age",
      "qualification",
      "10th",
      "class",
    ],
    answer:
      "Candidates must have passed Class 10 (Matriculation) from a recognized board. Age: 18–40 years. Category relaxation applicable as per government norms (SC/ST: 5 years, OBC: 3 years).",
  },
  {
    keywords: ["fee", "payment", "charge", "amount", "cost"],
    answer:
      "Application fee is ₹100 for General/OBC candidates. SC/ST/PwD/Female candidates are exempted from paying any fee.",
  },
  {
    keywords: ["document", "certificate", "upload", "required", "paper"],
    answer:
      "Required documents: Class 10 certificate & marksheet, Caste certificate (if applicable), Valid photo ID (Aadhaar/Voter ID), Recent passport-size photo, Signature scan.",
  },
  {
    keywords: ["last date", "deadline", "closing", "when", "date", "schedule"],
    answer:
      "Check the Important Dates section on the home page for current deadlines including registration open/close, fee payment, and result dates.",
  },
  {
    keywords: ["apply", "how", "process", "steps", "online", "register"],
    answer:
      "Step 1: Register with mobile & email OTP. Step 2: Fill application form with education & address. Step 3: Upload documents & photo. Step 4: Pay fee online. Step 5: Submit and take printout.",
  },
  {
    keywords: ["status", "track", "application", "check"],
    answer:
      "Log in with your credentials and go to 'Application Status' in the sidebar to track your application in real-time.",
  },
  {
    keywords: ["result", "merit", "shortlist", "select"],
    answer:
      "Selection is based on Class 10 marks percentage. Merit list is prepared circle-wise. Check the 'Shortlisted Candidates' section for state-wise results.",
  },
  {
    keywords: ["post", "vacancy", "gds", "gramin dak sevak"],
    answer:
      "GDS posts include Branch Postmaster (BPM), Assistant Branch Postmaster (ABPM), and Dak Sevak. Vacancies vary by postal circle and division.",
  },
];

function getLocalResponse(msg: string): string {
  const lower = msg.toLowerCase();
  for (const entry of FAQ) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.answer;
    }
  }
  return "I can help with questions about eligibility, fees, documents, and application process. Please visit the official notification for detailed information.";
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-primary/10 border border-border flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "bot", text: WELCOME, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message/typing changes
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setShowSuggestions(false);
    setIsTyping(true);

    // Simulate realistic typing delay
    const delay = 800 + Math.random() * 700;
    await new Promise((r) => setTimeout(r, delay));

    const answer = getLocalResponse(text);
    const botMsg: Message = {
      id: `b-${Date.now()}`,
      role: "bot",
      text: answer,
      timestamp: new Date(),
    };
    setIsTyping(false);
    setMessages((prev) => [...prev, botMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage(input);
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    setIsMinimized(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Chat window */}
      {isOpen && (
        <div
          className={cn(
            "bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden",
            "transition-all duration-300 ease-out",
            isMinimized ? "h-14 w-80" : "w-80 h-[28rem] sm:w-96 sm:h-[32rem]",
            "max-sm:fixed max-sm:inset-x-4 max-sm:bottom-24 max-sm:w-auto max-sm:h-[75vh]",
          )}
          data-ocid="chatbot-window"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">
                GDS Help Assistant
              </p>
              <p className="text-xs opacity-75">Online · Replies instantly</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMinimized((v) => !v)}
              className="p-1 rounded hover:bg-primary-foreground/20 transition-colors"
              aria-label="Minimize chat"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-primary-foreground/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-muted/20">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-2 mb-3",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    {msg.role === "bot" && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 border border-border flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] px-4 py-2.5 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                          : "bg-card border border-border text-foreground rounded-2xl rounded-bl-sm",
                      )}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isTyping && <TypingIndicator />}

                {/* Suggested questions */}
                {showSuggestions && messages.length === 1 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium px-1">
                      Suggested questions:
                    </p>
                    {SUGGESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendMessage(q)}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-150"
                        data-ocid="chatbot-suggestion"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="shrink-0 border-t border-border bg-card px-3 py-3 flex gap-2 items-center">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question..."
                  className="flex-1 text-sm h-9 bg-background"
                  disabled={isTyping}
                  data-ocid="chatbot-input"
                  aria-label="Chat message input"
                />
                <Button
                  type="button"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  data-ocid="chatbot-send"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          "w-14 h-14 rounded-full bg-primary text-primary-foreground",
          "flex items-center justify-center shadow-lg",
          "hover:scale-110 hover:shadow-xl active:scale-95",
          "transition-transform duration-200 ease-out",
          "relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
        data-ocid="chatbot-toggle"
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
      >
        <MessageCircle className="w-6 h-6" />
        {/* Badge */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center shadow">
            ?
          </span>
        )}
      </button>
    </div>
  );
}
