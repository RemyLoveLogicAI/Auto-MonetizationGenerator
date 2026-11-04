import { validateIngestUrl } from '../src/services/ssrf'

describe('SSRF Protection Service (validateIngestUrl)', () => {
  it('allows valid public HTTPS and HTTP URLs', () => {
    expect(validateIngestUrl('https://example.com/asset.png').valid).toBe(true)
    expect(validateIngestUrl('https://api.github.com/users').valid).toBe(true)
    expect(validateIngestUrl('http://cdn.somedomain.org/file.csv').valid).toBe(true)
  })

  it('rejects invalid URL formats', () => {
    const res = validateIngestUrl('not-a-url')
    expect(res.valid).toBe(false)
    expect(res.reason).toMatch(/invalid/i)
  })

  it('rejects non-http/https protocols', () => {
    expect(validateIngestUrl('file:///etc/passwd').valid).toBe(false)
    expect(validateIngestUrl('ftp://example.com/file').valid).toBe(false)
    expect(validateIngestUrl('gopher://127.0.0.1/').valid).toBe(false)
    expect(validateIngestUrl('javascript:alert(1)').valid).toBe(false)
  })

  it('rejects loopback and local hosts', () => {
    expect(validateIngestUrl('http://localhost/admin').valid).toBe(false)
    expect(validateIngestUrl('http://127.0.0.1:8080/').valid).toBe(false)
    expect(validateIngestUrl('http://0.0.0.0/').valid).toBe(false)
    expect(validateIngestUrl('http://app.local/secret').valid).toBe(false)
    expect(validateIngestUrl('http://service.internal/').valid).toBe(false)
  })

  it('rejects cloud metadata IP addresses', () => {
    expect(validateIngestUrl('http://169.254.169.254/latest/meta-data/').valid).toBe(false)
    expect(validateIngestUrl('http://metadata.google.internal/computeMetadata/v1/').valid).toBe(false)
  })

  it('rejects private IPv4 networks', () => {
    // 10.0.0.0/8
    expect(validateIngestUrl('http://10.0.0.1/config').valid).toBe(false)
    expect(validateIngestUrl('http://10.254.0.12/').valid).toBe(false)

    // 172.16.0.0/12
    expect(validateIngestUrl('http://172.16.0.1/').valid).toBe(false)
    expect(validateIngestUrl('http://172.31.255.254/').valid).toBe(false)
    // 172.32.0.1 should not be flagged as private
    expect(validateIngestUrl('http://172.32.0.1/').valid).toBe(true)

    // 192.168.0.0/16
    expect(validateIngestUrl('http://192.168.1.1/router').valid).toBe(false)
    expect(validateIngestUrl('http://192.168.0.100:3000/').valid).toBe(false)

    // 169.254.0.0/16
    expect(validateIngestUrl('http://169.254.1.1/').valid).toBe(false)
  })

  it('rejects IPv6 loopback, unique-local and link-local addresses', () => {
    expect(validateIngestUrl('http://[::1]/').valid).toBe(false)
    expect(validateIngestUrl('http://[fd00::1]/').valid).toBe(false)
    expect(validateIngestUrl('http://[fe80::1]/').valid).toBe(false)
    expect(validateIngestUrl('http://[::ffff:127.0.0.1]/').valid).toBe(false)
  })

  it('rejects decimal, hex and octal IP encodings', () => {
    expect(validateIngestUrl('http://2130706433/').valid).toBe(false)
    expect(validateIngestUrl('http://0x7f000001/').valid).toBe(false)
    expect(validateIngestUrl('http://017700000001/').valid).toBe(false)
  })

  it('rejects *.localhost subdomains', () => {
    expect(validateIngestUrl('http://foo.localhost/').valid).toBe(false)
  })

  it('rejects trailing-dot FQDN forms of blocked hosts', () => {
    expect(validateIngestUrl('http://localhost./').valid).toBe(false)
    expect(validateIngestUrl('http://metadata.google.internal./').valid).toBe(false)
    expect(validateIngestUrl('http://foo.local./').valid).toBe(false)
  })
})
