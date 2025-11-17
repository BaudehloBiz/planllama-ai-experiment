import { useState, FormEvent, ChangeEvent, useMemo, useEffect } from "react";
import "./App.css";
import { PlanLlama } from "planllama/src/client.ts";
import { runAgent } from "./agent/agent";

interface LogEntry {
  message: string;
  type: 'info' | 'action' | 'result' | 'error';
  timestamp: string;
}

interface Result {
  id: number;
  input: string;
  output: string;
  timestamp: string;
  error?: string;
  logs: LogEntry[];
}

function App() {
  const [inputText, setInputText] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const apiToken = import.meta.env.VITE_PLANLLAMA_API_TOKEN;

  useEffect(() => {
    console.log(
      "API Token:",
      apiToken ? `${apiToken.substring(0, 20)}...` : "NOT SET"
    );
  }, [apiToken]);

  if (!apiToken) {
    console.warn(
      "PlanLlama API token not found. Please set VITE_PLANLLAMA_API_TOKEN in your .env file"
    );
  }

  const planLlama = useMemo(() => {
    try {
      const client = new PlanLlama({
        apiToken: apiToken || "",
        serverUrl: "http://localhost:8000",
      });
      console.log(
        `PlanLlama client initialized with serverUrl: http://localhost:8000" and apiToken: ${apiToken?.substring(
          0,
          20
        )}...`
      );
      return client;
    } catch (error) {
      console.error("Failed to initialize PlanLlama:", error);
      return null;
    }
  }, [apiToken]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      if (!planLlama) {
        alert("PlanLlama failed to initialize. Check the console for errors.");
        return;
      }

      setIsLoading(true);
      const resultId = Date.now();
      const timestamp = new Date().toLocaleString();

      const initialResult: Result = {
        id: resultId,
        input: inputText,
        output: "",
        timestamp,
        logs: [],
      };

      setResults((prev) => [initialResult, ...prev]);
      setInputText("");

      const appendLog = (message: string, type: LogEntry["type"]) => {
        const entry: LogEntry = {
          message,
          type,
          timestamp: new Date().toLocaleTimeString(),
        };
        setResults((prev) =>
          prev.map((result) =>
            result.id === resultId
              ? { ...result, logs: [...result.logs, entry] }
              : result
          )
        );
      };

      appendLog("Agent run started", "info");
      appendLog("Connecting to PlanLlama...", "info");

      await planLlama.start();

      appendLog("PlanLlama connection established", "info");

      try {
        // Run the agent with the user's input
        const agentOutput = await runAgent(
          planLlama,
          inputText,
          {},
          (message, type) => appendLog(message, type)
        );

        setResults((prev) =>
          prev.map((result) =>
            result.id === resultId
              ? {
                  ...result,
                  output: agentOutput,
                  error: undefined,
                  timestamp: new Date().toLocaleString(),
                }
              : result
          )
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        appendLog(`Error encountered: ${errorMessage}`, "error");

        setResults((prev) =>
          prev.map((result) =>
            result.id === resultId
              ? {
                  ...result,
                  output: "",
                  error: errorMessage,
                  timestamp: new Date().toLocaleString(),
                }
              : result
          )
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  return (
    <>
      <h1>PlanLlama AI Experiment</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <textarea
            value={inputText}
            onChange={handleTextChange}
            placeholder="Enter your text here..."
            rows={6}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "1em",
              fontFamily: "inherit",
              borderRadius: "8px",
              border: "1px solid #646cff",
              backgroundColor: "#1a1a1a",
              color: "inherit",
              resize: "vertical",
              marginBottom: "1em",
            }}
          />
          <button type="submit" disabled={isLoading || !inputText.trim()}>
            {isLoading ? "Processing..." : "Submit"}
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <div className="results">
          <h2>Results</h2>
          {results.map((result) => (
            <div key={result.id} className="result-item">
              <div className="result-timestamp">{result.timestamp}</div>
              <div className="result-section">
                <strong>Input:</strong>
                <div className="result-content">{result.input}</div>
              </div>
              {result.logs.length > 0 && (
                <div className="result-section">
                  <strong>Execution Log:</strong>
                  <div className="result-logs">
                    {result.logs.map((log, idx) => (
                      <div key={idx} className={`log-entry log-${log.type}`}>
                        <span className="log-time">[{log.timestamp}]</span>
                        <span className="log-type">[{log.type.toUpperCase()}]</span>
                        <span className="log-message">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.error ? (
                <div className="result-section error">
                  <strong>Error:</strong>
                  <div className="result-content">{result.error}</div>
                </div>
              ) : (
                <div className="result-section">
                  <strong>Final Output:</strong>
                  <div className="result-content">{result.output}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default App;
