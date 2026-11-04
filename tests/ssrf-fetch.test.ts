import { fetchValidated, SsrfError } from '../src/services/ssrf'

// Minimal Response-shaped stubs: the rule under test is which URLs get fetched,
// not the Response implementation, and this keeps the test env-independent.
function redirect(location: string): Response {
  return { status: 302, headers: { get: () => location } } as unknown as Response
}

function ok(): Response {
  return { status: 200, headers: { get: () => null } } as unknown as Response
}

describe('fetchValidated (redirect-aware SSRF guard)', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('refuses a private address without making the request', async () => {
    const spy = jest.spyOn(globalThis, 'fetch')
    await expect(fetchValidated('http://169.254.169.254/latest/meta-data/')).rejects.toBeInstanceOf(SsrfError)
    expect(spy).not.toHaveBeenCalled()
  })

  it('follows a redirect to a public host', async () => {
    const spy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(redirect('https://cdn.example.com/file.bin'))
      .mockResolvedValueOnce(ok())

    const res = await fetchValidated('https://example.com/x')
    expect(res.status).toBe(200)
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('refuses a redirect pointing at the metadata endpoint', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(redirect('http://169.254.169.254/latest/meta-data/'))

    await expect(fetchValidated('https://example.com/x')).rejects.toBeInstanceOf(SsrfError)
  })

  it('refuses a redirect pointing at any private IPv4 range', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(redirect('http://10.0.0.38:48735/'))

    await expect(fetchValidated('https://example.com/x')).rejects.toBeInstanceOf(SsrfError)
  })

  it('gives up after the redirect limit', async () => {
    const spy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(redirect('https://example.com/loop'))

    await expect(fetchValidated('https://example.com/x', {}, 2)).rejects.toThrow(/too many redirects/i)
    expect(spy).toHaveBeenCalledTimes(3)
  })
})
