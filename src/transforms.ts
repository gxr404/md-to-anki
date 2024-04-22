import { lstat } from 'node:fs/promises'
import fg from 'fast-glob'

import { AVAILABLE_FILE_EXTENSIONS } from './constants'
import { parseMarkdown } from './parse'
import type { ICard, IMedia } from './parse'

interface ITransformsParams {
  sourcePath: string
  deckName: string
  targetFile: string
}
export async function transforms(params: ITransformsParams) {
  const { sourcePath } = params
  let parseDeckName
  const cards: ICard[] = []
  const media: IMedia[] = []
  const stats = await lstat(sourcePath)
  if (stats.isDirectory()) {
    const allowedExtStr = AVAILABLE_FILE_EXTENSIONS.map(ex => ex.replace('.', '')).join(',')
    const files = fg.globSync(`${sourcePath}/**/*.{${allowedExtStr}}`, { dot: true })
    const promiseList = files.map(async (file) => {
      const {
        cards: fileCards,
        media: fileMedia,
      } = await parseMarkdown(file)
      cards.push(...fileCards)
      media.push(...fileMedia)
    })
    await Promise.all(promiseList)
  }
  else {
    const {
      deckName: fileDeckName,
      cards: fileCards,
      media: fileMedia,
    } = await parseMarkdown(sourcePath)

    parseDeckName = fileDeckName
    cards.push(...fileCards)
    media.push(...fileMedia)
  }

  return {
    cards,
    media,
    parseDeckName,
  }
}
