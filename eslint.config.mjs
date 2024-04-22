import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: ['theme', 'example', '.vscode', '**/*.md'],
    typescript: true,
    formatters: true,
  },
  {
    rules: {
      'no-console': ['warn'],
    },
  },
)
