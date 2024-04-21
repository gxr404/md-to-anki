import { defineBuildConfig } from 'unbuild'
// import fg from 'fast-glob'

export default defineBuildConfig({
  entries: [
    'src/cli.ts',
    'src/index.ts',
    // ...fg.sync('src/!(*.d).ts'),
    // .map(i => ({
    //   input: i.slice(0, -3),
    //   name: basename(i).slice(0, -3),
    // })),
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    // replace: {

    // }
  },
})
