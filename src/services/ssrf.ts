const BLOCKED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254',
  'metadata.google.internal',
])

const MAX_REDIRECTS = 3

function stripBrackets(hostname: string): string {
  return hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname
}

function isPrivateIpv4(hostname: string): boolean {
  // Check IPv4 format: a.b.c.d
  const ipv4Match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname)
  if (!ipv4Match) return false

  const octets = ipv4Match.slice(1, 5).map(Number)
  if (octets.some((oct) => oct < 0 || oct > 255)) return false

  const [o1, o2] = octets

  // 127.0.0.0/8 (Loopback)
  if (o1 === 127) return true
  // 10.0.0.0/8 (Private)
  if (o1 === 10) return true
  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  if (o1 === 172 && o2 >= 16 && o2 <= 31) return true
  // 192.168.0.0/16 (Private)
  if (o1 === 192 && o2 === 168) return true
  // 169.254.0.0/16 (Link-local / cloud metadata)
  if (o1 === 169 && o2 === 254) return true
  // 0.0.0.0/8
  if (o1 === 0) return true

  return false
}

function isPrivateIpv6(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (!h.includes(':')) return false

  // ::1 (loopback) and :: (unspecified)
  if (h === '::1' || h === '::') return true

  // IPv4-mapped addresses. The URL parser normalizes ::ffff:127.0.0.1 to
  // ::ffff:7f00:1, so the whole mapped range is blocked rather than parsed.
  if (h.startsWith('::ffff:')) return true

  // fc00::/7 (unique local) and fe80::/10 (link-local)
  if (/^f[cd][0-9a-f]{2}:/.test(h)) return true
  if (/^fe[89ab][0-9a-f]:/.test(h)) return true

  return false
}

// Decimal, hex, and octal encodings resolve to IPv4 on most stacks, e.g.
// http://2130706433/ is 127.0.0.1. Treat them as IPs, never as hostnames.
function isEncodedIp(hostname: string): boolean {
  return /^\d+$/.test(hostname) || /^0x[0-9a-f]+$/i.test(hostname) || /^0[0-7]+$/.test(hostname)
}

export function validateIngestUrl(targetUrl: string): { valid: boolean; reason?: string } {
  let parsed: URL
  try {
    parsed = new URL(targetUrl)
  } catch {
    return { valid: false, reason: 'Invalid URL format' }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: `Unsupported protocol: ${parsed.protocol}` }
  }

  // A trailing dot is a valid FQDN form that resolves identically ("localhost."
  // is 127.0.0.1), so it must not slip past the host and suffix checks.
  const hostname = stripBrackets(parsed.hostname.toLowerCase()).replace(/\.+$/, '')

  if (BLOCKED_HOSTS.has(hostname)) {
    return { valid: false, reason: `Blocked host: ${hostname}` }
  }

  if (hostname.endsWith('.local') || hostname.endsWith('.internal') || hostname.endsWith('.localhost')) {
    return { valid: false, reason: `Blocked domain suffix: ${hostname}` }
  }

  if (isEncodedIp(hostname)) {
    return { valid: false, reason: `Numeric host encodings are prohibited: ${hostname}` }
  }

  if (isPrivateIpv4(hostname) || isPrivateIpv6(hostname)) {
    return { valid: false, reason: `Private/reserved IP address is prohibited: ${hostname}` }
  }

  return { valid: true }
}

export class SsrfError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SsrfError'
  }
}

/**
 * Fetches a URL only after validating it and every redirect hop.
 * Redirects are followed manually so a 302 to 169.254.169.254 cannot slip past
 * the initial check, which is the classic SSRF bypass.
 *
 * Limitation: this validates the hostname string, not the address DNS returns.
 * A name such as `127.0.0.1.nip.io` is publicly resolvable and points at
 * loopback, and the request is resolved by the platform's fetch, so the only
 * complete defence is an outbound allowlist (or an egress proxy) enforced
 * outside this function. Treat POST /api/ingestR2 as internet-facing accordingly.
 */
export async function fetchValidated(
  targetUrl: string,
  init: RequestInit = {},
  maxRedirects: number = MAX_REDIRECTS,
): Promise<Response> {
  let current = targetUrl

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const check = validateIngestUrl(current)
    if (!check.valid) throw new SsrfError(check.reason ?? 'Forbidden URL')

    const res = await fetch(current, { ...init, redirect: 'manual' })

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (!location) throw new SsrfError('Redirect without a Location header')
      current = new URL(location, current).toString()
      continue
    }

    return res
  }

  throw new SsrfError(`Too many redirects (limit ${maxRedirects})`)
}
