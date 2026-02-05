import { useCallback, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Row,  } from "react-bootstrap";


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

const normalizeReply = (data: unknown) => {
  if (!data || typeof data !== "object") return null;
  if ("reply" in data && typeof data.reply === "string") return data.reply;
  if ("message" in data && typeof data.message === "string") return data.message;
  return null;
};

export default function Agent({
  endpoint = "/api/chat",
  initialMessages = [],
  onMessage,
  onError,
  children,
}: AgentProps) {
  const [messages, setMessages] = useState<AgentMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const history = [...messages, userMessage];
      setMessages(history);
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history }),
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = (await res.json()) as unknown;
        const reply = normalizeReply(data);

        if (!reply) {
          throw new Error("Unexpected response format from agent endpoint.");
        }

        const agentMessage: AgentMessage = {
          id: createId(),
          role: "assistant",
          content: reply,
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
    [endpoint, messages, onError, onMessage]
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


