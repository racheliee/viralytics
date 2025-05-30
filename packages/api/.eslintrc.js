module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'jest'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:prettier/recommended'
  ],
  root: true,
  env: {
    node: true,
    jest: true
  },
  ignorePatterns: [
    '.eslintrc.js',
    'dist',
    'local',
    'src/scripts/generate-shared-constants.ts'
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],

    'no-console': 'error',

    'no-magic-numbers': [
      'error',
      {
        ignore: [-1, 0, 1, 2, 10, 100, 1000],
        ignoreArrayIndexes: true,
        enforceConst: true
      }
    ],

    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@nestjs/common',
            importNames: ['InternalServerErrorException'],
            message:
              "Please use 'InternalServerErrorExceptionWithData' instead."
          }
        ]
      }
    ],

    quotes: [
      'error',
      'single',
      {
        avoidEscape: true
      }
    ]
  },
  overrides: [
    {
      files: ['src/scripts/**'],
      rules: {
        'no-console': 'off'
      }
    },
    {
      files: ['src/database/migrations/**'],
      rules: {
        'require-await': 'off'
      }
    },
    {
      files: ['**/*.spec.ts'],
      rules: {
        'no-magic-numbers': 'off'
      }
    },
    {
      files: ['src/modules/internal/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@nestjs/common',
                importNames: ['InternalServerErrorException'],
                message:
                  "Please use 'InternalServerErrorExceptionWithData' instead."
              }
            ]
          }
        ]
      }
    }
  ]
}
