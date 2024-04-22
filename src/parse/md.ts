import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import { codeToHtml } from 'shiki'

let marked: Marked

async function initMarked() {
  if (marked)
    return marked
  // const highlighter = await initHighlighter()
  marked = new Marked({
    gfm: true,
    breaks: true,
    pedantic: false,
    async: true,
    ...markedHighlight({
      langPrefix: 'core lang-',
      async: true,
      async highlight(code, lang) {
        const langAlias: any = {
          sol: 'solidity',
        }
        const htmlStr = await codeToHtml(code, {
          lang: langAlias[lang] || lang,
          theme: 'vitesse-dark',
        })
        return htmlStr
      },
    }),
  })
  return marked
}

export function getMarked() {
  return marked
}

// let highlighter: HighlighterCore

// async function initHighlighter() {
//   if (highlighter)
//     return highlighter
//   // highlighter = await getHighlighterCore({
//   //   themes: [
//   //     import('shiki/themes/vitesse-dark.mjs'),
//   //   ],
//   //   langs: [
//   //     import('shiki/langs/javascript.mjs'),
//   //     import('shiki/langs/css.mjs'),
//   //     import('shiki/langs/bash.mjs'),
//   //     import('shiki/langs/bat.mjs'),
//   //     import('shiki/langs/c.mjs'),
//   //     import('shiki/langs/coffeescript.mjs'),
//   //     import('shiki/langs/go.mjs'),
//   //     import('shiki/langs/json.mjs'),
//   //     import('shiki/langs/graphql.mjs'),
//   //     import('shiki/langs/java.mjs'),
//   //     import('shiki/langs/less.mjs'),
//   //     import('shiki/langs/markdown.mjs'),
//   //     import('shiki/langs/php.mjs'),
//   //     import('shiki/langs/python.mjs'),
//   //     import('shiki/langs/ruby.mjs'),
//   //     import('shiki/langs/rust.mjs'),
//   //     import('shiki/langs/sass.mjs'),
//   //     import('shiki/langs/stylus.mjs'),
//   //     import('shiki/langs/typescript.mjs'),
//   //     import('shiki/langs/vim.mjs'),
//   //     import('shiki/langs/jsx.mjs'),
//   //     import('shiki/langs/vue.mjs'),
//   //     import('shiki/langs/sql.mjs'),
//   //     import('shiki/langs/csharp.mjs'),
//   //     import('shiki/langs/yaml.mjs'),
//   //   ],
//   //   langAlias: {
//   //     'c#': 'csharp',
//   //     'md': 'markdown',
//   //     'rb': 'ruby',
//   //     'py': 'python',
//   //     'sh': 'bash',
//   //   },
//   //   loadWasm: getWasm,
//   // })
//   const { getHighlighter, bundledLanguages } = await import('shiki')
//   highlighter = await getHighlighter({
//     themes: ['vitesse-dark'],
//     langs: Object.keys(bundledLanguages),
//     // [
//     //   'javascript',
//     //   'css',
//     //   'bash',
//     //   'bat',
//     //   'c',
//     //   'coffeescript',
//     //   'go',
//     //   'json',
//     //   'graphql',
//     //   'java',
//     //   'less',
//     //   'markdown',
//     //   'php',
//     //   'python',
//     //   'ruby',
//     //   'rust',
//     //   'sass',
//     //   'stylus',
//     //   'typescript',
//     //   'vim',
//     //   'jsx',
//     //   'vue',
//     //   'sql',
//     //   'csharp',
//     //   'yaml',
//     //   'http',
//     //   'proto',
//     //   'cpp',
//     //   'solidity',
//     // ],
//     langAlias: {
//       'c#': 'csharp',
//       'md': 'markdown',
//       'rb': 'ruby',
//       'py': 'python',
//       'sh': 'bash',
//       'sol': 'solidity',
//       'c++': 'cpp',
//     },
//   })
//   return highlighter
// }

export async function md2Html(mdStr: string) {
  const marked = await initMarked()
  const htmlStr = marked.parse(mdStr)
  return htmlStr
}
