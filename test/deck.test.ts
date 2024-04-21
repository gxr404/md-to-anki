import { beforeEach, describe, it } from 'vitest'
import { exportDeck } from '../src/deck'
import { initConfig } from '../src/config'

describe('exportDeck', () => {
  beforeEach(() => {
    initConfig({})
  })
  it('returns default config', () => {
    exportDeck({
      cards: [],
      mediaList: [],
      deckName: '',
      targetPath: '.',
    })
  })
})
