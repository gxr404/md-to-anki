import { writeFile } from 'node:fs/promises'
import { AnkiExport } from '@gxr1020/anki-apkg-export'
import { getConfig } from './config'
import type { ICard } from './parse'
import type { IMedia } from './parse/media'

interface IExportDeckParams {
  cards: ICard[]
  mediaList: IMedia[]
  targetFile: string
  deckName: string
}

export async function exportDeck(params: IExportDeckParams) {
  const { cards, mediaList, targetFile, deckName } = params
  const config = getConfig()
  const { formats } = config.template
  const ankiExport = await AnkiExport(deckName, {
    css: formats.css,
    answerFormat: formats.answer,
    questionFormat: formats.question,
  })

  // cards
  cards.forEach((card) => {
    const { front, back, tags } = card
    ankiExport.addCard(front, back, { tags })
  })

  // media
  mediaList.forEach((media) => {
    ankiExport.addMedia(media.fileName, media.data)
  })

  const zip = await ankiExport.save()
  await writeFile(targetFile, zip, 'binary')
}
