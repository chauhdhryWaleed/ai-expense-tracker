import { useState } from "react";

interface Props {
  onSend: (message: string) => Promise<string>;
}

export default function AgentChat({ onSend }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="panel p-5">
      <h2 className="mb-2 text-lg font-semibold text-slate-100">AI Assistant</h2>
      <div className="mb-3 h-56 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/40 p-3">
        {messages.map((message, idx) => (
          <div key={idx} className={`mb-2 max-w-[90%] rounded-xl px-3 py-2 text-sm ${message.role === "user" ? "ml-auto bg-indigo-500/30 text-indigo-100" : "bg-slate-800 text-slate-100"}`}>
            <span className="mr-1 font-semibold">{message.role === "user" ? "You:" : "Agent:"}</span>
            {message.text}
          </div>
        ))}
        {loading && <p className="text-sm text-slate-400">Agent is thinking...</p>}
      </div>
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!input.trim()) return;
          const userMsg = input.trim();
          setInput("");
          setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
          setLoading(true);
          try {
            const response = await onSend(userMsg);
            setMessages((prev) => [...prev, { role: "assistant", text: response }]);
          } catch {
            setMessages((prev) => [...prev, { role: "assistant", text: "I hit an error while processing that request. Please try again." }]);
          } finally {
            setLoading(false);
          }
        }}
      >
        <input className="input-ui flex-1" placeholder="Ask: I spent 500 on petrol today" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="btn-primary" type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  );
}
