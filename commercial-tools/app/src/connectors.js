const TOOLS = {
  listAccounts: ['GET', '/linkedin/accounts', 'list-linkedin-accounts'],
  searchPeople: ['POST', '/search/people', 'search-people'],
  getConnections: ['POST', '/connections', 'get-connections'],
  listConversations: ['POST', '/messaging/conversations', 'list-conversations'],
  getConversationMessages: ['POST', '/messaging/conversation/messages', 'get-conversation-messages'],
  conversationExists: ['POST', '/messaging/conversation/exists', 'conversation-exists'],
  sendConnectionRequest: ['POST', '/connections/request', 'send-connection-request'],
  sendMessage: ['POST', '/messaging/conversations/send', 'conversations-send-message']
};

export class ConnectorError extends Error {
  constructor(message, details = {}) { super(message); this.name = 'ConnectorError'; Object.assign(this, details); }
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function guardedCall(operation, { timeoutMs = 25000, retries = 1, retryIf = () => true } = {}) {
  const errors = [];
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);
    try { return await operation(controller.signal, attempt); }
    catch (error) { errors.push(error); if (attempt === retries || !retryIf(error)) throw new ConnectorError(error.message || 'Connector call failed', { cause: error, attempts: errors }); await wait(600 * (attempt + 1)); }
    finally { clearTimeout(timer); }
  }
}

function readMcpPayload(result) {
  if (result?.isError) throw new ConnectorError(result.content?.[0]?.text || 'MCP tool failed', { result });
  if (result?.payload !== undefined) return result.payload;
  if (result?.structuredContent) return result.structuredContent;
  const text = result?.content?.[0]?.text;
  if (text) { try { return JSON.parse(text); } catch { return { text }; } }
  return result || {};
}

export function createRestConnector({ baseUrl, apiKey, fetchImpl = fetch, timeoutMs = 25000 }) {
  if (!baseUrl) throw new ConnectorError('ConnectSafely API base URL is required');
  const root = baseUrl.replace(/\/$/, '');
  async function call(name, input = {}) {
    const [method, path] = TOOLS[name] || [];
    if (!path) throw new ConnectorError(`Unknown connector method: ${name}`);
    return guardedCall(async signal => {
      const url = new URL(root + path);
      if (method === 'GET') Object.entries(input).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));
      const response = await fetchImpl(url, { method, signal, headers: { Accept: 'application/json', ...(method !== 'GET' ? { 'Content-Type': 'application/json' } : {}), ...(apiKey ? { Authorization: `Bearer ${apiKey}`, 'X-API-Key': apiKey } : {}) }, ...(method !== 'GET' ? { body: JSON.stringify(input) } : {}) });
      const body = await response.text(); let data; try { data = body ? JSON.parse(body) : {}; } catch { data = { text: body }; }
      if (!response.ok) throw new ConnectorError(`ConnectSafely ${response.status}: ${data.message || data.error || body || response.statusText}`, { status: response.status, data });
      return data;
    }, { timeoutMs, retries: 1, retryIf: error => error.name === 'AbortError' || error.status === 502 || /CONNECTIONS_UNAVAILABLE|server_unavailable|network|fetch/i.test(error.message) });
  }
  return Object.fromEntries(Object.keys(TOOLS).map(name => [name, input => call(name, input)]));
}

export async function createMcpConnector({ timeoutMs = 25000 } = {}) {
  if (!globalThis.window?.claude?.use) throw new ConnectorError('Claude MCP bridge is unavailable');
  const mcp = await guardedCall(() => window.claude.use('mcp'), { timeoutMs: 9000, retries: 0 });
  if (!mcp) throw new ConnectorError('ConnectSafely.AI is not granted to this artifact');
  const call = (name, input = {}) => guardedCall(() => mcp.callTool('ConnectSafely.AI', TOOLS[name][2], input, { cache: false }).then(readMcpPayload), { timeoutMs, retries: 1 });
  return Object.fromEntries(Object.keys(TOOLS).map(name => [name, input => call(name, input)]));
}

export async function createConnector(settings) {
  if (settings.connectorMode === 'mcp') return createMcpConnector(settings);
  return createRestConnector({ baseUrl: settings.apiBaseUrl, apiKey: sessionStorage.getItem('connectsafely_api_key') || '', timeoutMs: settings.timeoutMs });
}

export const gmailConnector = Object.freeze({ enabled: false, searchThreads: async () => { throw new ConnectorError('Gmail is disabled in v1'); }, createDraft: async () => { throw new ConnectorError('Gmail is disabled in v1'); } });
