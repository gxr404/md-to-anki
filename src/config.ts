import { readFileSync } from 'node:fs'
import type { PartialDeep } from 'type-fest'

import { merge } from './utils'

export function getDefaultConfig(): IConfig {
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
        question: readFileSync(new URL('../resources/question.html', import.meta.url)).toString(),
        answer: readFileSync(new URL('../resources/answer.html', import.meta.url)).toString(),
        css: readFileSync(new URL('../resources/formats.css', import.meta.url)).toString(),
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

export function initConfig(userConfig: PartialDeep<IConfig>): IConfig {
  config = getDefaultConfig()
  config = merge(config, userConfig) as IConfig
  return config
}

export function getConfig() {
  return config
}
