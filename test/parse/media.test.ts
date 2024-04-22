import * as fs from 'node:fs/promises'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'

import { addMediaToCards, mediaParse, resetMediaList } from '../../src/parse/media'

// mock 模块(影响全局)
vi.mock('node:fs/promises')
vi.mock('axios')

beforeEach(() => {
  resetMediaList()
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe('mediaParse', () => {
  it('returns a blank string(返回空白字符串)', async () => {
    const res = await mediaParse('', '')
    expect(res.mdStr).toBe('')
  })

  it('returns the same card data(返回相同的卡片数据)', async () => {
    const res = await mediaParse('<h2 id="title">Title</h2>', '')
    expect(res.mdStr).toEqual('<h2 id="title">Title</h2>')
  })

  it('parses local media file(解析含本地的媒体文件)', async () => {
    vi.spyOn(fs, 'readFile').mockImplementation(async () => 'local data')
    const res = await mediaParse('<img src="test.png">', '/test/132/xx.md')
    expect(res.mdStr).toEqual('<img src="40e4a2515baa0cd7cc47f7ce048b6426.png">')
    expect(res.mediaList.length).toEqual(1)
    expect(res.mediaList[0].data).toEqual('local data')
    expect(res.mediaList[0].fileName).toEqual('40e4a2515baa0cd7cc47f7ce048b6426.png')
    expect(res.mediaList[0].checksum).toEqual('40e4a2515baa0cd7cc47f7ce048b6426')
  })

  it('parses remote media file(解析含远程的媒体文件)', async () => {
    vi.spyOn(axios, 'get').mockImplementation(async () => ({
      data: 'remote data',
    }))

    const res = await mediaParse('<img src="https://test.com/test.png">', '')

    expect(res.mdStr).toEqual('<img src="39ee43d362145cff5c1cea14f0f39840.png">')
    expect(res.mediaList.length).toEqual(1)
    expect(res.mediaList[0].data).toEqual('remote data')
    expect(res.mediaList[0].fileName).toEqual('39ee43d362145cff5c1cea14f0f39840.png')
    expect(res.mediaList[0].checksum).toEqual('39ee43d362145cff5c1cea14f0f39840')
  })
})

describe('addMediaToCards', () => {
  it('卡片列表空', async () => {
    const mediaList = await addMediaToCards([], 'source.md')
    expect(mediaList.length).toEqual(0)
  })

  it('卡片列表含媒体文件', async () => {
    vi.spyOn(fs, 'readFile').mockImplementation(async () => 'local data')
    vi.spyOn(axios, 'get').mockImplementation(async () => ({
      data: 'remote data',
    }))

    const cardsList = [
      {
        front: '<img src="123.jpg">',
        back: '<img src="https://test.com/test.png">',
        tags: [],
      },
    ]
    const mediaList = await addMediaToCards(cardsList, 'source.md')
    // exp
    expect(cardsList[0].front).toBe('<img src="40e4a2515baa0cd7cc47f7ce048b6426.jpg">')
    expect(cardsList[0].back).toBe('<img src="39ee43d362145cff5c1cea14f0f39840.png">')
    expect(mediaList.length).toEqual(2)
  })
})
