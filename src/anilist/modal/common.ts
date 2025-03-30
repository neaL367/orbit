export type GraphQLScalarValue = string | number | boolean | null | undefined
export type GraphQLObjectValue = { [key: string]: GraphQLValue }
export type GraphQLValue = GraphQLScalarValue | GraphQLObjectValue | GraphQLValue[]

export type GraphQLVariables = Record<string, GraphQLValue>

export interface AnilistResponse<T> {
  data: T;
  errors?: {
    message: string;
    status: number;
  }[];
}


export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface DateInfo {
  year: number | null;
  month: number | null;
  day: number | null;
}