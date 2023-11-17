import { Component, Page } from 'grapesjs'
import { DataSourceEditor, StoredState, getState, getStateIds } from '@silexlabs/grapesjs-data-source'
import { echoBlock, ifBlock, loopBlock } from '../liquid'
import { EleventyPluginOptions } from '../client'
import { PublicationTransformer } from '@silexlabs/silex/src/ts/client/publication-transformers'
// This breaks the unit tests in the github action only: import { ClientSideFileType, PublicationData } from '@silexlabs/silex/src/ts/types'

/**
 * Make html attribute
 * Quote strings, no values for boolean
 */
function makeAttribute(key, value) {
  switch (typeof value) {
  case 'boolean': return value ? key : ''
  default: return `${key}="${value}"`
  }
}

/**
 * Make inline style
 */
function makeStyle(key, value) {
  return `${key}: ${value};`
}

/**
 * Comes from silex but didn't manage to import
 */
export function transformPath(editor: DataSourceEditor, path: string, type): string {
  const config = editor.getModel().get('config')
  return config.publicationTransformers.reduce((result: string, transformer: PublicationTransformer) => {
    try {
      return transformer.transformPath ? transformer.transformPath(result, type) ?? result : result
    } catch (e) {
      console.error('Publication transformer: error transforming path', result, e)
      return result
    }
  }, path)
}

export function transformFiles(editor: DataSourceEditor, options: EleventyPluginOptions, data): void {
  editor.Pages.getAll().forEach(page => {
    const query = editor.DataSourceManager.getPageQuery(page)
    // Remove empty data source queries
    Object.entries(query).forEach(([key, value]) => {
      if (value.length === 0) {
        delete query[key]
      }
    })
    if(Object.keys(query).length > 0) {
      data.files?.push({
        type: 'other',
        path: transformPath(editor, `/${page.getName() || 'index'}.11tydata.js`, 'other'),
        //path: `/${page.getName() || 'index'}.11tydata.js`,
        content: getDataFile(editor, page, query),
      })
    } else {
      // console.log('no query for page', page)
    }
  })
}

function getDataFile(editor: DataSourceEditor, page: Page, query: Record<string, string>): string {
  const content = Object.entries(query).map(([dataSourceId, queryStr]) => {
    const dataSource = editor.DataSourceManager.get(dataSourceId)
    if (dataSource) {
      return queryToDataFile(dataSource, queryStr)
    } else {
      console.error('No data source for id', dataSourceId)
      throw new Error(`No data source for id ${dataSourceId}`)
    }
  }).join('\n')
  return `
const EleventyFetch = require('@11ty/eleventy-fetch')
module.exports = async function () {
  const result = {}
  ${content}
  return result
}
  `
}

function queryToDataFile(dataSource, queryStr) {
  if (dataSource.get('type') !== 'graphql') {
    console.info('not graphql', dataSource)
    return ''
  }
  const url = dataSource.get('url')
  const method = dataSource.get('method')
  const headers = dataSource.has('headers') ? Object.entries(dataSource.get('headers')).map(([key, value]) => `'${key}': '${value}'`).join('\n') : ''
  return `
  result['${dataSource.id}'] = (await EleventyFetch('${url}', {
    duration: '2s',
    type: 'json',
    fetchOptions: {
      headers: {
        'content-type': 'application/json',
        ${headers}
      },
      method: '${method}',
      body: JSON.stringify({
        query: \`${queryStr}\`,
      })
    }
  })).data
`
}

/**
 * Render the components when they are published
 */
export function renderComponent(component: Component, toHtml: () => string): string | undefined {
  const statesIds = getStateIds(component, false)
  const statesArr = statesIds
    .map(stateId => ({
      stateId,
      state: getState(component, stateId, false),
    }))
    .concat(getStateIds(component, true).map(stateId => ({
      stateId,
      state: getState(component, stateId, true),
    })))
    .filter(({ state }) => state.expression.length > 0)
  // Convenience key value object
  const statesObj = statesArr
    .reduce((final, { stateId, state }) => ({
      ...final,
      [stateId]: state,
    }), {} as Record<string, StoredState>)

  if (statesArr.length) {
    const tagName = component.get('tagName')
    if (tagName) {
      const className = component.getClasses().join(' ')
        + (statesObj.className && statesObj.className?.expression.length ? ` ${echoBlock(component, statesObj.className.expression)}` : '')
      // Initial attributes
      const attributes = Object.entries(component.get('attributes') as object).map(([key, value]) => makeAttribute(key, value)).join(' ')
        // Attributes from attributes state
        + (statesObj.attributes && statesObj.attributes?.expression.length ? ` ${echoBlock(component, statesObj.attributes.expression)}` : '')
        // SRC state
        + (statesObj.src && statesObj.src?.expression.length ? ` src="${echoBlock(component, statesObj.src.expression)}"` : '')
        // HREF state
        + (statesObj.href && statesObj.href?.expression.length ? ` href="${echoBlock(component, statesObj.href.expression)}"` : '')
        // Title state
        + (statesObj.title && statesObj.title?.expression.length ? ` title="${echoBlock(component, statesObj.title.expression)}"` : '')
      const style = Object.entries(component.getStyle()).map(([key, value]) => makeStyle(key, value)).join(' ')
        + (statesObj.style && statesObj.style?.expression.length ? ` ${echoBlock(component, statesObj.style.expression)}` : '')
      const innerHtml = statesObj.innerHTML && statesObj.innerHTML?.expression.length ? echoBlock(component, statesObj.innerHTML.expression) : component.getInnerHTML()
      const [ifStart, ifEnd] = statesObj.condition?.expression.length ? ifBlock(component, statesObj.condition.expression) : []
      const [forStart, forEnd] = statesObj.__data?.expression.length ? loopBlock('__data', component, statesObj.__data.expression) : []
      const before = (ifStart ?? '') + (forStart ?? '')
      const after = (ifEnd ?? '') + (forEnd ?? '')
      return `${before}<${tagName}${attributes ? ` ${attributes}` : ''}${className ? ` class="${className}"` : ''}${style ? ` style="${style}"` : ''}>${innerHtml}</${tagName}>${after}`
    } else {
      // Not a real component
      // FIXME: understand why
      throw new Error('Why no tagName?')
    }
  } else {
    return toHtml()
  }
}