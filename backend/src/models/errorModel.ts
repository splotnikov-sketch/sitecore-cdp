export type ErrorModel = { error: { type: string; message: string } }

export const isErrorModel = (obj: unknown): obj is ErrorModel => {
  if (obj !== null && typeof obj === 'object') {
    return 'error' in obj
  }
  return false
}
