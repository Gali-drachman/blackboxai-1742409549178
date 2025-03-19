module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  embeddedLanguageFormatting: 'auto',
  singleAttributePerLine: false,
  plugins: [
    'prettier-plugin-tailwindcss'
  ],
  tailwindConfig: './tailwind.config.js',
  overrides: [
    {
      files: '*.{json,md,yml,yaml}',
      options: {
        tabWidth: 2
      }
    }
  ]
};