import path from 'node:path'
import { readFile } from 'node:fs/promises'
import crypto from 'node:crypto'
import axios from 'axios'
import mime from 'mime-types'

import { getExtensionFromUrl } from '../utils'
import type { ICard } from './index'

export const srcReg = /src="([^"]*?)"/g

export interface IMedia {
  data: any
  fileName: string
  srcStr: string
  checksum: string
}

export const mediaList: IMedia[] = []

function addMedia(media: IMedia) {
  const hasMedia = mediaList.some((item: IMedia) => item.checksum === media.checksum)
  if (hasMedia)
    return

  mediaList.push(media)
}
/** 从cards 获取 media信息 */
export async function addMediaToCards(cards: ICard[], sourceFile: string) {
  for (const card of cards) {
    const frontMedia = await mediaParse(card.front, sourceFile)
    const backMedia = await mediaParse(card.back, sourceFile)
    card.front = frontMedia.mdStr
    card.back = backMedia.mdStr
    frontMedia.mediaList.forEach(addMedia)
    backMedia.mediaList.forEach(addMedia)
  }
  return mediaList
}

/** 重置全局的mediaList */
export function resetMediaList() {
  mediaList.splice(0, mediaList.length)
}

export async function mediaParse(mdStr: string, sourceFile: string) {
  const srcArr = mdStr.match(srcReg) || []
  const urlArr = srcArr.map(str => str.replace(srcReg, '$1'))

  const promiseList = urlArr.map(async (url: string) => getMedia(url, sourceFile))
  const mediaList = await Promise.all(promiseList)

  const newMdStr = mdStr.replace(srcReg, (src: string, url: string) => {
    const index = urlArr.indexOf(url)
    return mediaList[index].srcStr
  })

  return {
    mediaList,
    mdStr: newMdStr,
  }
  // str.replace(srcReg, (match, ...args) => {
  //   const promise = asyncFn(match, ...args)
  //   tasks.push(promise)
  // })
}

async function getMedia(urlStr: string, sourceFile: string): Promise<IMedia> {
  let bufferData
  let fileExt
  if (urlStr.startsWith('http')) {
    const resp = await axios.get(urlStr, {
      responseType: 'arraybuffer',
    })
    bufferData = resp.data
    fileExt = getExtensionFromUrl(urlStr)
    if (!fileExt && resp.headers['Content-Type']) {
      const resExt = mime.extension(String(resp.headers['Content-Type']))
      fileExt = resExt || ''
    }
  }
  else {
    const filePath = path.resolve(path.dirname(sourceFile), urlStr)
    fileExt = path.extname(filePath)
    bufferData = await readFile(filePath)
  }

  const checksum = crypto
    .createHash('md5')
    .update(bufferData, 'utf8')
    .digest('hex')
  const fileName = `${checksum}${fileExt}`

  return {
    data: bufferData,
    fileName,
    srcStr: `src="${fileName}"`,
    checksum,
  }
}
