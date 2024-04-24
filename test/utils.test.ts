import { describe, expect, it } from 'vitest'
import { removeMdComments, trimArray } from '../src/utils'

describe('trimArray', () => {
  it('trimArray', () => {
    expect(trimArray(['', 1, '', 3, 4, ''])).toEqual([1, '', 3, 4])
    expect(trimArray(['', 1, '', 3, 4, null])).toEqual([1, '', 3, 4])
    expect(trimArray(['', 1, '', false, 3, 4, false])).toEqual([1, '', false, 3, 4])
    expect(trimArray([1, '', 3])).toEqual([1, '', 3])
    expect(trimArray(['123'])).toEqual(['123'])
  })
})

const mdStr = `
<!-- This is comment #1 -->
Hello this is Markdown and it's a fantastic format.
<!-- This is comment #2 -->
`
const multiLineMdStr = `
<!--
This is
comment #1
-->
Hello this is Markdown and it's a fantastic format.
<!--  This is
comment #2 -->
`
describe('removeMdComments', () => {
  it('remove single line comment', () => {
    const res = `\n\nHello this is Markdown and it's a fantastic format.\n\n`
    expect(removeMdComments(mdStr)).toEqual(res)
  })
  it('remove multi line comment', () => {
    const res = `\n\nHello this is Markdown and it's a fantastic format.\n\n`
    expect(removeMdComments(multiLineMdStr)).toEqual(res)
  })
})
