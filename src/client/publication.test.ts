/*
 * @jest-environment jsdom
 */

import dedent from 'dedent'
import { expect, jest, test } from '@jest/globals'
import { buildAttributes, getFrontMatter, isAttribute, queryToDataFile } from './publication'
import { IDataSourceModel } from '@silexlabs/grapesjs-data-source'
import { Page } from 'grapesjs'
//import grapesjs, { Page } from 'grapesjs'
//import { DataSourceEditor, DataSourceEditorOptions, getState } from '@silexlabs/grapesjs-data-source'
//
//const mockGetState = jest.fn()
//jest.mock('@silexlabs/grapesjs-data-source', () => {
//  return {
//    getState: jest.fn(() => mockGetState),
//  }
//})

// Prevent lit-html from being imported
// This is because it breakes the tests since lit-html is a peer dependency (?)
jest.mock('lit-html', () => ({}))

const PAGE_TEST = {
  getName: () => 'page name example',
  getId: () => 'page id example',
  getMainComponent: () => ({
    ccid: 'ccidtest',
  }),
} as unknown as Page

const PAGE_DATA_TEST = `[{
  "options": { "filter": "{}" },
  "type": "property",
  "propType": "field",
  "fieldId": "continents",
  "label": "continents",
  "typeIds": ["Continent"],
  "dataSourceId": "datasourceIdTest",
  "kind": "list"
}]`

const PAGE_DATA_FIXED_TEST = `[{
  "type": "property",
  "propType": "field",
  "fieldId": "fixed",
  "label": "Fixed value",
  "kind": "scalar",
  "typeIds": ["String"],
  "options": { "value": "/test/" }
}]`


test('Front matter of a simple page', () => {
  expect(() => getFrontMatter(PAGE_TEST, {}, 'page-1', '')).not.toThrow()
  expect(getFrontMatter(PAGE_TEST, {}, 'page-1', '')).toEqual(dedent`
  ---
  permalink: "/page-1/index.html"
  \n---\n`)
})

test('Front matter of a collection page', () => {
  const settings = {
    eleventyPageData: PAGE_DATA_TEST,
  }
  expect(() => getFrontMatter(PAGE_TEST, settings, 'page-1', 'collectionTest')).not.toThrow()
  expect(getFrontMatter(PAGE_TEST, settings, 'page-1', 'collectionTest')).toEqual(dedent`
  ---
  pagination:
    data: datasourceIdTest.continents
    size: 1
  collection: "collectionTest"
  \n---\n`)
})

test('Front matter of a collection page backward compatibility', () => {
  const settings = {
    eleventyPageData: PAGE_DATA_TEST,
  }
  expect(() => getFrontMatter(PAGE_TEST, settings, 'page-1', 'collectionTest')).not.toThrow()
  expect(getFrontMatter(PAGE_TEST, settings, 'page-1', 'collectionTest')).toEqual(dedent`
  ---
  pagination:
    data: datasourceIdTest.continents
    size: 1
  collection: "collectionTest"
  \n---\n`)
})

test('Permalink', () => {
  const eleventyPageData = PAGE_DATA_TEST
  const eleventyPermalink = PAGE_DATA_TEST
  const settings = {
    eleventyPageData,
    eleventyPermalink,
  }
  expect(() => getFrontMatter(PAGE_TEST, settings, 'page-1', '')).not.toThrow()
  expect(getFrontMatter(PAGE_TEST, settings, 'page-1', '')).toEqual(dedent`
  ---
  pagination:
    data: datasourceIdTest.continents
    size: 1
  permalink: "{% assign var_ccidtest_1 = datasourceIdTest.continents %}{{ var_ccidtest_1 }}"
  \n---\n`)
})

test('Permalink with fixed string expression', () => {
  const eleventyPageData = PAGE_DATA_TEST
  const eleventyPermalink = PAGE_DATA_FIXED_TEST
  const settings = {
    eleventyPageData,
    eleventyPermalink,
  }
  expect(() => getFrontMatter(PAGE_TEST, settings, 'page-1', '')).not.toThrow()
  expect(getFrontMatter(PAGE_TEST, settings, 'page-1', '')).toEqual(dedent`
  ---
  pagination:
    data: datasourceIdTest.continents
    size: 1
  permalink: "/test/"
  \n---\n`)
})

test('With languages', () => {
  const settings = {
    eleventyPageData: 'directus.posts',
    silexLanguagesList: 'fr,en',
    silexLanguagesDefault: 'en',
  }
  expect(() => getFrontMatter(PAGE_TEST, settings, 'page-1', '', 'fr')).not.toThrow()
  expect(getFrontMatter(PAGE_TEST, settings, 'page-1', '', 'fr')).toEqual(dedent`
  ---
  pagination:
    data: directus.posts
    size: 1
  lang: "fr"
  \n---\n`)
})

test('isAttribute', () => {
  expect(isAttribute('data-attribute')).toBe(true)
  expect(isAttribute('href')).toBe(true)
  expect(isAttribute('innerHTML')).toBe(false)
  expect(isAttribute('')).toBe(false)
})

test('buildAttributes', () => {
  const attributes = buildAttributes({
    'href': 'original-value',
    'class': 'original-value',
  }, [{
    stateId: 'href-id',
    label: 'href',
    value: 'new-value',
  }, {
    stateId: 'class-id',
    label: 'class',
    value: 'new-value',
  }])
  expect(attributes).toEqual('href="new-value" class="original-value new-value"')
})

test('getDataFile', () => {
  const dataSourceId = 'data source id example'
  const dataSource = {
    id: dataSourceId,
    get: jest.fn((name) => {
      switch (name) {
      case 'type': return 'graphql'
      case 'serverToServer': return {
        url: 'http://localhost:8055',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      }
      }
      throw new Error(`Unit test error, unknown name: ${name}`)
    }),
  } as unknown as IDataSourceModel
  const query = 'query str example'
  const result1 = queryToDataFile(
    dataSource,
    query,
    {
      cacheBuster: false,
      dataSources: [],
      view: {},
      filters: [],
      fetchPlugin: {},
    },
    PAGE_TEST,
    'fr',
    {},
  )
  // check that we have as much { as } in the result
  expect(result1.split('{').length).toBe(result1.split('}').length)
  expect(result1.split('(').length).toBe(result1.split(')').length)
  expect(result1).toContain('EleventyFetch(')
  expect(result1).toEqual(dedent`


  try {
    const json = await EleventyFetch(\`http://localhost:8055\`, {
    ...{},
    type: 'json',
    fetchOptions: {
      headers: {
        'content-type': \`application/json\`,
      },
      method: 'POST',
      body: JSON.stringify({
      query: \`${query}\`,
    }),
    }
    })
    result['${dataSourceId}'] = json.data
  } catch (e) {
    console.error('11ty plugin for Silex: error fetching graphql data', e, '${dataSourceId}', 'http://localhost:8055')
    throw e
  }
  `)
  const result2 = queryToDataFile(
    dataSource,
    query,
    {
      cacheBuster: false,
      dataSources: [],
      view: {},
      filters: [],
      fetchPlugin: false,
    },
    PAGE_TEST,
    'fr',
    false,
  )
  expect(result2).not.toContain('EleventyFetch')
  // check that we have as much { as } in the result
  expect(result2.split('{').length).toBe(result2.split('}').length)
  expect(result2.split('(').length).toBe(result2.split(')').length)
  const result3 = queryToDataFile(
    dataSource,
    query,
    {
      cacheBuster: false,
      dataSources: [],
      view: {},
      filters: [],
    },
    PAGE_TEST,
    'fr',
    false,
  )
  expect(result3).not.toContain('EleventyFetch')

  expect(result3).toEqual(dedent`


  try {
    const response = await fetch(\`http://localhost:8055\`, {

    headers: {
      'content-type': \`application/json\`,
    },
    method: 'POST',
    body: JSON.stringify({
      query: \`${query}\`,
    })
    })
    const json = await response.json()
    result['${dataSourceId}'] = json.data
  } catch (e) {
    console.error('11ty plugin for Silex: error fetching graphql data', e, '${dataSourceId}', 'http://localhost:8055')
    throw e
  }
  `)
})
