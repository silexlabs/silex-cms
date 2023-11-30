/*
 * @jest-environment jsdom
 */

import dedent from 'dedent'
import {expect, test} from '@jest/globals'
import { getFrontMatter } from './publication'
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

test('Front matter of a simple page', () => {
  expect(() => getFrontMatter({}, 'page-1')).not.toThrow()
  expect(getFrontMatter({}, 'page-1')).toEqual(dedent`
  ---
  permalink: /page-1/index.html
  \n---\n`)
})

test('Front matter of a collection page', () => {
  const settings = {
    eleventyPageData: 'directus.posts',
  }
  expect(() => getFrontMatter(settings, 'page-1')).not.toThrow()
  expect(getFrontMatter(settings, 'page-1')).toEqual(dedent`
  ---
  pagination:
    data: directus.posts
  \n---\n`)
})

test('Permalink', () => {
  const eleventyPageData = 'directus.posts'
  const eleventyPermalink = '/test/{{ permalink[0] }}-with-special-chars/'
  const settings = {
    eleventyPageData,
    eleventyPermalink,
  }
  expect(() => getFrontMatter(settings, 'page-1')).not.toThrow()
  expect(getFrontMatter(settings, 'page-1')).toEqual(dedent`
  ---
  pagination:
    data: ${eleventyPageData}
  permalink: ${eleventyPermalink}
  \n---\n`)
})

test('With languages', () => {
  const settings = {
    eleventyPageData: 'directus.posts',
    silexLanguagesList: 'fr,en',
    silexLanguagesDefault: 'en',
  }
  expect(() => getFrontMatter(settings, 'page-1', 'fr')).not.toThrow()
  expect(getFrontMatter(settings, 'page-1', 'fr')).toEqual(dedent`
  ---
  pagination:
    data: directus.posts
  lang: fr
  \n---\n`)
})
