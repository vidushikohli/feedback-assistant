"use client";

import { useState } from "react";

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const role = "user"; // or "admin" / "coadmin"

  async function sendMessage() {
    if (!message.trim()) return;

    setLoading(true);
    setError("");
    setReply("");

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, role }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Unable to contact the chatbot right now.");
      }

      setReply(data.response || "No response received.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to contact the chatbot right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border shadow-lg rounded-lg p-4 w-80">
      <h3 className="font-bold mb-3">🤖 All your queries are welcome here</h3>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask me something..."
        className="border p-2 rounded w-full"
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-3 disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}

      {reply && <div className="mt-4 p-3 bg-gray-100 rounded">{reply}</div>}
    </div>
  );
}