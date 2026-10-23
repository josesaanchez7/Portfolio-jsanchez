import js from '@eslint/js'
import astro from 'eslint-plugin-astro'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  { ignores: ['dist', '.astro'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // Los métodos de Testing Library (getByRole…) son funciones sueltas: se usan desestructuradas.
  {
    files: ['**/*.test.ts'],
    rules: { '@typescript-eslint/unbound-method': 'off' },
  },
  // Componentes .astro: su frontmatter y sus <script> se analizan como TypeScript.
  ...astro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: { globals: globals.browser },
  },
  // astro.config.mjs y otros archivos de configuración se ejecutan en Node.
  {
    files: ['*.mjs', '*.js'],
    languageOptions: { globals: globals.node },
  },
)
