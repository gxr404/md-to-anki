import { readFileSync } from 'node:fs'
import { getConfig } from '../config'
import { trimArray } from '../utils'
import { md2Html } from './md'
import { addMediaToCards } from './media'

export async function parseMarkdown(file: string) {
  const mdString = readFileSync(file).toString()
  const { cards, media, deckName } = await splitByCards(mdString, file)
  return {
    cards,
    media,
    deckName,
  }
}

export interface ICard {
  front: string
  back: string
  tags: string[]
}

export async function splitByCards(mdString: string, sourceFile: string) {
  const config = getConfig()
  const rawCards = mdString
    .split(new RegExp(config.card.separator, 'm'))
    .map((line: string) => line.trim())

  // console.log('card数:', rawCards.length, rawCards)

  const deckName = getDeckName(rawCards)
  // 移除牌组的title 为卡片内容
  // const titleReg = new RegExp(config.deck.titleSeparator)
  // rawCards = rawCards.filter((str: string) => !titleReg.test(str))
  const dirtyCards = await Promise.all(rawCards.map((str: string) => cardParse(str)))

  const cards = dirtyCards
    .filter(card => Boolean(card))
    // card should have front and back sides
    .filter(card => card?.front && card?.back) as ICard[]

  // get media from markdown file
  const media = await addMediaToCards(cards, sourceFile)

  return {
    deckName,
    cards,
    media,
  }
}

function getDeckName(rawCards: string[]) {
  const config = getConfig()
  const titleReg = new RegExp(config.deck.titleSeparator)
  let deckName = rawCards
    .find((str: string) => titleReg.test(str)) ?? ''
  deckName = deckName.split('\n')?.[0] || ''
  if (!deckName)
    return config.deck.defaultName

  return deckName.replace(/(#\s|\n)/g, '').trim()
}

export async function cardParse(cardStr: string = '') {
  const config = getConfig()
  const splitCardReg = new RegExp(`^${config.card.frontBackSeparator}$`, 'm')
  // 卡片的内容 按每一行分割
  const cardLines = cardStr
    .split(splitCardReg)
    .map((item: string) => item.split('\n'))
    .map((arr: string[]) => arr.map((str: string) => str.trimEnd()))

  // 不允许卡片只有正面(not allowed cards with only front side)
  if (cardLines.length === 1 && !cardLines[0].filter(Boolean).length)
    return null

  const { front, back, tags } = parseCardLines(cardLines)

  // 一般都是转html不存在不转的情况
  // if (!this.options.convertToHtml) {
  //   return new Card(front.join(), back.join(), tags);
  // }
  const frontHtml = await md2Html(front.join('\n'))
  const backHtml = await md2Html(back.join('\n'))

  return {
    front: frontHtml,
    back: backHtml,
    tags,
  }
}

function parseTags(line: string) {
  const config = getConfig()
  const tagReg = new RegExp(config.card.tagPattern)
  const data = line.split(' ')
    .map((str: string) => str.trim())
    .map((str) => {
      const parts = tagReg.exec(str)
      return parts?.[1] ?? ''
    })
    .filter(Boolean)

  return data
}

function parseCardLines(cardLines: string[][]) {
  const config = getConfig()
  const tagReg = new RegExp(config.card.tagPattern)

  const front: string[] = []
  const back: string[] = []
  const tags: string[] = []

  function fillTagAndBack(line: string) {
    if (tagReg.test(line) && line) {
      tags.push(...parseTags(line))
      return
    }
    // back 第一个元素如果是空 则跳过
    if (back.length === 0 && !line)
      return
    back.push(line)
  }

  // 没设置卡片分割符 默认 正面为第一行，其余为反面
  if (cardLines.length === 1) {
    trimArray(cardLines[0])
      .forEach((line, index) => {
        // 默认 正面为第一行
        if (index === 0) {
          front.push(line)
          return
        }
        fillTagAndBack(line)
      })
  }
  else {
    front.push(...cardLines[0])
    trimArray(cardLines[1])
      .forEach((line: string) => {
        fillTagAndBack(line)
      })
  }

  return {
    front: trimArray(front),
    back: trimArray(back),
    tags: trimArray(tags),
  }
}

export * from './media'
