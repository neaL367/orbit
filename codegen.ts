import type { CodegenConfig } from '@graphql-codegen/cli'

const ANILIST_API_URL = 'https://graphql.anilist.co/'

const config: CodegenConfig = {
  schema: ANILIST_API_URL,
  documents: ['src/app/**/*.{ts,tsx}', 'src/lib/graphql/queries/**/*.{ts,tsx}'],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/lib/graphql/types/': {
      preset: 'client',
      config: {
        documentMode: 'string'
      }
    },
    './schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true
      }
    }
  }
}

export default config