import React, { useState } from "react";
import { semanticSearchAgent } from "@/libs/agents/semanticSearchAgent";
import { webSearchAgent } from "@/libs/agents/webSearchAgent";
import { infoOutputAgent } from "@/libs/agents/infoOutputAgent";

const ChatbotTBTest = () => {
  const [question, setQuestion] = useState("");
  const [dbResults, setDbResults] = useState<any[]>([]);
  const [webResults, setWebResults] = useState<any[]>([]);
  const [finalAnswer, setFinalAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDbResults([]);
    setWebResults([]);
    setFinalAnswer("");
    try {
      // Run both agents in parallel
      const [db, web] = await Promise.all([
        semanticSearchAgent(question, 3),
        webSearchAgent({ query: question, numberOfSearchResults: 3 })
      ]);
      setDbResults(db);
      setWebResults(web);

      // Compose final answer
      const answer = await infoOutputAgent({
        query: question,
        dbResults: db,
        webResults: web,
      });
      setFinalAnswer(answer || "Cannot answer");
    } catch (err: any) {
      setError(err.message || "Error searching");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24 }}>
      <h2>Semantic Chatbot (DB + Web)</h2>
      <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Ask a question..."
        style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            border: "1.5px solid #e0e0e0",
            color: "#333",
            borderRadius: 8,
            background: "#f7f6fd", // pastel lavender
            fontSize: 16,
            outline: "none",
            transition: "border 0.2s",
            boxShadow: "0 1px 3px rgba(180,180,255,0.04)",
        }}
        />
        <button
        type="submit"
        disabled={loading || !question.trim()}
        style={{
            background: loading
            ? "#b5c6e0"
            : "linear-gradient(90deg, #a8edea 0%, #fed6e3 100%)", // pastel blue-pink
            color: "#333",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 600,
            fontSize: 16,
            cursor: loading || !question.trim() ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px rgba(180,180,255,0.07)",
            transition: "background 0.2s, box-shadow 0.2s",
            opacity: loading || !question.trim() ? 0.6 : 1,
            marginLeft: 4,
        }}
        >
        {loading ? "Searching..." : "Ask"}
        </button>
      </form>
      {error && <div style={{ color: "red", margin: "12px 0" }}>{error}</div>}

      {finalAnswer && (
        <div style={{ marginTop: 24, background: "#f3f7fa", padding: 16, borderRadius: 8 }}>
          <b>Answer:</b>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{finalAnswer}</div>
        </div>
      )}

      {(dbResults.length > 0 || webResults.length > 0) && (
        <div style={{ marginTop: 32 }}>
          {dbResults.length > 0 && (
            <>
              <h4>Top DB Results:</h4>
              <ol>
                {dbResults.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, color: "#555" }}>
                      <b>Score:</b> {item.similarity?.toFixed(3) ?? "N/A"}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 8 }}>
                      {item.text}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
          {webResults.length > 0 && (
            <>
              <h4>Top Web Results:</h4>
              <ol>
                {webResults.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, color: "#555" }}>
                      <b>Source:</b> {item.url || item.title || "N/A"}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 8 }}>
                      {item.snippet || item.content || ""}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatbotTBTest;