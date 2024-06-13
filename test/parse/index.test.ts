import * as fs from 'node:fs/promises'
import axios from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parseCard, parseCardList, parseMarkdown, splitByCards } from '../../src/parse'
import { getConfig, initConfig } from '../../src/config'

vi.mock('node:fs/promises')

const normalMdStr = `
# Test Title

## test

test1

\`\`\`js
var a = 13
\`\`\`

> test

**abc**13123

## test2

## test3

132

## test4

![](./1.jpg)

## test5

![](https://xx.com/1.jpg)

> test

[#tag1]
[#tag2]
[#tag3]
`

const commentsMdStr = `
# Test Title

## test

test1

\`\`\`js
var a = 13
\`\`\`

> test

**abc**13123

## test2

## test3

132

## test4

![](./1.jpg)

## test5

![](https://xx.com/1.jpg)

> test

[#tag1]
[#tag2]
[#tag3]

<!-- ## test6

test -->
`

beforeEach(() => {
  initConfig({})
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe('parse markdown', () => {
  it('normal parse markdown', async () => {
    vi.spyOn(fs, 'readFile').mockImplementation(async () => normalMdStr)
    vi.spyOn(axios, 'get').mockImplementation(async () => ({
      data: 'remote data',
    }))
    const data = await parseMarkdown('xxx.md')
    expect(data.cards.length).toBe(4)
    expect(data.media.length).toBe(2)
  })
  it ('parse has comments markdown', async () => {
    vi.spyOn(fs, 'readFile').mockImplementation(async () => commentsMdStr)
    vi.spyOn(axios, 'get').mockImplementation(async () => ({
      data: 'remote data',
    }))
    const data = await parseMarkdown('xxx.md')
    expect(data.cards.length).toBe(4)
    expect(data.media.length).toBe(2)
  })
})

describe('split Cards', () => {
  it('normal split cards', async () => {
    const res = await splitByCards(normalMdStr)
    // 此时的rawCards 还不是规范的card列表 可能含 卡片为空的情况
    expect(res.resolveCards.length).toBe(6)
    expect(res.deckName).toBe('Test Title')
    expect(res).toMatchSnapshot()
  })

  it('如果在 markdown 中没有指定卡牌名称，则以默认卡牌名称返回', async () => {
    const res = await splitByCards('## card1\n test')
    expect(res.deckName).toBe(getConfig().deck.defaultName)
  })

  it('正确的卡牌名', async () => {
    const mdStr = `# Title \n test \n test`
    const { deckName } = await splitByCards(mdStr)
    expect(deckName).toBe('Title')
  })

  it('多级卡片名需带上父级名称', async () => {
    const mdStr = `# Title \n test \n## Title2\n test\n### Title3 \n test`
    const { resolveCards } = await splitByCards(mdStr)
    expect(resolveCards).toMatchObject([
      { content: '# Title \n test', levelTitle: [] },
      { content: '## Title2\n test', levelTitle: ['Title2'] },
      {
        content: '### Title2_Title3\n test',
        levelTitle: ['Title2', 'Title3'],
      },
    ])
  })
})

describe('parse card list', () => {
  it('normal parse card list', async () => {
    vi.spyOn(fs, 'readFile').mockImplementation(async () => 'local data')
    vi.spyOn(axios, 'get').mockImplementation(async () => ({
      data: 'remote data',
    }))

    const { resolveCards } = await splitByCards(normalMdStr)
    const res = await parseCardList(resolveCards, 'source.md')
    // 真实的卡片列表
    expect(res.cards.length).toBe(4)
    expect(res.media.length).toBe(2)
    expect(res).toMatchSnapshot()
  })

  it('媒体文件保持唯一', async () => {
    vi.spyOn(fs, 'readFile').mockImplementation(async () => 'local data')
    const mdStr = `## Title\nbody\n![media](./1.jpg)![media](./1.jpg)`

    const { resolveCards } = await splitByCards(mdStr)
    const { media } = await parseCardList(resolveCards, 'test.md')
    expect(media.length).toBe(1)
    expect(media[0].data).toBe('local data')
  })
})

describe('parse card', () => {
  const markdown = '## Title\nbody\n[#tag]()'
  const markdownWithMultipleLines = '## Title\nfront\n%\nback\n[#tag]()'

  it('returns null for a blank string', async () => {
    const data = await parseCard(' ')
    expect(data).toBe(null)
  })
  it('returns null when undefined is passed', async () => {
    const data = await parseCard(undefined)
    expect(data).toBe(null)
  })
  it('creates a card with HTML sides', async () => {
    const card = await parseCard(markdown)
    // console.log(card)
    expect(card).toBeTruthy()
    expect(card!.front).toEqual('<h2>Title</h2>\n')
    expect(card!.back).toEqual('<p>body</p>\n')
    expect(card!.tags.length).toEqual(1)
    expect(card!.tags[0]).toEqual('tag')
  })
  it('creates a multi-line card with HTML sides', async () => {
    const card = await parseCard(markdownWithMultipleLines)
    expect(card).toBeTruthy()
    expect(card!.front.replace(/\n/g, '')).toEqual('<h2>Title</h2><p>front</p>')
    expect(card!.back).toEqual('<p>back</p>\n')
    expect(card!.tags.length).toEqual(1)
    expect(card!.tags[0]).toEqual('tag')
  })
  it('skips first blank lines for back', async () => {
    const card = await parseCard('## Title\n \nbody')
    expect(card).toBeTruthy()
    expect(card!.front.replace(/\n/g, '')).toEqual('<h2>Title</h2>')
    expect(card!.back.replace(/\n/g, '')).toEqual('<p>body</p>')
  })
})
