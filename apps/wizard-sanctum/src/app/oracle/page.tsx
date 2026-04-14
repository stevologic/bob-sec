// Wizard's Sanctum - Oracle Page
'use client';

import { useState, useEffect } from 'react';
import { logPageAction, getPageSettings } from '@/lib/page-manager';
import { chatWithOpenAI, generateContent, analyzeCode, summarizePage } from '@/lib/openai';
import { checkRecentActivity } from '@/lib/github';
import { logToDB } from '@/lib/db';

interface OracleState {
  query: string;
  result: string;
  analysisComplete: boolean;
  mode: 'consultation' | 'code_review' | 'summarization';
}

export default function OraclePage() {
  const [query, setQuery] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [mode, setMode] = useState<OracleState['mode']>('consultation');
  const [error, setError] = useState<string | null>(null);

  const handleConsultation = async () => {
    if (!query.trim()) {
      setError('Please enter your query');
      return;
    }

    try {
      setResult('Consulting the Oracle...');
      setAnalysisComplete(false);
      setError(null);

      const response = await chatWithOpenAI([{
        role: 'user',
        content: `Act as an Oracle. Consult with wisdom using this query:\n\n${query}`
      }]);

      setResult(response);
      setAnalysisComplete(true);
      await logPageAction('oracle', 'consultation', query);
    } catch (e) {
      console.error('Oracle consultation failed:', e);
      setError('Oracle connection failed');
      await logPageAction('oracle', 'consultation', 'Error');
    }
  };

  const handleCodeReview = async () => {
    if (!query.trim()) {
      setError('Please enter the code to review');
      return;
    }

    try {
      setResult('Reviewing code...');
      setAnalysisComplete(false);
      setError(null);

      const result = await analyzeCode({
        code: query,
        language: 'javascript'
      });

      setResult(result);
      setAnalysisComplete(true);
      await logPageAction('oracle', 'code_review', 'Analyzed code');
    } catch (e) {
      console.error('Code review failed:', e);
      setError('Code review failed');
      await logPageAction('oracle', 'code_review', 'Error');
    }
  };

  const handleSummary = async () => {
    if (!query.trim()) {
      setError('Please enter content to summarize');
      return;
    }

    try {
      setResult('Summarizing...');
      setAnalysisComplete(false);
      setError(null);

      const result = await summarizePage({
        content: query
      });

      setResult(result);
      setAnalysisComplete(true);
      await logPageAction('oracle', 'summarization', 'Generated summary');
    } catch (e) {
      console.error('Summary generation failed:', e);
      setError('Summary generation failed');
      await logPageAction('oracle', 'summarization', 'Error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-orange-200 mb-2">Wizard's Sanctum</h1>
          <p className="text-2xl text-orange-300">Oracle • The Eyes of Wisdom</p>
        </header>

        <div className="bg-orange-800/50 border border-orange-700 rounded-xl p-8">
          <div className="mb-6">
            <label className="block text-orange-200 mb-4">Oracle's Eyes</label>
            <textarea
              className="w-full h-48 bg-gray-900 border border-orange-800 rounded-lg p-4 text-orange-300 font-mono text-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Consult the Oracle... (Type your query here and press Enter)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLTextAreaElement).blur()}
            />
          </div>

          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setMode('consultation')}
                className={`px-6 py-3 rounded-lg transition-all font-bold ${
                  mode === 'consultation'
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-800 text-orange-200'
                }`}
              >
                🔮 Consultation
              </button>
              <button
                onClick={() => setMode('code_review')}
                className={`px-6 py-3 rounded-lg transition-all font-bold ${
                  mode === 'code_review'
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-800 text-orange-200'
                }`}
              >
                💻 Code Review
              </button>
              <button
                onClick={() => setMode('summarization')}
                className={`px-6 py-3 rounded-lg transition-all font-bold ${
                  mode === 'summarization'
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-800 text-orange-200'
                }`}
              >
                📝 Summarization
              </button>
            </div>

            <button
              onClick={mode === 'consultation' ? handleConsultation : mode === 'code_review' ? handleCodeReview : handleSummary}
              className="px-8 py-4 bg-orange-600 text-white rounded-lg font-bold text-xl hover:bg-orange-500 transition-all"
            >
              {mode === 'consultation' ? 'Consult Oracle' : mode === 'code_review' ? 'Review Code' : 'Generate Summary'}
            </button>
          </div>

          {error && (
            <div className="mb-6 text-red-300 text-center text-xl font-bold">
              ⚠️ Error: {error}
            </div>
          )}

          {analysisComplete && result && (
            <div className="bg-gray-900 border border-orange-800 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-orange-200 mb-6 text-center">
                Oracle's Vision Revealed
              </h2>
              <div className="bg-orange-900/50 rounded-lg p-6 font-mono text-xl leading-relaxed text-orange-200 whitespace-pre-line">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
