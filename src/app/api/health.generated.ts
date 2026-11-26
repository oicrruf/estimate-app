// Generated from contracts/openapi.json. Do not edit by hand.
export type HealthResponse = { status: 'ok' };

export async function health(baseUrl: string, fetcher: typeof fetch = fetch): Promise<HealthResponse> {
  const response = await fetcher(new URL('/health', baseUrl));
  if (!response.ok) throw new Error(`Health request failed: ${response.status}`);
  const body: unknown = await response.json();
  if (typeof body !== 'object' || body === null || Array.isArray(body) || Object.keys(body).length !== 1 || !('status' in body) || body.status !== 'ok') {
    throw new Error('Invalid health response');
  }
  return { status: 'ok' };
}
