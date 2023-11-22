import { removeState, setState } from '@silexlabs/grapesjs-data-source'

export default function(config/*, opts: EleventyPluginOptions */): void {
  config.getEditor().on('page:select page:update', () => {
    console.log('page:select page:update')
    const page = config.getEditor().Pages.getSelected()
    const body = page.getMainComponent()
    const settings = page.get('settings') as Record<string, string>
    if (settings?.eleventyPageData) {
      const [dataSourceId, fieldId] = settings.eleventyPageData.split('.')
      const dataSource = config.getEditor().DataSourceManager.get(dataSourceId)
      const type = dataSource.getTypes().find(type => type.id === fieldId)
      // Update body states with the new settings
      setState(body, 'pagination', {
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
        expression: [{
          label: 'Unused items label',
          type: 'property',
          propType: 'field',
          fieldId,
          dataSourceId,
          typeIds: [type.id],
          kind: 'list',
        }]
      },
      true)
      // Taken from the pagination object https://www.11ty.dev/docs/pagination/
      // pages: [], // Array of all chunks of paginated data (in order)
      setState(body, 'pages', {
        expression: [{
          label: 'Unused pages label',
          type: 'property',
          propType: 'field',
          fieldId,
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
}