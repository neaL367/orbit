import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'https://graphql.anilist.co/',
  documents: [
    'app/**/*.{ts,tsx}', 
    'lib/graphql/queries/**/*.{ts,tsx}', 
    'features/**/*.{ts,tsx}'
  ],
  ignoreNoDocuments: true,
  generates: {
    './lib/graphql/types/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-query',
        {
          add: {
            content: "import { TypedDocumentString } from './typed-document';",
          },
        },
      ],
      config: {
        documentMode: 'string',
        fetcher: {
          func: '../fetcher#fetcher',
          isReactHook: false,
        },
        reactQueryVersion: 5,
        addInfiniteQuery: true,
        exposeQueryKeys: true,
        exposeFetcher: true,
      },
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