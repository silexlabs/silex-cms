import { removeState, setState, COMPONENT_NAME_PREFIX, Property, DataSourceEditor, toExpression, getExpressionResultType } from '@silexlabs/grapesjs-data-source'
import { Silex11tyPluginWebsiteSettings } from '../client'

export default function(config/*, opts: EleventyPluginOptions */): void {
  config.on('silex:grapesjs:end', () => {
    config.getEditor().on('page:select page:update', () => update(config))
  })
  config.on('settings:save:start', () => update(config))
}

function update(config) {
  const editor = config.getEditor() as DataSourceEditor
  const page = editor.Pages.getSelected()
  const body = page?.getMainComponent()
  if (!body) return // This happens when the current page is deleted
  // Do not show "Body's " prefix for states on the body
  body.set(COMPONENT_NAME_PREFIX, '')
  // Store pagination data in the body component
  // This is for the GraphQL query to include it
  const settings = page?.get('settings') as Silex11tyPluginWebsiteSettings | undefined
  if (settings?.eleventyPageData) {
    try {
      const pageData = toExpression(settings.eleventyPageData) as Property[] || null
      const dataSourceId = pageData[0].dataSourceId
      const type = getExpressionResultType(pageData, body, editor.DataSourceManager.getDataTree())
      if (!type) {
        console.error('Invalid type for eleventyPageData')
        removeState(body, 'pagination', true)
        editor.runCommand('notifications:add', {
          type: 'error',
          message: 'Invalid type for eleventyPageData',
          group: 'Errors in your settings',
          componentId: body.id,
        })
        return
      }
      if (type.kind === 'scalar') {
        console.error('Invalid type for eleventyPageData: a list is required, got a scalar type')
        removeState(body, 'pagination', true)
        editor.runCommand('notifications:add', {
          type: 'error',
          message: 'Invalid type for eleventyPageData: a list is required, got a scalar type',
          group: 'Errors in your settings',
          componentId: body.id,
        })
        return
      }
      // Update body states with the new settings
      setState(body, 'pagination', {
        hidden: true,
        label: 'Pagination',
        expression: pageData
      }, true, 0)
      // Taken from the pagination object https://www.11ty.dev/docs/pagination/
      // items: [], // Array of current page’s chunk of data
      setState(body, 'items', {
        hidden: true,
        label: 'pagination.items',
        expression: [{
          label: 'Unused items label',
          type: 'property',
          propType: 'field',
          fieldId: type.id,
          dataSourceId,
          typeIds: [type.id],
          kind: 'list',
        }]
      }, true, 1)
      // Taken from the pagination object https://www.11ty.dev/docs/pagination/
      // pages: [], // Array of all chunks of paginated data (in order)
      setState(body, 'pages', {
        hidden: true,
        label: 'pagination.pages',
        expression: [{
          label: 'Unused pages label',
          type: 'property',
          propType: 'field',
          fieldId: type.id,
          dataSourceId,
          typeIds: [type.id],
          kind: 'list',
        }]
      }, true, 2)
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
    removeState(body, 'pages', true)
  }
}
