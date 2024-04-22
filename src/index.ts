import path from 'node:path'
import process from 'node:process'
import { readFile } from 'node:fs/promises'
import chalk from 'chalk'
import ora from 'ora'

import type { ICliOption } from './cli'
import { validatePath } from './utils'
import { AVAILABLE_FILE_EXTENSIONS, THEME } from './constants'
import { transforms } from './transforms'
import { initConfig } from './config'
import type { IConfig } from './config'
import { exportDeck } from './deck'

interface IOptions extends ICliOption {
  sourcePath: string
}

export async function main(options: IOptions) {
  const {
    sourcePath: rawSourcePath,
    deckName,
    target,
    config: rawUserConfigPath,
    theme: rawTheme,
  } = options
  const sourcePath = path.resolve(rawSourcePath)
  const userConfigPath = rawUserConfigPath ? path.resolve(rawUserConfigPath) : ''

  // sourcePath validate
  const validate = validatePath(sourcePath, AVAILABLE_FILE_EXTENSIONS)
  if (!validate)
    process.exit(1)

  // theme validate
  const theme = String(rawTheme).toUpperCase()
  if (!(THEME as any)[theme]) {
    console.error(`${chalk.red('✖')} 不存在的主题，可选为${Object.values(THEME).join(' / ')}`)
    process.exit(1)
  }

  // userConfigPath validate
  let userConfig: Partial<IConfig> = {}
  if (userConfigPath) {
    const configValidate = validatePath(userConfigPath, ['.json'])
    if (!configValidate)
      process.exit(1)
    const userConfigBuffer = await readFile(userConfigPath)
    userConfig = JSON.parse(userConfigBuffer.toString())
  }

  // userConfigPath validate
  let targetFile
  if (!target) {
    const ext = path.extname(sourcePath)
    targetFile = ext ? sourcePath.replace(ext, '.apkg') : `${sourcePath}.apkg`
  }
  else {
    targetFile = path.resolve(target)
  }

  const config = initConfig(userConfig, theme)
  const spinner = ora('Transforms...').start()
  // console.time('transforms')
  // transform
  const {
    cards = [],
    media,
    parseDeckName = config.deck.defaultName,
  } = await transforms({
    sourcePath,
    deckName: deckName || '',
    targetFile: target || '',
  })
  // console.timeEnd('transforms')
  if (!cards.length) {
    spinner.fail('不存在任何卡片, 请检查markdown文件')
    // console.error('No cards found. Check you markdown file(s)')
    process.exit(1)
  }

  const realDeckName = deckName || parseDeckName || config.deck.defaultName
  spinner.text = 'Export...'
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

  spinner.succeed(`"${realDeckName}"含卡片${cards.length}张: ${targetFile}`)
}
