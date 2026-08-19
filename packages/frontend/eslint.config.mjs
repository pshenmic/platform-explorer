import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import jest from 'eslint-plugin-jest'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nextCoreWebVitals,
  {
    plugins: {
      jest
    },
    languageOptions: {
      globals: {
        ...jest.environments.globals.globals
      }
    },
    // Next 16 eslint-config-next ships stricter React Compiler rules.
    // Keep them off for the upgrade PR; tighten later without blocking CI/Vercel.
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': typescriptEslint
    },
    languageOptions: {
      parser: tsParser
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports'
      }]
    }
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**']
  }
]
