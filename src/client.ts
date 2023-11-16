import { DataSourceEditor, DataSourceEditorOptions } from '@silexlabs/grapesjs-data-source'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { getDataSourceConfig } from './client/data-source-config'
import { renderComponent, transformFiles } from './client/publication'

export interface EleventyPluginOptions {
  /**
   * Options for the data source editor
   */
  dataSourceEditorOptions?: DataSourceEditorOptions
  /**
   * Use eleventy's fetch plugin to fetch data from data sources
   */
  useFetchPlugin: boolean
}
export default function (config: ClientConfig, options: Partial<EleventyPluginOptions> = {}) {
  // Defaults
  const opts: EleventyPluginOptions = {
    useFetchPlugin: false,
    ...options,
  }

  // Generate the liquid when the site is published
  config.addPublicationTransformers({
    renderComponent,
  })

  // Generate 11ty data files
  config.on('silex:startup:end', () => {
    console.log('ready')
    const editor = config.getEditor()
    editor.on('silex:publish:data', data => transformFiles(editor as DataSourceEditor, opts, data))
  })

  // Get the config for the data source plugin
  const dataSourceConfig = getDataSourceConfig(config, opts.dataSourceEditorOptions)

  // Merge the two configs
  return {
    ...config,
    ...dataSourceConfig,
    grapesJsConfig: {
      ...config.grapesJsConfig ?? {},
      ...dataSourceConfig.grapesJsConfig ?? {},
      plugins: [
        ...config.grapesJsConfig?.plugins ?? [],
        ...dataSourceConfig.grapesJsConfig?.plugins ?? [],
      ],
      pluginsOpts: {
        ...config.grapesJsConfig?.pluginsOpts ?? {},
        ...dataSourceConfig.grapesJsConfig?.pluginsOpts ?? {},
      },
    },
  }
}
