import { removeState, setState, COMPONENT_NAME_PREFIX, Property, toExpression } from '@silexlabs/grapesjs-data-source'
import { Silex11tyPluginWebsiteSettings } from '../client'
import { Editor } from 'grapesjs'

export default function(config/*, opts: EleventyPluginOptions */): void {
  config.on('silex:grapesjs:end', () => {
    config.getEditor().on('page:select page:update', () => update(config))
  })
  config.on('settings:save:start', () => update(config))
}

function update(config) {
  const editor = config.getEditor() as Editor
  const page = editor.Pages.getSelected()
  const body = page?.getMainComponent()
  if (!body) return // This happens when the current page is deleted
  // Do not show "Body's " prefix for states on the body
  body.set(COMPONENT_NAME_PREFIX, '')
  // Store pagination data in the body component
  // This is for the GraphQL query to include it
  const settings = page?.get('settings') as Silex11tyPluginWebsiteSettings | undefined
  const pageData = toExpression(settings?.eleventyPageData) as (Property[] | null)
  if (pageData && pageData.length > 0) {
    try {
      // Useless until proven useful:
      // Test the type of the eleventyPageData expression
      // const type = getExpressionResultType(pageData, body, editor.DataSourceManager.getDataTree())
      // if (!type) {
      //   console.error('Invalid type for eleventyPageData')
      //   removeState(body, 'pagination', true)
      //   editor.runCommand('notifications:add', {
      //     type: 'error',
      //     message: 'Invalid type for eleventyPageData',
      //     group: 'Errors in your settings',
      //     componentId: body.id,
      //   })
      //   return
      // }
      // if (type.kind === 'scalar') {
      //   console.error('Invalid type for eleventyPageData: a list is required, got a scalar type')
      //   removeState(body, 'pagination', true)
      //   editor.runCommand('notifications:add', {
      //     type: 'error',
      //     message: 'Invalid type for eleventyPageData: a list is required, got a scalar type',
      //     group: 'Errors in your settings',
      //     componentId: body.id,
      //   })
      //   return
      // }
      // Update body states with the new settings
      setState(body, 'pagination', {
        hidden: true,
        label: 'pagination',
        expression: [{
          label: 'Unused pagination label',
          type: 'property',
          propType: 'field',
          fieldId: 'pagination',
          dataSourceId: 'eleventy',
          typeIds: ['pagination'],
          kind: 'object',
        }]
      }, true, 0)
      // Taken from the pagination object https://www.11ty.dev/docs/pagination/
      // items: [], // Array of current page’s chunk of data
      setState(body, 'items', {
        hidden: true,
        label: 'pagination.items',
        expression: pageData,
      }, true, 1)
      // Useless until proven useful:
      // FIXME: is this supposed to be an array of arrays of pages?
      // Taken from the pagination object https://www.11ty.dev/docs/pagination/
      // pages: [], // Array of all chunks of paginated data (in order)
      // setState(body, 'pages', {
      //   hidden: true,
      //   label: 'pagination.pages',
      //   expression: pageData,
      // }, true, 2)
    } catch (e) {
      console.error('Invalid JSON for eleventyPageData', e)
      removeState(body, 'pagination', true)
      editor.runCommand('notifications:add', {
        type: 'error',
        message: 'Invalid JSON for eleventyPageData',
        group: 'Errors in your settings',
        componentId: body.id,
      })
      return
    }
  } else {
    removeState(body, 'pagination', true)
    removeState(body, 'items', true)
    // For backward compatibility
    removeState(body, 'pages', true)
  }
}
