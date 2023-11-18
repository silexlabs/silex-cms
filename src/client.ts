import { DataSourceEditor, DataSourceEditorOptions } from '@silexlabs/grapesjs-data-source'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { optionsToGrapesJsConfig, getZeroConfig } from './client/config'
import { renderComponent, transformFiles } from './client/publication'

export interface EleventyPluginOptions extends DataSourceEditorOptions {
  // ... add options for the eleventy plugin here
}
export default function (config: ClientConfig, options: Partial<EleventyPluginOptions> = {}) {
  // Options with default
  const opts = {
    ...getZeroConfig(config) as DataSourceEditorOptions,
    ...options,
  } as EleventyPluginOptions

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
  const grapesJsConfig = optionsToGrapesJsConfig(opts)

  // Merge the initial config with GrapesJs config
  // Returns the new config
  return {
    ...config,
    grapesJsConfig: {
      ...config.grapesJsConfig ?? {},
      ...grapesJsConfig,
      plugins: [
        ...config.grapesJsConfig?.plugins ?? [],
        ...grapesJsConfig.plugins,
      ],
      pluginsOpts: {
        ...config.grapesJsConfig?.pluginsOpts ?? {},
        ...grapesJsConfig.pluginsOpts,
      },
    },
  }
}
