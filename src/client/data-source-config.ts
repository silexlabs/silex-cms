/**
 * @fileoverview DataSource configuration with defaults
 */

import DataSourcePlugin, { DataSourceEditorOptions } from '@silexlabs/grapesjs-data-source'

export function getDataSourceConfig(config, options: DataSourceEditorOptions) {
  return {
    grapesJsConfig: {
      plugins: [
        DataSourcePlugin,
      ],
      pluginsOpts: {
        [DataSourcePlugin.toString()]: {
          // Defaults
          dataSources: [{
            id: 'countries',
            type: 'graphql',
            name: 'Countries',
            url: 'https://countries.trevorblades.com/graphql',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }],
          view: {
            appendTo: () => config.getEditor().Panels.getPanel('views-container')?.view.el,
            button: () => config.getEditor().Panels.getPanel('views')?.get('buttons')?.get('open-tm'),
          },
          filters: 'liquid',
          // Override
          ...options,
        },
      },
    },
  }
}