// Wizard's Sanctum - Office Page
'use client';

import { useState, useEffect } from 'react';
import { logPageAction, setPageSetting } from '@/lib/page-manager';
import { chatWithOpenAI } from '@/lib/openai';
import { initializeOpenClaw, publishEvent } from '@/lib/openclaw';
import { checkRecentActivity, getRepoInfo } from '@/lib/github';

interface OfficeState {
  codeSnippet: string;
  analysis: string;
  vulnerabilities: string[];
  improvements: string[];
  repository: {
    name: string;
    description: string;
    lastUpdated: string;
  };
}

export default function OfficePage() {
  const [activeTab, setActiveTab] = useState<'code' | 'analysis' | 'integrations'>('code');
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [vulnerabilities, setVulnerabilities] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [repository, setRepository] = useState<{
    name: string;
    description: string;
    lastUpdated: string;
  } | null>(null);
  const [ocConnected, setOcConnected] = useState(false);
  const [ocError, setOcError] = useState<string | null>(null);

  const OC_LIVE_URL = 'http://192.168.1.232:8501';

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getPageSettings('office');
      if (settings.repository) {
        setRepository({
          name: settings.repository.name || 'wizard-sanctum',
          description: settings.repository.description || 'Wizard\'s Code Repository',
          lastUpdated: settings.repository.lastUpdated || 'Never',
        });
      }
    };

    loadSettings();

    // Subscribe to OpenClaw
    const initOc = async () => {
      try {
        const conn = await initializeOpenClaw();
        conn.connected = true;
        setOcConnected(true);
        setOcError(null);

        // Subscribe to workspace events
        conn.ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event?.type === 'file_change') {
              await loadSettings();
            }
          } catch (e) {
            console.error('OpenClaw message parse error:', e);
          }
        };
      } catch (e) {
        console.error('Failed to initialize OpenClaw:', e);
        setOcError('OpenClaw connection failed');
      }
    };

    initOc();
  }, []);

  const handleAnalyzeCode = async () => {
    if (!codeSnippet.trim()) return;

    try {
      const result = await chatWithOpenAI([
        { role: 'user', content: `Analyze this code for vulnerabilities and suggest improvements:\n\n${codeSnippet}` },
      ]);

      setAnalysis(result);

      // Parse vulnerabilities and improvements from response
      const vulnMatch = result.match(/Vulnerabilities:\s*(.+)/i);
      const implMatch = result.match(/Improvements:\s*(.+)/i);

      setVulnerabilities(vulnMatch ? [vulnMatch[1]] : []);
      setImprovements(implMatch ? [implMatch[1]] : []);

      await logPageAction('office', 'code_analysis', `Analyzed code snippet`);
      publishEvent('office', { type: 'code_analyzed', snippetLength: codeSnippet.length });

    } catch (e) {
      console.error('Analysis failed:', e);
      setAnalysis('Analysis failed. Please try again.');
    }
  };

  const handleRepositoryLoad = async () => {
    const repoName = repository?.name || 'wizard-sanctum';
    const repoDesc = repository?.description || 'Wizard\'s Code Repository';
    const lastUpdated = repository?.lastUpdated || 'Never';

    if (!repoName || !repoDesc) {
      setRepository({
        name: 'wizard-sanctum',
        description: 'Wizard\'s Code Repository',
        lastUpdated: 'Never',
      });
      await logPageAction('office', 'repo_load', 'Using default values');
      return;
    }

    try {
      const info = await getRepoInfo('wizard-sanctum', 'wizard-sanctum');
      setRepository(info);
      await logPageAction('office', 'repo_load', `Loaded info for ${repoName}`);
    } catch (e) {
      console.error('Failed to load repository:', e);
      setRepository({
        name: 'wizard-sanctum',
        description: 'Wizard\'s Code Repository',
        lastUpdated: 'Never',
      });
      await logPageAction('office', 'repo_load', 'Failed to load repository');
    }
  };

  const handleSaveConfig = async (key: string, value: string) => {
    await setPageSetting('office', key, value);
    await logPageAction('office', 'config_save', `${key}=${value}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">Wizard's Sanctum</h1>
          <p className="text-2xl text-gray-300">Office • {repository?.name || 'wizard-sanctum'}</p>
          <div className="mt-4 flex gap-4">
            <span className="px-4 py-2 bg-purple-800 text-purple-200 rounded-lg">
              OpenClaw: {ocConnected ? '✅ Connected' : '❌ Disconnected'}
            </span>
            <span className="px-4 py-2 bg-blue-800 text-blue-200 rounded-lg">
              OpenAI: Ready
            </span>
            <span className="px-4 py-2 bg-green-800 text-green-200 rounded-lg">
              GitHub: {repository ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {ocError && (
            <div className="mt-2 text-red-300">Error: {ocError}</div>
          )}
        </header>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-6 py-3 rounded-lg transition-all ${
                activeTab === 'code'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-purple-800 text-purple-200 hover:bg-purple-700'
              }`}
            >
              Code Snippet
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-3 rounded-lg transition-all ${
                activeTab === 'analysis'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-purple-800 text-purple-200 hover:bg-purple-700'
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`px-6 py-3 rounded-lg transition-all ${
                activeTab === 'integrations'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-purple-800 text-purple-200 hover:bg-purple-700'
              }`}
            >
              Integrations
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Magic Code</h2>
              <textarea
                className="w-full h-96 bg-gray-900 text-purple-300 rounded-lg p-4 font-mono text-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={`Paste your ${repository?.description || 'Wizard\'s Code Repository'} code here...`}
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
              />
              <div className="mt-4">
                <button
                  onClick={handleAnalyzeCode}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-500 transition-all flex items-center gap-2"
                >
                  <span>🔮</span> Analyze Code
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Repository Info</h2>
              <div className="bg-gray-900 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                  <span className="text-gray-400">Repository Name:</span>
                  <span className="text-purple-300 font-mono">{repository?.name || 'wizard-sanctum'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                  <span className="text-gray-400">Description:</span>
                  <span className="text-purple-300">{repository?.description || 'Wizard\'s Code Repository'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="text-purple-300">{repository?.lastUpdated || 'Never'}</span>
                </div>
                <button
                  onClick={handleRepositoryLoad}
                  className="mt-4 px-4 py-2 bg-purple-700 text-purple-200 rounded-lg hover:bg-purple-600 transition-all"
                >
                  Refresh Repository Info
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {analysis ? (
              <>
                {vulnerabilities.length > 0 && (
                  <div className="bg-red-900/50 border border-red-800 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-red-200 mb-4">⚠️ Vulnerabilities Found</h2>
                    <div className="bg-gray-800 rounded-lg p-4 whitespace-pre-line text-gray-200">
                      {vulnerabilities.join('\n')}
                    </div>
                  </div>
                )}
                {improvements.length > 0 && (
                  <div className="bg-green-900/50 border border-green-800 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-green-200 mb-4">💡 Suggested Improvements</h2>
                    <div className="bg-gray-800 rounded-lg p-4 whitespace-pre-line text-gray-200">
                      {improvements.join('\n')}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-400">
                Analyze a code snippet to see vulnerabilities and improvements
              </div>
            )}
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Configuration</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2">Repository Name</label>
                    <input
                      type="text"
                      value={repository?.name || 'wizard-sanctum'}
                      onChange={(e) => handleSaveConfig('repository.name', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">Repository Description</label>
                    <input
                      type="text"
                      value={repository?.description || 'Wizard\'s Code Repository'}
                      onChange={(e) => handleSaveConfig('repository.description', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Last Updated</label>
                  <input
                    type="text"
                    value={repository?.lastUpdated || 'Never'}
                    onChange={(e) => handleSaveConfig('repository.lastUpdated', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
              <div className="bg-gray-900 rounded-lg p-4 text-gray-300">
                <p className="text-sm">No recent activity logged to database.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
