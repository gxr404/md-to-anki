import path from 'node:path'
import process from 'node:process'
import { readFileSync } from 'node:fs'

import type { ICliOption } from './cli'
import { validatePath } from './utils'
import { AVAILABLE_FILE_EXTENSIONS } from './constants'
import { transforms } from './transforms'
import { initConfig } from './config'
import type { IConfig } from './config'
import { exportDeck } from './deck'

interface IOptions extends ICliOption {
  sourcePath: string
}

export async function main(options: IOptions) {
  const { sourcePath: rawSourcePath, deckName, target, config: rawUserConfigPath } = options
  const sourcePath = path.resolve(rawSourcePath)
  const userConfigPath = rawUserConfigPath ? path.resolve(rawUserConfigPath) : ''
  const validate = validatePath(sourcePath, AVAILABLE_FILE_EXTENSIONS)

  if (!validate)
    process.exit(1)
  let userConfig: Partial<IConfig> = {}
  if (userConfigPath) {
    const configValidate = validatePath(userConfigPath, ['.json'])
    if (!configValidate)
      process.exit(1)
    userConfig = JSON.parse(readFileSync(userConfigPath).toString())
  }
  let targetFile
  if (!target) {
    const ext = path.extname(sourcePath)
    targetFile = ext ? sourcePath.replace(ext, '.apkg') : `${sourcePath}.apkg`
  }
  else {
    targetFile = path.resolve(target)
  }
  const config = initConfig(userConfig)

  const {
    cards = [],
    media,
    parseDeckName = config.deck.defaultName,
  } = await transforms({
    sourcePath,
    deckName: deckName || '',
    targetFile: target || '',
  })

  if (!cards.length) {
    console.error('No cards found. Check you markdown file(s)')
    process.exit(1)
  }

  const realDeckName = deckName || parseDeckName || config.deck.defaultName
  try {
    await exportDeck({
      cards,
      mediaList: media,
      targetFile,
      deckName: realDeckName,
    })
  }
  catch (e: any) {
    console.error(e?.message || 'unknown error')
    process.exit(1)
  }
  console.log(`✅ ${realDeckName}: ${targetFile}`)
}
