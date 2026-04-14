import { useState } from "react";

interface Props {
  onSend: (message: string) => Promise<string>;
}

export default function AgentChat({ onSend }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-2 text-lg font-semibold">AI Assistant</h2>
      <div className="mb-3 h-48 overflow-y-auto rounded border p-2">
        {messages.map((message, idx) => (
          <p key={idx} className="mb-1 text-sm">
            <span className="font-semibold">{message.role === "user" ? "You" : "Agent"}:</span> {message.text}
          </p>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!input.trim()) return;
          const userMsg = input.trim();
          setInput("");
          setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
          const response = await onSend(userMsg);
          setMessages((prev) => [...prev, { role: "assistant", text: response }]);
        }}
      >
        <input className="flex-1 rounded border p-2" placeholder="Ask: I spent 500 on petrol today" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="rounded bg-slate-800 px-3 py-2 text-white" type="submit">Send</button>
      </form>
    </div>
  );
}
