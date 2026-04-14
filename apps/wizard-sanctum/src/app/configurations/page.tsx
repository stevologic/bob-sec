// Wizard's Sanctum - Configurations Page
'use client';

import { useState, useEffect } from 'react';
import { logPageAction, getPageSettings, setPageSetting } from '@/lib/page-manager';

interface ConfigurationsState {
  globalSettings: Record<string, string>;
  loading: boolean;
  error: string | null;
  success: string | null;
}

export default function ConfigurationsPage() {
  const [globalSettings, setGlobalSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getPageSettings('configurations');
      setGlobalSettings(settings);
      await logPageAction('configurations', 'settings_loaded', JSON.stringify(settings));
    };

    loadSettings();
  }, []);

  const handleSaveAll = async () => {
    setLoading(true);
    setError(null);
    setSuccess('Saving all configurations...');

    const saveTasks: Promise<void>[] = [];

    for (const [key, value] of Object.entries(globalSettings)) {
      saveTasks.push(setPageSetting('configurations', key, value));
    }

    await Promise.all(saveTasks);

    setSuccess('All configurations saved successfully!');
    setError(null);

    await logPageAction('configurations', 'settings_saved', JSON.stringify(globalSettings));

    setTimeout(() => setSuccess(''), 3000);
    setLoading(false);
  };

  const handleIndividualSave = async (key: string, value: string) => {
    await setPageSetting('configurations', key, value);
    await logPageAction('configurations', 'setting_updated', `${key}=${value}`);
  };

  const handleDelete = async (key: string) => {
    if (!window.confirm(`Delete configuration "${key}"?`)) return;

    await setPageSetting('configurations', key, '');
    await logPageAction('configurations', 'setting_deleted', key);
    
    setSuccess(`${key} deleted`);
    await new Promise((r) => setTimeout(r, 1000));
    setSuccess('');
  };

  const categories = [
    { name: 'General', keys: ['page.active', 'page.title', 'page.description'] },
    { name: 'OpenAI', keys: ['openai.api.key', 'openai.model', 'openai.temperature'] },
    { name: 'GitHub', keys: ['github.token', 'github.repo', 'github.branch'] },
    { name: 'OpenClaw', keys: ['openclaw.ws.url', 'openclaw.secret', 'openclaw.enabled'] },
    { name: 'Database', keys: ['db.driver', 'db.path', 'db.pool.size'] },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-gray-200 mb-2">Wizard's Sanctum</h1>
          <p className="text-2xl text-gray-400">Configurations • Master Controls</p>
        </header>

        <div className="bg-gray-950/50 border border-gray-700 rounded-xl p-8">
          {/* Stats */}
          <div className="mb-8">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900 rounded-lg p-6 text-center">
                <div className="text-sm text-gray-400 mb-2">Total Settings</div>
                <div className="text-3xl font-bold text-gray-200">{Object.keys(globalSettings).length}</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-6 text-center">
                <div className="text-sm text-gray-400 mb-2">OpenAI</div>
                <div className="text-3xl font-bold text-emerald-400">Connected</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-6 text-center">
                <div className="text-sm text-gray-400 mb-2">GitHub</div>
                <div className="text-3xl font-bold text-blue-400">
                  {globalSettings['github.token'] ? 'Connected' : 'Not Configured'}
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-6 text-center">
                <div className="text-sm text-gray-400 mb-2">OpenClaw</div>
                <div className="text-3xl font-bold text-purple-400">
                  {globalSettings['openclaw.enabled'] ? 'Connected' : 'Not Configured'}
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.name} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-200 mb-4">{category.name}</h2>
                <div className="grid gap-4">
                  {category.keys.map((key) => {
                    const keyName = key.replace(/_/g, ' ');
                    const value = globalSettings[key] || '';
                    const hidden = key.includes('.key') || key.includes('.secret');

                    return (
                      <div
                        key={key}
                        className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-4"
                      >
                        <span className="text-gray-400 font-mono">{key}:</span>
                        {!hidden ? (
                          <>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleIndividualSave(key, e.target.value)}
                              className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                              placeholder={value || '...'}
                            />
                          </>
                        ) : (
                          <span className="text-gray-500 font-mono">{value ? '***' : '...'}</span>
                        )}
                        {!hidden && (
                          <button
                            onClick={() => handleDelete(key)}
                            className="px-3 py-2 bg-red-900 text-red-200 rounded-lg hover:bg-red-800 transition-all font-bold text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="flex-1 py-4 bg-gray-700 text-gray-200 rounded-lg font-bold text-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save All Configurations'}
            </button>
            <button
              onClick={() => {
                setGlobalSettings({});
                setSuccess('All configurations cleared');
                await logPageAction('configurations', 'settings_cleared', '');
                await new Promise((r) => setTimeout(r, 1000));
                setSuccess('');
              }}
              className="px-6 py-4 bg-red-900 text-red-200 rounded-lg font-bold hover:bg-red-800 transition-all"
            >
              Clear All
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-6 bg-red-900/50 border border-red-800 rounded-lg p-4">
              <div className="text-red-300 font-bold">Error: {error}</div>
            </div>
          )}

          {success && (
            <div className="mt-6 bg-green-900/50 border border-green-800 rounded-lg p-4">
              <div className="text-green-300 font-bold">{success}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
