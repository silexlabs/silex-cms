/**
 * @fileoverview DataSource panel configuration
 */

import DataSourcePlugin from '@silexlabs/grapesjs-data-source'

export function getDataSourceConfig(config) {
  return {
    grapesJsConfig: {
      plugins: [
        DataSourcePlugin,
      ],
      pluginsOpts: {
        [DataSourcePlugin.toString()]: {
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
        },
      },
    },
  }
}