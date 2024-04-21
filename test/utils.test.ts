import { describe, expect, it } from 'vitest'
import { trimArray } from '../src/utils'

describe('utils', () => {
  it('trimArray', () => {
    expect(trimArray(['', 1, '', 3, 4, ''])).toEqual([1, '', 3, 4])
    expect(trimArray(['', 1, '', 3, 4, null])).toEqual([1, '', 3, 4])
    expect(trimArray(['', 1, '', false, 3, 4, false])).toEqual([1, '', false, 3, 4])
    expect(trimArray([1, '', 3])).toEqual([1, '', 3])
    expect(trimArray(['123'])).toEqual(['123'])
  })
})
