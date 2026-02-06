import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Row,  } from "react-bootstrap";
import API from "../api";


export type AgentRole = "user" | "assistant" | "system";

export interface AgentMessage {
  id: string;
  role: AgentRole;
  content: string;
  createdAt: number;
}

export interface AgentRenderProps {
  messages: AgentMessage[];
  input: string;
  setInput: (value: string) => void;
  sendMessage: (content: string) => Promise<AgentMessage | null>;
  submit: (event?: FormEvent) => Promise<void>;
  reset: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface AgentProps {
  endpoint?: string;
  initialMessages?: AgentMessage[];
  onMessage?: (message: AgentMessage) => void;
  onError?: (error: Error) => void;
  children?: (props: AgentRenderProps) => React.ReactNode;
}

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`;

type AgentResponse = {
  type: "ai" | "handoff" | "error";
  reply: string | null;
  chat_id?: string;
};

type SupportChat = {
  id: string;
  user_message: string;
  created_at: string;
  agent_replies?: { message: string; agent_name?: string; created_at: string }[];
  user_messages?: { message: string; user_name?: string; created_at: string }[];
};

const normalizeReply = (data: unknown): AgentResponse => {
  if (!data || typeof data !== "object") {
    return { type: "error", reply: null };
  }
  const typed = data as Record<string, unknown>;
  const reply =
    typeof typed.reply === "string"
      ? typed.reply
      : typeof typed.message === "string"
      ? typed.message
      : null;

  const type =
    typed.type === "handoff" || typed.type === "error" || typed.type === "ai"
      ? typed.type
      : "ai";

  return {
    type,
    reply,
    chat_id: typeof typed.chat_id === "string" ? typed.chat_id : undefined,
  };
};

export default function Agent({
  endpoint = "/chat",
  initialMessages = [],
  onMessage,
  onError,
  children,
}: AgentProps) {
  const [messages, setMessages] = useState<AgentMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handoffChatId, setHandoffChatId] = useState<string | null>(null);

  const mapSupportChatToMessages = useCallback((chat: SupportChat): AgentMessage[] => {
    const entries: AgentMessage[] = [
      {
        id: `${chat.id}_user`,
        role: "user",
        content: chat.user_message,
        createdAt: new Date(chat.created_at).getTime(),
      },
      ...(chat.user_messages ?? []).map((message, index) => ({
        id: `${chat.id}_user_${index}`,
        role: "user" as const,
        content: message.message,
        createdAt: new Date(message.created_at).getTime(),
      })),
      ...(chat.agent_replies ?? []).map((reply, index) => ({
        id: `${chat.id}_reply_${index}`,
        role: "assistant" as const,
        content: reply.message,
        createdAt: new Date(reply.created_at).getTime(),
      })),
    ];

    return entries.sort((a, b) => a.createdAt - b.createdAt);
  }, []);

  const loadSupportChat = useCallback(
    async (chatId: string) => {
      try {
        const res = await API.get(`/support/chats/${chatId}`);
        const chat = res.data?.chat as SupportChat | undefined;
        if (chat) {
          setMessages(mapSupportChatToMessages(chat));
        }
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error("Unknown error");
        setError(errorInstance.message);
        onError?.(errorInstance);
      }
    },
    [mapSupportChatToMessages, onError]
  );

  useEffect(() => {
    if (!handoffChatId) return;
    loadSupportChat(handoffChatId);
    const interval = window.setInterval(() => {
      loadSupportChat(handoffChatId);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [handoffChatId, loadSupportChat]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return null;

      const userMessage: AgentMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        if (handoffChatId) {
          const res = await API.post(`/support/chats/${handoffChatId}/message`, {
            message: trimmed,
          });
          const chat = res.data?.chat as SupportChat | undefined;
          if (chat) {
            setMessages(mapSupportChatToMessages(chat));
          }
          return userMessage;
        }

        const history = [...messages, userMessage];
        const res = await API.post(endpoint, { message: trimmed, history });
        const data = res.data as unknown;
        const response = normalizeReply(data);

        if (!response?.reply) {
          throw new Error("Unexpected response format from agent endpoint.");
        }

        if (response.type === "handoff") {
          if (response.chat_id) {
            setHandoffChatId(response.chat_id);
          }
          return userMessage;
        }

        const agentMessage: AgentMessage = {
          id: createId(),
          role: "assistant",
          content: response.reply,
          createdAt: Date.now(),
        };

        setMessages((prev) => [...prev, agentMessage]);
        onMessage?.(agentMessage);

        return agentMessage;
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error("Unknown error");
        setError(errorInstance.message);
        onError?.(errorInstance);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, handoffChatId, mapSupportChatToMessages, messages, onError, onMessage]
  );

  const submit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      const content = input;
      setInput("");
      await sendMessage(content);
    },
    [input, sendMessage]
  );

  const reset = useCallback(() => {
    setMessages(initialMessages);
    setInput("");
    setError(null);
  }, [initialMessages]);

  const renderProps = useMemo<AgentRenderProps>(
    () => ({
      messages,
      input,
      setInput,
      sendMessage,
      submit,
      reset,
      isLoading,
      error,
    }),
    [messages, input, sendMessage, submit, reset, isLoading, error]
  );

  if (typeof children === "function") {
    return <>{children(renderProps)}</>;
  }

  return (
    <section className="agent">
      <header className="agent__header">{
        <h1>Support chat</h1>
        }</header>

      <div className="agent__messages">
        {messages.map((message) => (
          <div key={message.id}>
            <div className={`agent__message agent__message--${message.role}`}>
              {message.role === "user" ? "User: " : ""}
              {message.role === "assistant" ? "Agent: " : ""}
              {message.content}
            </div>
            <br />
          </div>
        ))}
      </div>

      <form className="agent__composer" onSubmit={submit}>
        <div class="container">
         <div class="row"> 
          <div class="col-6">


        <textarea
          className="agent__input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask the agent..."    
          rows={3}
          />
          </div>
          <div class="col"> 

        <button className="agent__send" type="submit" disabled={isLoading} 
   >
          {isLoading ? "Sending..." : "Send"}
        </button>
          </div>
          </div>
          </div>
      </form>

      <footer className="agent__footer">
        {error ? <div className="agent__error">{error}</div> : null}
      </footer>
    </section>
  );
}
