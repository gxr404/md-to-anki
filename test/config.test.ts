import { describe, expect, it } from 'vitest'
import { getConfig, getDefaultConfig, initConfig } from '../src/config'

describe('without provided config file(未提供配置文件)', () => {
  it('returns default config', () => {
    initConfig({})
    expect(getConfig()).toEqual(getDefaultConfig())
  })
})

describe('with provided config file(提供配置文件)', () => {
  it('returns overridden settings(返回覆盖的配置)', () => {
    initConfig({
      template: {
        formats: {
          question: '123',
        },
      },
    })
    const defaultConfig = getDefaultConfig()
    defaultConfig.template.formats.question = '123'
  })
})
