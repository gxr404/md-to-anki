import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'

export function validatePath(checkPath: string, exts: string[]) {
  if (!fs.existsSync(checkPath)) {
    console.error(`${chalk.red('✖')} "${checkPath}" 不存在`)
    return false
  }

  const ext = path.extname(checkPath)

  if (ext && !exts.includes(ext)) {
    console.error(`${chalk.red('✖')} "${checkPath}" 非法文件后缀${exts.join('/')}`)
    return false
  }

  return true
}

export function merge(target: any, obj: any) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      if (!target[key]) {
        const newTarget = Array.isArray(target[key]) ? [] : {}
        target[key] = newTarget
      }
      merge(target[key], value)
      continue
    }
    target[key] = value
  }
  return target
}

/**
 * 移除数组头尾空元素  ['', 1, '', 3, 4, null] -> [1, '', 3,4]
 */
export function trimArray<T>(arr: T[]) {
  let start = 0
  let end = arr.length - 1
  // if (start === end)
  //   return arr[0] ? arr : []

  while (start < end) {
    if (arr[start] && arr[end])
      break
    if (!arr[start])
      start = start + 1
    if (!arr[end])
      end = end - 1
  }
  return arr.slice(start, end + 1)
}

export function getExtensionFromUrl(urlStr: string) {
  const extension = urlStr
    ?.split(/[#?]/)[0]
    ?.split('.')
    ?.pop()
    ?.trim()

  return extension ? `.${extension}` : ''
}
