import { EleventyDataSourceTest } from './DataSource'

test('Init the data source', () => {
  const ds = new EleventyDataSourceTest()
  expect(() => ds.connect()).not.toThrow()
  expect(ds.getTypes()).toHaveLength(9)
  expect(ds.getQueryables()).toHaveLength(1)
  expect(ds.getQuery()).toBe('')
})
