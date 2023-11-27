import dedent from 'dedent'
import { Component, Page } from 'grapesjs'
import { DataSourceEditor, IDataSourceModel, StateId, Token, getPersistantId, getState, getStateIds, getStateVariableName } from '@silexlabs/grapesjs-data-source'
import { echoBlock, ifBlock, loopBlock } from '../liquid'
import { EleventyPluginOptions } from '../client'
import { PublicationTransformer } from '@silexlabs/silex/src/ts/client/publication-transformers'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { ClientSideFile } from '@silexlabs/silex/src/ts/types'
// This breaks the unit tests in the github action only: import { ClientSideFileType, PublicationData } from '@silexlabs/silex/src/ts/types'

/**
 * A state with the real tokens instead of the stored tokens
 */
interface RealState {
  stateId: StateId,
  label?: string,
  tokens: Token[]
}

export default function(config: ClientConfig, options: EleventyPluginOptions) {
  config.on('silex:startup:end', () => {
    // Generate the liquid when the site is published
    config.addPublicationTransformers({
      renderComponent: (component, toHtml) => renderComponent(config, component, toHtml),
      transformPermalink: (path, type) => transformPermalink(path, type, options),
      transformPath: (path, type) => transformPath(path, type, options),
      transformFile: (file) => transformFile(file),
    })

    // Generate 11ty data files
    const editor = config.getEditor()
    editor.on('silex:publish:data', data => transformFiles(editor as DataSourceEditor, options, data))
  })
}

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
 * FIXME: expose this from silex
 */
function transformPaths(editor: DataSourceEditor, path: string, type): string {
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

/**
 * Transform the file name to be published
 */
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^a-z0-9-]/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

/**
 * Transform the files to be published
 * This hook is called just before the files are written to the file system
 */
function transformFiles(editor: DataSourceEditor, options: EleventyPluginOptions, data): void {
  editor.Pages.getAll().forEach(page => {
    // Add front matter to the HTML page
    const name = slugify(page.getName() || 'index')
    const path = transformPaths(editor, `/${name}.html`, 'html')
    const pageData = data.files.find(file => file.path === path)
    const settings = page.get('settings') as Record<string, string>
    // Permalink is either the one set in the page settings or the file name as a folder or index.html
    const permalink = settings?.eleventyPermalink || (path.endsWith('index.html') ? '/index.html' : `/${ path.split('/').pop()?.replace(/\.html$/, '') }/`)
    const frontMatter = dedent`---
      permalink: ${ permalink }
      ${settings?.eleventyPageData ? `pagination:
        data: ${settings.eleventyPageData}
        ${settings.eleventyPageSize ? `size: ${settings.eleventyPageSize}` : ''}
        ${settings.eleventyPageReverse ? 'reverse: true' : ''}
      ` : ''}
      ${settings?.eleventyNavigationKey ? `eleventyNavigation:
        key: ${settings.eleventyNavigationKey}
        ${settings.eleventyNavigationTitle ? `title: ${settings.eleventyNavigationTitle}` : ''}
        ${settings.eleventyNavigationOrder ? `order: ${settings.eleventyNavigationOrder}` : ''}
        ${settings.eleventyNavigationParent ? `parent: ${settings.eleventyNavigationParent}` : ''}
        ${settings.eleventyNavigationUrl ? `url: ${settings.eleventyNavigationUrl}` : ''}
      ` : ''}
      ---\n
    `
    // Render the body states
    const body = page.getMainComponent()
    const pagination = getState(body, 'pagination', true)
    let bodyStatesLiquid = ''
    if (pagination?.expression.length > 0) {
      //const block = getLiquidBlock(body, pagination.expression)
      const bodyId = getPersistantId(body)
      if (bodyId) {
        bodyStatesLiquid = dedent`
          {% assign ${getStateVariableName(bodyId, 'pagination')} = pagination %}
          {% assign ${getStateVariableName(bodyId, 'items')} = pagination.items %}
          {% assign ${getStateVariableName(bodyId, 'pages')} = pagination.pages %}
        `
      } else {
        console.error('body has no persistant ID => do not add liquid for 11ty data')
      }
    }
    
    // Render the HTML
    pageData.content = frontMatter + bodyStatesLiquid + pageData.content

    // Create the data file for this page
    const query = editor.DataSourceManager.getPageQuery(page)
    // Remove empty data source queries
    Object.entries(query).forEach(([key, value]) => {
      if (value.length === 0) {
        delete query[key]
      }
    })
    if(Object.keys(query).length > 0) {
      // There is at least 1 query in this page
      data.files?.push({
        type: 'other',
        path: transformPaths(editor, `/${slugify(page.getName() || 'index')}.11tydata.js`, 'html'),
        //path: `/${page.getName() || 'index'}.11tydata.js`,
        content: getDataFile(editor, page, query, options),
      })
    }
  })
}

/**
 * Generate the data file for a given page
 */
function getDataFile(editor: DataSourceEditor, page: Page, query: Record<string, string>, options: EleventyPluginOptions): string {
  const content = Object.entries(query).map(([dataSourceId, queryStr]) => {
    const dataSource = editor.DataSourceManager.get(dataSourceId)
    if (dataSource) {
      return queryToDataFile(dataSource, queryStr, options)
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

/**
 * Generate the fetch call for a given page
 */
function queryToDataFile(dataSource: IDataSourceModel, queryStr: string, options: EleventyPluginOptions): string {
  if (dataSource.get('type') !== 'graphql') {
    console.info('not graphql', dataSource)
    return ''
  }
  const s2s = dataSource.get('serverToServer')
  const url = s2s ? s2s.url : dataSource.get('url')
  const method = s2s ? s2s.method : dataSource.get('method')
  const headers = s2s ? s2s.headers : dataSource.get('headers')
  const headersStr = headers ? Object.entries(headers).map(([key, value]) => `'${key}': '${value}'`).join('\n') : ''
  return `
  result['${dataSource.id}'] = (await EleventyFetch('${url}', {
    type: 'json',
    ${options.fetchPlugin ? `...${JSON.stringify(options.fetchPlugin)},` : ''}
    fetchOptions: {
      headers: {
        'Content-Type': 'application/json',
        ${headersStr}
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
function renderComponent(config: ClientConfig, component: Component, toHtml: () => string): string | undefined {
  const dataTree = (config.getEditor() as DataSourceEditor).DataSourceManager.getDataTree()
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
    // From expression of stored tokens to tokens (with methods not only data)
    .map(({ stateId, state }) => ({
      stateId,
      label: state.label,
      tokens: state.expression.map(token => dataTree.fromStored(token)),
    }))
  // Convenience key value object
  const statesObj = statesArr
    .reduce((final, { stateId, label, tokens }) => ({
      ...final,
      [stateId]: {
        stateId,
        label,
        tokens,
      },
    }), {} as Record<StateId, RealState>)

  if (statesArr.length) {
    const tagName = component.get('tagName')
    if (tagName) {
      const hasSrc = !!statesObj.src?.tokens.length
      const hasHref = !!statesObj.href?.tokens.length
      const hasTitle = !!statesObj.title?.tokens.length
      const hasAlt = !!statesObj.alt?.tokens.length
      const hasStyle = !!statesObj.style?.tokens.length
      const hasClassName = !!statesObj.className?.tokens.length
      const hasInnerHtml = !!statesObj.innerHTML?.tokens.length
      const hasCondition = !!statesObj.condition?.tokens.length
      const hasData = !!statesObj.__data?.tokens.length

      // Initial attributes
      const originalAttributes = component.get('attributes') as Record<string, string>
      hasSrc && delete originalAttributes.src
      hasHref && delete originalAttributes.href
      hasTitle && delete originalAttributes.title
      hasAlt && delete originalAttributes.alt

      // New attributes
      const attributes = Object.entries(originalAttributes)
        .map(([key, value]) => makeAttribute(key, value)).join(' ')
        // SRC state
        + (hasSrc ? ` src="${echoBlock(component, statesObj.src.tokens)}"` : '')
        // HREF state
        + (hasHref ? ` href="${echoBlock(component, statesObj.href.tokens)}"` : '')
        // Title state
        + (hasTitle ? ` title="${echoBlock(component, statesObj.title.tokens)}"` : '')
        // Alt state
        + (hasAlt ? ` alt="${echoBlock(component, statesObj.alt.tokens)}"` : '')

      // Class names
      const className = component.getClasses().join(' ')
        + (hasClassName ? ` ${echoBlock(component, statesObj.className.tokens)}` : '')

      // Style attribute
      const style = Object.entries(component.getStyle()).map(([key, value]) => makeStyle(key, value)).join(' ')
        + (hasStyle ? ` ${echoBlock(component, statesObj.style.tokens)}` : '')
      const innerHtml = hasInnerHtml ? echoBlock(component, statesObj.innerHTML.tokens) : component.getInnerHTML()
      const [ifStart, ifEnd] = hasCondition ? ifBlock(component, statesObj.condition.tokens) : []
      const [forStart, forEnd] = hasData ? loopBlock('__data', component, statesObj.__data.tokens) : []
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

function toPath(path: (string | undefined)[]) {
  return '/' + path
    .filter(p => !!p)
    .map(p => p?.replace(/(^\/|\/$)/g, ''))
    .join('/')
}

function transformPermalink(path: string, type: string, options: EleventyPluginOptions): string {
  switch (type) {
  case 'html':
    return toPath([
      path
    ])
  case 'asset':
    return toPath([
      options.urls?.assets,
      path.replace(/^\/?assets\//, ''),
    ])
  case 'css': {
    return toPath([
      options.urls?.css,
      path.replace(/^\/?css\//, ''),
    ])
  }
  default:
    console.warn('Unknown file type in transform permalink:', type)
    return path
  }
}

function transformPath(path: string, type: string, options: EleventyPluginOptions): string {
  switch (type) {
  case 'html':
    return toPath([
      options.dir?.input,
      options.dir?.silex,
      options.dir?.html,
      path,
    ])
  case 'css':
    return toPath([
      options.dir?.input,
      options.dir?.silex,
      options.dir?.css,
      path.replace(/^\/?css\//, ''),
    ])
  case 'asset':
    return toPath([
      options.dir?.input,
      options.dir?.silex,
      options.dir?.assets,
      path.replace(/^\/?assets\//, ''),
    ])
  default:
    console.warn('Unknown file type in transform path:', type)
    return path
  }
}

function transformFile(file: ClientSideFile/*, options: EleventyPluginOptions*/): ClientSideFile {
  //const fileWithContent = file as ClientSideFileWithContent
  switch (file.type) {
  case 'html':
  case 'css':
  case 'asset':
    return file
  default:
    console.warn('Unknown file type in transform file:', file.type)
    return file
  }
}
