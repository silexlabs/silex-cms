import dedent from 'dedent'
import { Component, Page } from 'grapesjs'
import { BinariOperator, DataSourceEditor, DataTree, IDataSourceModel, Properties, State, StateId, StoredState, Token, UnariOperator, fromStored, getPersistantId, getState, getStateIds, getStateVariableName } from '@silexlabs/grapesjs-data-source'
import { assignBlock, echoBlock, ifBlock, loopBlock } from './liquid'
import { EleventyPluginOptions, Silex11tyPluginWebsiteSettings } from '../client'
import { PublicationTransformer } from '@silexlabs/silex/src/ts/client/publication-transformers'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { UNWRAP_ID } from './traits'
//import { ClientSideFile, ClientSideFileType, ClientSideFileWithContent, PublicationData } from '@silexlabs/silex/src/ts/types'

// FIXME: should be imported from silex
type ClientSideFile = {
  path: string,
  type: string,
}
type ClientSideFileWithContent = ClientSideFile & {
  content: string,
}
type PublicationData = {
  files?: ClientSideFile[],
}
enum ClientSideFileType {
  HTML = 'html',
  CSS = 'css',
  ASSET = 'asset',
  OTHER = 'other',
}
const ATTRIBUTE_MULTIPLE_VALUES = ['class', 'style']

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
      transformPermalink: options.enable11ty ? (path, type) => transformPermalink(path, type, options) : undefined,
      transformPath: options.enable11ty ? (path, type) => transformPath(path, type, options) : undefined,
      //transformFile: (file) => transformFile(file),
    })

    if(options.enable11ty) {
      // Generate 11ty data files
      // FIXME: should this be in the publication transformers?
      const editor = config.getEditor()
      editor.on('silex:publish:data', data => transformFiles(editor as unknown as DataSourceEditor, options, data))
    }
  })
}

/**
 * Make html attribute
 * Quote strings, no values for boolean
 */
function makeAttribute(key, value): string {
  switch (typeof value) {
  case 'boolean': return value ? key : ''
  default: return `${key}="${value}"`
  }
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

export function getPermalink(settings: Silex11tyPluginWebsiteSettings, slug: string): string | null {
  const isCollectionPage = !!settings.eleventyPageData
  const permalink = settings.eleventyPermalink
  const isHome = slug === 'index'
  // User provided a permalink explicitely
  if (permalink) {
    return permalink
  } else if(isCollectionPage) {
    // Let 11ty handle the permalink
    return null
  } else if (isHome) {
    // Normal home page
    return '/index.html'
  } else {
    // Use the page name
    return `/${slug}/index.html`
  }
}

/**
 * Get the front matter for a given page
 */
export function getFrontMatter(settings: Silex11tyPluginWebsiteSettings, slug: string, collection, lang = ''): string {
  const permalink = getPermalink(settings, slug)
    // Escape quotes in permalink
    // because it is in double quotes in the front matter
    ?.replace(/"/g, '\\"')

  return dedent`---
    ${settings?.eleventyPageData ? `pagination:
      data: ${settings.eleventyPageData}
      ${settings.eleventyPageSize ? `size: ${settings.eleventyPageSize}` : ''}
      ${settings.eleventyPageReverse ? 'reverse: true' : ''}
    ` : ''}
    ${permalink ? `permalink: "${permalink}"` : ''}
    ${lang ? `lang: "${lang}"` : ''}
    ${collection ? `collection: "${collection}"` : ''}
    ${settings?.eleventyNavigationKey ? `eleventyNavigation:
      key: ${settings.eleventyNavigationKey}
      ${settings.eleventyNavigationTitle ? `title: ${settings.eleventyNavigationTitle}` : ''}
      ${settings.eleventyNavigationOrder ? `order: ${settings.eleventyNavigationOrder}` : ''}
      ${settings.eleventyNavigationParent ? `parent: ${settings.eleventyNavigationParent}` : ''}
      ${settings.eleventyNavigationUrl ? `url: ${settings.eleventyNavigationUrl}` : ''}
    ` : ''}
  `
    // Prettify
    .split('\n')
    .filter(line => line.trim().length > 0)
    .concat(['', '---', ''])
    .join('\n')
}

/**
 * Get the body states for a given page
 */
export function getBodyStates(page: Page): string {
  // Render the body states
  const body = page.getMainComponent()
  const pagination = getState(body, 'pagination', true)
  if (pagination && pagination.expression.length > 0) {
    //const block = getLiquidBlock(body, pagination.expression)
    const bodyId = getPersistantId(body)
    if (bodyId) {
      return dedent`
        {% assign ${getStateVariableName(bodyId, 'pagination')} = pagination %}
        {% assign ${getStateVariableName(bodyId, 'items')} = pagination.items %}
        {% assign ${getStateVariableName(bodyId, 'pages')} = pagination.pages %}
      `
    } else {
      console.error('body has no persistant ID => do not add liquid for 11ty data')
    }
  }
  return ''
}

/**
 * Transform the files to be published
 * This hook is called just before the files are written to the file system
 * Exported for unit tests
 */
export function transformFiles(editor: DataSourceEditor, options: EleventyPluginOptions, data: PublicationData): void {
  editor.Pages.getAll().forEach(page => {
    // Get the page properties
    const slug = slugify(page.getName() || 'index')
    const settings = page.get('settings') as Silex11tyPluginWebsiteSettings ?? {}
    const languages = settings.silexLanguagesList?.split(',').map(lang => lang.trim()).filter(lang => !!lang)

    // Create the data file for this page
    const query = editor.DataSourceManager.getPageQuery(page)
    // Remove empty data source queries
    Object.entries(query).forEach(([key, value]) => {
      if (value.length === 0) {
        delete query[key]
      }
    })

    // Find the page in the published data
    if(!data.files) throw new Error('No files in publication data')
    const path = transformPaths(editor, `/${slug}.html`, 'html')
    const pageData = data.files.find(file => file.path === path) as ClientSideFileWithContent | undefined
    if(!pageData) throw new Error(`No file for path ${path}`)
    if(pageData.type !== ClientSideFileType.HTML) throw new Error(`File for path ${path} is not HTML`)
    const dataFile = Object.keys(query).length > 0 ? {
      type: ClientSideFileType.OTHER,
      path: transformPaths(editor, `/${slugify(page.getName() || 'index')}.11tydata.js`, 'html'),
      //path: `/${page.getName() || 'index'}.11tydata.js`,
      content: getDataFile(editor, page, query, options),
    } : null

    if(languages && languages.length > 0) {
      const pages: ClientSideFileWithContent[] = languages.flatMap(lang => {
        // Change the HTML
        const frontMatter = getFrontMatter(settings, slug, page.getName(), lang)
        const bodyStates = getBodyStates(page)
        const pageFile = {
          type: ClientSideFileType.HTML,
          path: path.replace(/\.html$/, `-${lang}.html`),
          content: frontMatter + bodyStates + pageData.content,
        }

        // Create the data file for this page
        if (dataFile) {
          return [pageFile, {
            ...dataFile,
            path: dataFile.path.replace(/\.11tydata\.js$/, `-${lang}.11tydata.js`),
          }] // It is important to keep pageFile first, see bellow
        }
        return pageFile
      })

      // Update the existing page
      const [existingPage, ...newPages] = pages
      pageData.content = existingPage.content
      pageData.path = existingPage.path

      // Add the other pages
      data.files.push(...newPages)
    } else {
      // Change the HTML
      const frontMatter = getFrontMatter(settings, slug, page.getName())
      const bodyStates = getBodyStates(page)

      // Update the page before it is published
      const content = frontMatter + bodyStates + pageData.content
      pageData.content = content

      // Add the data file
      if (dataFile) {
        // There is at least 1 query in this page
        data.files.push(dataFile)
      }
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
  // Add a cache buster to avoid caching between pages, this will still cache between 11ty builds
  const urlWithCacheBuster = url + (url.includes('?') ? '&' : '?') + 'cache_buster=' + Math.round(Math.random() * 1000000)
  const method = s2s ? s2s.method : dataSource.get('method')
  const headers = s2s ? s2s.headers : dataSource.get('headers')
  // Check that the content-type is set
  if(headers && !Object.keys(headers).find(key => key.toLowerCase() === 'content-type')) {
    console.warn('11ty plugin for Silex: no content-type in headers of the graphql query. I will set it to application/json for you. To avoid this warning, add a header with key "content-type" and value "application/json" in silex config.')
    headers['content-type'] = 'application/json'
  }
  const headersStr = headers ? Object.entries(headers).map(([key, value]) => `'${key}': \`${value}\`,`).join('\n') : ''
  return `
  try {
    result['${dataSource.id}'] = (await EleventyFetch(\`${urlWithCacheBuster}\`, {
      ${options.fetchPlugin ? `...${JSON.stringify(options.fetchPlugin)},` : ''}
      fetchOptions: {
        headers: {
          ${headersStr}
        },
        method: '${method}',
        body: JSON.stringify({
          query: \`${queryStr}\`,
        })
      }
    })).data
  } catch (e) {
    console.error('11ty plugin for Silex: error fetching graphql data', e, '${dataSource.id}', '${urlWithCacheBuster}', '${method}', \`${queryStr}\`)
    throw e
  }
`
}

/**
 * Make stored states into real states
 * Filter out hidden states and empty expressions
 */
function getRealStates(dataTree: DataTree, states: {stateId: StateId, state: StoredState}[]): {stateId: StateId, label: string, tokens: State[]}[] {
  return states
    .filter(({ state }) => !state.hidden)
    .filter(({ state }) => state.expression.length > 0)
    // From expression of stored tokens to tokens (with methods not only data)
    .map(({ stateId, state }) => ({
      stateId,
      label: state.label || stateId,
      tokens: state.expression.map(token => fromStored(token, dataTree)),
    }))
}

/**
 * Check if a state is an attribute
 * Exported for unit tests
 */
export function isAttribute(label: string): boolean {
  if(!label) return false
  return !Object.values(Properties).includes(label as Properties)
}

/**
 * Build the attributes string for a given component
 * Handle attributes which appear multiple times (class, style)
 * Append to the original attributes
 * Exported for unit tests
 */
export function buildAttributes(originalAttributes: Record<string, string>, attributeStates: {stateId: StateId, label: string, value: string}[] ): string {
  const attributesArr = Object.entries(originalAttributes)
    // Start with the original attributes
    .map(([label, value]) => ({
      stateId: label,
      label,
      value,
    }))
    // Override or add state attributes
    .concat(attributeStates)
    // Handle attributes which appear multiple times
    .reduce((final, { stateId, label, value }) => {
      const existing = final.find(({ label: existingLabel }) => existingLabel === label)
      if (existing) {
        if(ATTRIBUTE_MULTIPLE_VALUES.includes(label)) {
          // Add to the original value
          existing.value += ' ' + value
        } else {
          // Override the original value
          existing.value = value
        }
      } else {
        // First time we see this attribute
        final.push({
          stateId,
          label,
          value,
        })
      }
      // Return the original array
      return final
    }, [] as ({stateId: StateId, value: string | boolean, label: string})[])
  // Build final result
  return attributesArr
    // Convert to key="value" string
    .map(({ label, value }) => makeAttribute(label, value))
    // Back to string
    .join(' ')
}

/**
 * Render the components when they are published
 */
function renderComponent(config: ClientConfig, component: Component, toHtml: () => string): string | undefined {
  const dataTree = (config.getEditor() as unknown as DataSourceEditor).DataSourceManager.getDataTree()

  const statesPrivate = getRealStates(dataTree, getStateIds(component, false)
    .map(stateId => ({
      stateId,
      state: getState(component, stateId, false)!,
    })))

  const statesPublic = getRealStates(dataTree, getStateIds(component, true)
    .map(stateId => ({
      stateId,
      state: getState(component, stateId, true)!,
    })))

  const unwrap = component.get(UNWRAP_ID)

  if (statesPrivate.length > 0 || statesPublic.length > 0 || unwrap) {
    const tagName = component.get('tagName')?.toLowerCase()
    if (tagName) {
      // Convenience key value object
      const statesObj = statesPrivate
        // Filter out attributes, keep only properties
        .filter(({ label }) => !isAttribute(label))
        // Add states
        .concat(statesPublic)
        .reduce((final, { stateId, label, tokens }) => ({
          ...final,
          [stateId]: {
            stateId,
            label,
            tokens,
          },
        }), {} as Record<Properties, RealState>)

      const hasInnerHtml = !!statesObj.innerHTML?.tokens.length
      const hasCondition = !!statesObj.condition?.tokens.length
      const hasData = !!statesObj.__data?.tokens.length

      // Style attribute
      const innerHtml = hasInnerHtml ? echoBlock(component, statesObj.innerHTML.tokens) : component.getInnerHTML()
      const operator = component.get('conditionOperator') ?? UnariOperator.TRUTHY
      const binary = operator && Object.values(BinariOperator).includes(operator)
      const [ifStart, ifEnd] = hasCondition ? ifBlock(component, binary ? {
        expression: statesObj.condition.tokens,
        expression2: statesObj.condition2?.tokens ?? [],
        operator,
      } : {
        expression: statesObj.condition.tokens,
        operator,
      }) : []
      const [forStart, forEnd] = hasData ? loopBlock(dataTree, component, statesObj.__data.tokens) : []
      const states = statesPublic
        .map(({ stateId, tokens }) => assignBlock(stateId, component, tokens))
        .join('\n')
      const before = (states ?? '') + (forStart ?? '') + (ifStart ?? '')
      const after =  (ifEnd ?? '') + (forEnd ?? '')

      // Attributes
      const originalAttributes = component.get('attributes') as Record<string, string>
      // Add css classes
      originalAttributes.class = component.getClasses().join(' ')
      // Make the list of attributes
      const attributes = buildAttributes(originalAttributes, statesPrivate
        // Filter out properties, keep only attributes
        .filter(({ label }) => isAttribute(label))
        // Make tokens a string
        .map(({ stateId, tokens, label }) => ({
          stateId,
          label,
          value: echoBlock(component, tokens),
        }))
      )
      if(unwrap) {
        return `${before}${innerHtml}${after}`
      }
      return `${before}<${tagName}${attributes ? ` ${attributes}` : ''}>${innerHtml}</${tagName}>${after}`
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

//function transformFile(file: ClientSideFile/*, options: EleventyPluginOptions*/): ClientSideFile {
//  //const fileWithContent = file as ClientSideFileWithContent
//  switch (file.type) {
//  case 'html':
//  case 'css':
//  case 'asset':
//    return file
//  default:
//    console.warn('Unknown file type in transform file:', file.type)
//    return file
//  }
//}
