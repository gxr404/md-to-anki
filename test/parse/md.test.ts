import { afterEach, describe, expect, it, vi } from 'vitest'
import { getMarked, md2Html } from '../../src/parse/md'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('parse markdown', () => {
  it('parse code', async () => {
    const htmlStr = await md2Html('\n```js\nvar a = 123\n```\n')
    expect(htmlStr).toMatchSnapshot()
  })
  it('parse alias sol code', async () => {
    const htmlStr = await md2Html('\n```sol\npragma solidity ^0.8.4;\n```\n')
    expect(htmlStr).toMatchSnapshot()
  })
  it('parse error code', async () => {
    const markedParse = () => {
      throw new Error('cannot parse')
    }
    const marked = getMarked()
    vi.spyOn(marked, 'parse').mockImplementation(markedParse)
    let callErr: any
    try {
      await md2Html('\n```js\nvar a = 123\n```\n')
    }
    catch (err: any) {
      callErr = err
    }
    expect(callErr?.message).toBe('cannot parse')
  })
})
