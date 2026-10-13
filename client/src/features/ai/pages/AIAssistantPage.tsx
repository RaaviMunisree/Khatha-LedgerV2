import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, User as UserIcon, Bot } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { EmptyState } from "../../../components/ui/StatCard";

import { useAuth } from "../../../features/auth/hooks/useAuth";
import { useShopStore } from "../../../stores/shop.store";
import { cn } from "../../../lib/utils";
import { getApiErrorMessage } from "../../../lib/api/api-error";

import { chatWithAI } from "../api/ai.api";
import type { ChatMessage } from "../types/ai.types";

const suggestedPrompts = [
  "Who are my top 3 customers by outstanding?",
  "Summarize today's sales",
  "Which products are running low on stock?",
  "How much can I expect to collect this week?",
];

export default function AIAssistantPage() {
  const { user } = useAuth();
  const shopId = useShopStore((s) => s.currentShopId);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ASSISTANT",
      content: `Hi ${user?.name?.split(" ")[0] ?? "there"} 👋 I'm your KhataX AI assistant. Ask me about customers, sales, stock, or anything about your business — I'll dig through your data and explain it in plain English.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const submit = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "USER", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await chatWithAI({
        message: text,
        shopId: shopId ?? undefined,
        history: messages,
      });
      setMessages((m) => [
        ...m,
        {
          role: "ASSISTANT",
          content:
            res.data?.reply ??
            "Sorry, I couldn't process that right now.",
        },
      ]);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "AI assistant is unavailable"),
      );
      setMessages((m) => [
        ...m,
        {
          role: "ASSISTANT",
          content:
            "Oops — I couldn't reach the AI service. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Sparkles className="h-5 w-5" />
            AI Assistant
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Plain-English insights on customers, sales, and stock.
          </p>
        </div>
        <Badge variant="info" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Powered by your KhataX data
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-3 flex h-[640px] flex-col">
          <CardHeader className="flex-shrink-0 border-b border-slate-100">
            <CardTitle>Conversation</CardTitle>
            <CardDescription>
              Ask anything about your shop performance.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 p-0">
            <div
              className="h-full w-full p-6 pt-6"
              ref={scrollRef}
            >
            {messages.length === 0 ? (
              <EmptyState
                title="Start the conversation"
                description="Ask a question or pick one of the suggested prompts."
                icon={Sparkles}
              />
            ) : (
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <MessageBubble key={i} message={m} />
                ))}
                {loading && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex h-9 items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </CardContent>
          <div className="border-t border-slate-100 p-4">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about sales, top customers, low stock..."
                className="flex-1"
              />
              <Button
                type="submit"
                loading={loading}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Ask
              </Button>
            </form>
          </div>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Try asking</CardTitle>
            <CardDescription>
              Click a prompt to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => submit(p)}
                className="flex w-full items-start justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span>{p}</span>
                <Send className="mt-0.5 h-3.5 w-3.5 text-slate-400" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "USER";
  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isUser && "flex-row-reverse",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
          isUser ? "bg-slate-700" : "bg-slate-900",
        )}
      >
        {isUser ? (
          <UserIcon className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-slate-900 text-white"
            : "rounded-tl-sm bg-slate-100 text-slate-800",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
