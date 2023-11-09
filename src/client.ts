import { DataSourceEditorOptions } from '@silexlabs/grapesjs-data-source'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { getDataSourceConfig } from './client/panel'
import { getPublicationTransformer } from './client/publication'

export default function (config: ClientConfig, options: DataSourceEditorOptions) {
  // Generate the liquid when the site is published
  config.addPublicationTransformers(getPublicationTransformer())

  // Get the config for the data source plugin
  const dataSourceConfig = getDataSourceConfig(config)

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
