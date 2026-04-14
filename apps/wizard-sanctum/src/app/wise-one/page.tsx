// Wizard's Sanctum - Wise One Page
'use client';

import { useState, useEffect } from 'react';
import { logPageAction, setPageSetting } from '@/lib/page-manager';
import { chatWithOpenAI, generateContent } from '@/lib/openai';

interface WiseOneState {
  question: string;
  advice: string;
  confidence: number;
  wisdom: string;
  actions: string[];
  loading: boolean;
  error: string | null;
}

export default function WiseOnePage() {
  const [question, setQuestion] = useState<string>('');
  const [advice, setAdvice] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [wisdom, setWisdom] = useState<string>('');
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeekWisdom = async () => {
    if (!question.trim()) {
      setError('Please state your question');
      return;
    }

    try {
      setLoading(true);
      setAdvice('Seeking wisdom...');
      setConfidence(0);
      setWisdom('');
      setActions([]);
      setError(null);

      const response = await chatWithOpenAI([{
        role: 'user',
        content: `You are Wise One, an ancient oracle with centuries of wisdom. Ask me for guidance on:\n\n${question}`
      }]);

      const adviceLines = response.split('\n');
      const advicePart = adviceLines[0];
      const wisdomPart = adviceLines[1];
      const actionsPart = adviceLines.slice(2);

      setAdvice(advicePart);
      setConfidence(advicePart.match(/\((\d+)%\)/) ? parseInt(advicePart.match(/\((\d+)%\)/)![1]) : 75);
      setWisdom(wisdomPart || 'Wisdom flows freely.');
      setActions(actionsPart.map(line => line.trim()) as string[]);

      await logPageAction('wise_one', 'seek_wisdom', question);
    } catch (e) {
      console.error('Seeking wisdom failed:', e);
      setError('Wisdom connection failed');
      await logPageAction('wise_one', 'seek_wisdom', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdvice = async (topic: string) => {
    const prompt = `Give me quick wisdom on ${topic}. Include: your advice, your confidence % and one actionable wisdom.`;
    
    try {
      setLoading(true);
      const response = await chatWithOpenAI([{ role: 'user', content: prompt }]);
      
      const lines = response.split('\n');
      const advice = lines[0].trim();
      const confidenceMatch = lines[1].match(/\((\d+)%\)/);
      const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 75;
      const wisdomLine = lines[2].trim();
      const wisdom = wisdomLine.includes('%') ? lines[3].trim() : wisdomLine;
      const actions = lines.slice(4).filter(line => line.trim());

      setAdvice(advice);
      setConfidence(confidence);
      setWisdom(wisdom);
      setActions(actions as string[]);

      await logPageAction('wise_one', 'quick_advice', `${topic}: ${advice}`);
    } catch (e) {
      console.error('Quick advice failed:', e);
      setError('Quick wisdom failed');
      await logPageAction('wise_one', 'quick_advice', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-purple-900 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-emerald-200 mb-2">Wizard's Sanctum</h1>
          <p className="text-2xl text-emerald-300">Wise One • Ancient Wisdom</p>
        </header>

        <div className="bg-gray-900/80 border border-emerald-700 rounded-2xl p-8 backdrop-blur-sm">
          {/* Quick Advice Buttons */}
          <div className="mb-8">
            <label className="block text-emerald-200 mb-4">Quick Wisdom</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Business', 'Technology', 'Health', 'Creativity', 'Finance', 'Strategy'].map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleQuickAdvice(topic)}
                  disabled={loading}
                  className={`px-4 py-3 bg-emerald-800 text-emerald-200 rounded-lg font-bold hover:bg-emerald-700 transition-all ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Full Question Input */}
          <div className="mb-8">
            <label className="block text-emerald-200 mb-4">State Your Question to Wise One</label>
            <textarea
              className="w-full h-32 bg-gray-950 border border-emerald-800 rounded-lg p-4 text-emerald-300 font-mono text-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Your question to the ancient wise one..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLTextAreaElement).blur()}
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleSeekWisdom}
            disabled={loading}
            className="w-full py-5 bg-emerald-600 text-white rounded-lg font-bold text-xl hover:bg-emerald-500 transition-all mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Seeking Wisdom...' : 'Ask Wise One for Guidance'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mb-8 text-red-400 text-center text-xl font-bold">
              ⚠️ Error: {error}
            </div>
          )}

          {/* Wisdom Result */}
          {advice && (
            <div className="bg-gradient-to-b from-emerald-900/50 to-purple-900/50 border border-emerald-700 rounded-xl p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h2 className="text-3xl font-bold text-emerald-200 mb-6">Wisdom Revealed</h2>
                  <div className="bg-emerald-950/50 rounded-lg p-6 font-mono text-xl leading-relaxed text-emerald-200 whitespace-pre-line border border-emerald-800">
                    {advice}
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-emerald-300 mb-2">Confidence</label>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-emerald-400">{confidence}%</span>
                      <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-emerald-300 mb-2">Ancient Wisdom</label>
                    <div className="bg-purple-950/50 rounded-lg p-4 text-purple-200 font-mono text-lg leading-relaxed border border-purple-800">
                      {wisdom}
                    </div>
                  </div>
                  <div>
                    <label className="block text-emerald-300 mb-2">Actionable Wisdom</label>
                    <div className="bg-emerald-950/50 rounded-lg p-4 font-mono text-emerald-200 leading-relaxed border border-emerald-800 space-y-2">
                      {actions.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="text-emerald-400 mt-1">•</span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
