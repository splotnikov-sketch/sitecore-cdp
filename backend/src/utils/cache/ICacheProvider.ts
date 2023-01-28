export interface ICacheProvider {
  connect(): Promise<void>
  get(key: string): Promise<string | undefined | null>
  set(key: string, value: string, expireAfter: number): Promise<void>
  close(): Promise<void>
}
