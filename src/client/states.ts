import { removeState, setState } from '@silexlabs/grapesjs-data-source'
import { Page } from 'grapesjs'

export default function(config/*, opts: EleventyPluginOptions */): void {
  config.getEditor().on('silex:settings:save:end', (page: Page | undefined) => {
    // Not for site settings, only for page settings
    if(page) {
      const body = page.getMainComponent()
      const settings = page.get('settings') as Record<string, string>
      if(settings.eleventyPageData) {
        const [dataSourceId, fieldId] = settings.eleventyPageData.split('.')
        const dataSource = config.getEditor().DataSourceManager.get(dataSourceId)
        const type = dataSource.getTypes().find(type => type.id === fieldId)
        // Update body states with the new settings
        setState(body, 'pagination', { expression: [{
          label: 'Current',
          type: 'property',
          propType: 'field',
          fieldId,
          dataSourceId,
          typeIds: [type.id],
          kind: 'object',
        }]},
        true)
      } else {
        removeState(body, 'page', true)
      }
    }
  })
}