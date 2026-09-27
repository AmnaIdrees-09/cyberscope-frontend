"use client";

import { useState } from "react";

export default function Home() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const API_BASE = "http://127.0.0.1:8000/api";

  async function handleInvestigate() {
    if (!domain.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/investigate/${domain}`);
      if (!response.ok) throw new Error("Investigation failed");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Could not investigate this domain. Check that it's valid and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">CyberScope</h1>
        <p className="text-gray-400 mb-8">Automated domain security investigation</p>

        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvestigate()}
            placeholder="example.com"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleInvestigate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? "Investigating..." : "Investigate"}
          </button>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-200 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">DNS Records — {result.domain}</h2>

            <div className="mb-6">
              <h3 className="text-sm text-gray-400 mb-2">Findings</h3>
              <div className="space-y-2">
                {result.findings?.map((f: any, i: number) => (
                  <div key={i} className="flex gap-2 items-start text-sm">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                        f.severity === "critical"
                          ? "bg-red-950 text-red-300"
                          : f.severity === "warning"
                          ? "bg-yellow-950 text-yellow-300"
                          : "bg-blue-950 text-blue-300"
                      }`}
                    >
                      {f.severity}
                    </span>
                    <span className="text-gray-300">{f.message}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-2">Records</h3>
              <pre className="text-xs text-gray-400 bg-gray-950 rounded-lg p-4 overflow-x-auto">
                {JSON.stringify(result.records, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}