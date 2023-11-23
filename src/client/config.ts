/**
 * @fileoverview DataSource configuration with defaults
 */

import DataSourcePlugin, { DataSourceEditorOptions } from '@silexlabs/grapesjs-data-source'
import { GraphQLOptions } from '@silexlabs/grapesjs-data-source/src/datasources/GraphQL'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'

/**
 * Get the config for the data source plugin out of the client config
 */
export function optionsToGrapesJsConfig(options: DataSourceEditorOptions) {
  return {
    plugins: [
      DataSourcePlugin,
    ],
    pluginsOpts: {
      [DataSourcePlugin.toString()]: {
        ...options,
      },
    },
  }
}

/**
 * Default for the data source plugin to work without config
 */
export function getZeroConfig(config: ClientConfig): DataSourceEditorOptions {
  return {
    // UI config
    view: {
      appendTo: () => config.getEditor().Panels.getPanel('views-container')?.view.el,
      button: () => config.getEditor().Panels.getPanel('views')!.get('buttons')!.get('open-tm'),
    },
    // Liquid filters
    filters: 'liquid',
    // Default data source
    dataSources: [{
      id: 'countries',
      type: 'graphql',
      label: 'Countries',
      url: 'https://countries.trevorblades.com/graphql',
      method: 'POST',
      headers: {},
    } as GraphQLOptions],
  }
}
