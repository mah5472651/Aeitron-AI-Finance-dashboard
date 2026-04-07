/**
 * Model-agnostic AI client utility.
 *
 * Switch providers by changing VITE_ACTIVE_AI_PROVIDER in .env.
 * Supported: openai, anthropic, gemini, deepseek, local
 */

const PROVIDER_CONFIG = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: (model, systemPrompt, messages) => ({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
    parseResponse: (data) => data.choices?.[0]?.message?.content ?? '',
  },

  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    }),
    buildBody: (model, systemPrompt, messages) => ({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    }),
    parseResponse: (data) =>
      data.content?.map((b) => b.text).join('') ?? '',
  },

  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
    model: 'gemini-2.0-flash',
    buildHeaders: () => ({ 'Content-Type': 'application/json' }),
    buildBody: (_model, systemPrompt, messages) => ({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    }),
    buildUrl: (baseUrl, model, apiKey) =>
      `${baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta'}/models/${model}:generateContent?key=${apiKey}`,
    parseResponse: (data) =>
      data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '',
  },

  deepseek: {
    url: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: (model, systemPrompt, messages) => ({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
    parseResponse: (data) => data.choices?.[0]?.message?.content ?? '',
  },

  local: {
    url: 'http://localhost:1234/v1/chat/completions',
    model: 'local-model',
    buildHeaders: () => ({ 'Content-Type': 'application/json' }),
    buildBody: (model, systemPrompt, messages) => ({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
    parseResponse: (data) => data.choices?.[0]?.message?.content ?? '',
  },
};

/**
 * Send a message to the active AI provider.
 *
 * @param {string} systemPrompt - The agent's system prompt
 * @param {Array<{role: string, content: string}>} messages - Conversation history
 * @returns {Promise<string>} The assistant's reply text
 */
export async function sendAgentMessage(systemPrompt, messages) {
  const provider = (import.meta.env.VITE_ACTIVE_AI_PROVIDER || 'openai').toLowerCase();
  const apiKey = import.meta.env.VITE_AI_API_KEY || '';
  const baseUrl = import.meta.env.VITE_AI_BASE_URL || '';

  const config = PROVIDER_CONFIG[provider];
  if (!config) {
    throw new Error(`Unknown AI provider: "${provider}". Supported: ${Object.keys(PROVIDER_CONFIG).join(', ')}`);
  }

  if (!apiKey && provider !== 'local') {
    throw new Error('VITE_AI_API_KEY is not set. Add it to your .env file.');
  }

  const model = config.model;

  // Build URL — Gemini uses a custom URL builder, others use config.url or baseUrl override
  let url;
  if (config.buildUrl) {
    url = config.buildUrl(baseUrl || null, model, apiKey);
  } else {
    url = baseUrl || config.url;
  }

  const headers = config.buildHeaders(apiKey);
  const body = config.buildBody(model, systemPrompt, messages);

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'Unknown error');
    throw new Error(`AI API error (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  return config.parseResponse(data);
}

export function getActiveProvider() {
  return (import.meta.env.VITE_ACTIVE_AI_PROVIDER || 'openai').toLowerCase();
}

export function isConfigured() {
  const provider = getActiveProvider();
  const apiKey = import.meta.env.VITE_AI_API_KEY || '';
  return provider === 'local' || !!apiKey;
}
