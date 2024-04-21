import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: ['resources', 'example', '.vscode', '**/*.md'],
    typescript: true,
    formatters: true,
  },
  {
    rules: {
      'no-console': ['warn'],
    },
  },
)
