/**
 * Minimal TypedDocumentString to satisfy GraphQL Codegen and our custom fetcher.
 * This class allows us to carry type information for results and variables 
 * within a standard string-like object.
 */
export class TypedDocumentString<TResult, TVariables> extends String {
  __apiType?: (variables: TVariables) => TResult;
  constructor(private value: string) {
    super(value);
  }
  override toString(): string {
    return this.value;
  }
}
