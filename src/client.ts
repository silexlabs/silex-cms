import { DataSourceEditor, DataSourceEditorOptions } from '@silexlabs/grapesjs-data-source'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { optionsToGrapesJsConfig, getZeroConfig } from './client/config'
import { renderComponent, transformFiles } from './client/publication'
import settings from './client/settings'
import { Plugin } from '@silexlabs/silex-plugins'
import states from './client/states'
import DataSource from './client/DataSource'
import filters from './client/filters'

export interface EleventyPluginOptions extends DataSourceEditorOptions {
  // Image plugin enabled to add specific filters
  // https://www.11ty.dev/docs/plugins/image/
  imagePlugin: boolean,
  // Internationalization plugin enabled to add specific filters
  // https://www.11ty.dev/docs/plugins/i18n/
  i18nPlugin: boolean,
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

  config.on('silex:startup:end', () => {
    // Add plugins for collection pages
    config.addPlugin([settings as Plugin, states as Plugin, DataSource as Plugin, filters as Plugin], opts)

    // Generate 11ty data files
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
