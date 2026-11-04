import { safeObjectKey } from '../src/routes/api'

describe('safeObjectKey (R2 key validation)', () => {
  it('accepts ordinary nested keys', () => {
    expect(safeObjectKey('assets/2026/report.pdf')).toBe('assets/2026/report.pdf')
    expect(safeObjectKey('cover.png')).toBe('cover.png')
  })

  it('strips leading slashes', () => {
    expect(safeObjectKey('/assets/a.png')).toBe('assets/a.png')
  })

  it('rejects traversal and dot segments', () => {
    expect(safeObjectKey('../etc/passwd')).toBeNull()
    expect(safeObjectKey('a/../b')).toBeNull()
    expect(safeObjectKey('a/./b')).toBeNull()
    expect(safeObjectKey('/../../x')).toBeNull()
  })

  it('rejects empty, overlong and odd-character keys', () => {
    expect(safeObjectKey(undefined)).toBeNull()
    expect(safeObjectKey('')).toBeNull()
    expect(safeObjectKey('/')).toBeNull()
    expect(safeObjectKey('a'.repeat(513))).toBeNull()
    expect(safeObjectKey('a b.png')).toBeNull()
    expect(safeObjectKey('a<b>.png')).toBeNull()
    expect(safeObjectKey('-leading-dash')).toBeNull()
  })
})
