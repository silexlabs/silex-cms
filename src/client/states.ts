import { removeState, setState, COMPONENT_NAME_PREFIX } from '@silexlabs/grapesjs-data-source'
import { Silex11tyPluginWebsiteSettings } from '../client'

export default function(config/*, opts: EleventyPluginOptions */): void {
  config.on('silex:startup:end', () => {
    config.getEditor().on('page:select page:update', () => {
      const page = config.getEditor().Pages.getSelected()
      const body = page.getMainComponent()
      if(!body) return // This happens when the current page is deleted
      // Do not show "Body's " prefix for states on the body
      body.set(COMPONENT_NAME_PREFIX, '')
      const settings = page.get('settings') as Silex11tyPluginWebsiteSettings
      if (settings?.eleventyPageData) {
        const [dataSourceId, fieldId] = settings.eleventyPageData.split('.')
        const dataSource = config.getEditor().DataSourceManager.get(dataSourceId)
        const type = dataSource.getTypes().find(type => type.id === fieldId)
        // Update body states with the new settings
        setState(body, 'pagination', {
          hidden: true,
          label: 'Pagination',
          expression: [{
            label: 'Unused pagination label',
            type: 'property',
            propType: 'field',
            fieldId: 'pagination',
            dataSourceId: 'eleventy',
            typeIds: ['pagination'],
            kind: 'object',
          }]
        },
        true)
        // Taken from the pagination object https://www.11ty.dev/docs/pagination/
        // items: [], // Array of current page’s chunk of data
        setState(body, 'items', {
          hidden: true,
          label: 'Current items',
          expression: [{
            label: 'Unused items label',
            type: 'property',
            propType: 'field',
            fieldId: type.id,
            dataSourceId,
            typeIds: [type.id],
            kind: 'list',
          }]
        },
        true)
        // Taken from the pagination object https://www.11ty.dev/docs/pagination/
        // pages: [], // Array of all chunks of paginated data (in order)
        setState(body, 'pages', {
          hidden: true,
          label: 'All items',
          expression: [{
            label: 'Unused pages label',
            type: 'property',
            propType: 'field',
            fieldId: type.id,
            dataSourceId,
            typeIds: [type.id],
            kind: 'list',
          }]
        },
        true)
      } else {
        removeState(body, 'pagination', true)
        removeState(body, 'items', true)
        removeState(body, 'pages', true)
      }
    })
  })
}