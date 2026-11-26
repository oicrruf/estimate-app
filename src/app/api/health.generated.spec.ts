import { health } from './health.generated';

describe('health client', () => {
  it('accepts the frozen health response', async () => {
    const fetcher = async () => new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
    await expect(health('https://example.test/', fetcher as typeof fetch)).resolves.toEqual({ status: 'ok' });
  });
  it('rejects a malformed response', async () => {
    const fetcher = async () => new Response(JSON.stringify({ status: 'down' }), { status: 200 });
    await expect(health('https://example.test/', fetcher as typeof fetch)).rejects.toThrow('Invalid health response');
  });
  it('rejects an HTTP error', async () => {
    const fetcher = async () => new Response('', { status: 503 });
    await expect(health('https://example.test/', fetcher as typeof fetch)).rejects.toThrow('503');
  });
});
