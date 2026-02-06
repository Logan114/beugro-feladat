import { useEffect, useState } from "react";
import API from "../api";

interface AgentReply {
  message: string;
  agent_name?: string;
  created_at: string;
}

interface SupportChat {
  id: string;
  user_message: string;
  created_at: string;
  status: string;
  agent_replies?: AgentReply[];
  user_messages?: {
    message: string;
    user_name?: string;
    created_at: string;
  }[];
}

type ChatLogEntry = {
  id: string;
  author: string;
  message: string;
  created_at: string;
};

export default function AgentDashboard() {
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await API.get("/agent/chats");
      setChats(res.data?.chats ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load chats";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const submitReply = async (chatId: string) => {
    const message = replyDrafts[chatId]?.trim();
    if (!message) return;

    try {
      const res = await API.post(`/agent/chats/${chatId}/reply`, { message });
      const updated = res.data?.chat as SupportChat | undefined;
      if (updated) {
        setChats((prev) => prev.map((chat) => (chat.id === chatId ? updated : chat)));
      } else {
        const createdAt = new Date().toISOString();
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  agent_replies: [
                    ...(chat.agent_replies ?? []),
                    { message, created_at: createdAt, agent_name: "You" },
                  ],
                }
              : chat
          )
        );
      }
      setReplyDrafts((prev) => ({ ...prev, [chatId]: "" }));
    } catch (err) {
      const messageText = err instanceof Error ? err.message : "Failed to send reply";
      setError(messageText);
    }
  };

  const buildChatLog = (chat: SupportChat): ChatLogEntry[] => {
    const entries: ChatLogEntry[] = [
      {
        id: `${chat.id}_user`,
        author: "Client",
        message: chat.user_message,
        created_at: chat.created_at,
      },
      ...(chat.user_messages ?? []).map((message, index) => ({
        id: `${chat.id}_user_${index}`,
        author: message.user_name ?? "Client",
        message: message.message,
        created_at: message.created_at,
      })),
      ...(chat.agent_replies ?? []).map((reply, index) => ({
        id: `${chat.id}_reply_${index}`,
        author: reply.agent_name ?? "Agent",
        message: reply.message,
        created_at: reply.created_at,
      })),
    ];

    return entries.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  };

  return (
    <section className="agent-dashboard">
      <header className="agent-dashboard__header">
        <h1>Helpdesk chats</h1>
        <button type="button" onClick={loadChats} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error ? <div className="agent-dashboard__error">{error}</div> : null}

      {chats.length === 0 ? (
        <p className="agent-dashboard__empty">No handoff chats yet.</p>
      ) : (
        <div className="agent-dashboard__list">
          {chats.map((chat) => (
            <article key={chat.id} className="agent-dashboard__card">
              <div className="agent-dashboard__meta">
                <strong>Created:</strong> {chat.created_at}
                <span className="agent-dashboard__status">{chat.status}</span>
              </div>
              <p className="agent-dashboard__message">{chat.user_message}</p>
              <div className="agent-dashboard__replies">
                {buildChatLog(chat).map((entry) => (
                  <div key={entry.id} className="agent-dashboard__reply">
                    <strong>{entry.author}:</strong> {entry.message}
                  </div>
                ))}
              </div>
              <div className="agent-dashboard__composer">
                <textarea
                  value={replyDrafts[chat.id] ?? ""}
                  onChange={(event) =>
                    setReplyDrafts((prev) => ({ ...prev, [chat.id]: event.target.value }))
                  }
                  placeholder="Write a reply..."
                  rows={3}
                />
                <button type="button" onClick={() => submitReply(chat.id)}>
                  Send reply
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
