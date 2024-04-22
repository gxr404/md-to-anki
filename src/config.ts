import { readFileSync } from 'node:fs'
import type { PartialDeep } from 'type-fest'

import { merge } from './utils'
import { THEME } from './constants'

export function getDefaultConfig(theme = THEME.NORD): IConfig {
  const themeKey = (THEME as any)[String(theme).toUpperCase()]
  const themePath = `../../theme/${themeKey}`
  const basePath = import.meta.url
  return {
    code: {
      defaultLanguage: 'bash',
      template: 'dark', // [default | dark]
    },
    card: {
      // 卡片分割: ##.. xxx
      separator: '(?=^#{2,}\\s)',
      // 卡片正反面分割: 正面 % 反面
      frontBackSeparator: '%',
      // 标签: [#标签]
      tagPattern: '^\\[#(.*)\\]',
    },
    deck: {
      titleSeparator: '^#\\s',
      defaultName: 'mdanki',
    },
    template: {
      formats: {
        question: readFileSync(new URL(`${themePath}/question.html`, basePath)).toString(),
        answer: readFileSync(new URL(`${themePath}/answer.html`, basePath)).toString(),
        css: readFileSync(new URL(`${themePath}/formats.css`, basePath)).toString(),
      },
    },
  }
}

export interface IConfig {
  code: {
    defaultLanguage: string
    template: string
  }
  card: {
    separator: string
    frontBackSeparator: string
    tagPattern: string
  }
  deck: {
    titleSeparator: string
    defaultName: string
  }
  template: {
    formats: {
      question: string
      answer: string
      css: string
    }
  }
}

let config: IConfig

export function initConfig(userConfig: PartialDeep<IConfig>, theme = THEME.NORD): IConfig {
  config = getDefaultConfig(theme)
  config = merge(config, userConfig) as IConfig
  return config
}

export function getConfig() {
  return config
}
