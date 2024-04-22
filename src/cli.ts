import { readFileSync } from 'node:fs'
import process from 'node:process'
import cac from 'cac'
import { THEME } from './constants'
import { main } from './index'

export interface ICliOption {
  target: string
  config: string
  deckName: string
  theme: string
}

function createCli() {
  const { name, version } = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url)).toString(),
  )
  const cli = cac(name)

  cli
    .command('<mdFile>', 'markdown文件')
    .option('-t, --target <targetFile>', '输出的anki文件名 eg: "-d targe.apkg"')
    .option('-c, --config <configFile>', '配置文件 eg: "-c ./config.json"')
    .option('-s, --theme <theme>', '样式主题可选 nord/minimal/dracula', {
      default: THEME.NORD,
    })
    .option('-d, --deckName <deckName>', '卡片组名 eg: "-d Test", Default: 取md文件中的"# xx"')
    .action(async (mdFile: string, options: ICliOption) => {
      try {
        await main({
          sourcePath: mdFile,
          ...options,
        })
        // await main(mdFile, options)
      }
      catch (err) {
        console.error(err instanceof Error ? err.message : 'unknown exception')
      }
    })

  cli.help()
  cli.version(version)
  return {
    cli,
    parse() {
      try {
        cli.parse()
      }
      catch (err) {
        console.error(err instanceof Error ? err.message : 'unknown exception')
        process.exit(1)
      }
    },
  }
}

const { parse } = createCli()
parse()
