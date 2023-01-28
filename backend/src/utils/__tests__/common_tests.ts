import { isNullOrEmpty } from '@root/utils/common'

describe('isNullOrEmpty', () => {
  test('should be true if null', () => {
    const res = isNullOrEmpty(null)
    expect(res).toBeTruthy()
  })

  test('should be true if undefined', () => {
    const res = isNullOrEmpty(null)
    expect(res).toBeTruthy()
  })

  test('should be true if string and `` ', () => {
    const res = isNullOrEmpty('')
    expect(res).toBeTruthy()
  })

  test('should be true if {}', () => {
    const res = isNullOrEmpty({})
    expect(res).toBeTruthy()
  })

  test('should be true if array and empty', () => {
    const res = isNullOrEmpty([])
    expect(res).toBeTruthy()
  })
})
