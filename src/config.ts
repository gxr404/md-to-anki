import { readFileSync } from 'node:fs'
import type { PartialDeep } from 'type-fest'

import { BASE_PATH, THEME } from './constants'
import { merge } from './utils'

export function getDefaultConfig(theme = THEME.NORD): IConfig {
  const themeKey = (THEME as any)[String(theme).toUpperCase()]
  const themePath = `../theme/${themeKey}`
  return {
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
      defaultName: 'md-to-anki',
    },
    template: {
      formats: {
        question: readFileSync(new URL(`${themePath}/question.html`, BASE_PATH)).toString(),
        answer: readFileSync(new URL(`${themePath}/answer.html`, BASE_PATH)).toString(),
        css: readFileSync(new URL(`${themePath}/formats.css`, BASE_PATH)).toString(),
      },
    },
  }
}

export interface IConfig {
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
