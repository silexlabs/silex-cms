/**
 * @fileoverview DataSource configuration with defaults
 */

import DataSourcePlugin from '@silexlabs/grapesjs-data-source'
import { GraphQLOptions } from '@silexlabs/grapesjs-data-source/src/datasources/GraphQL'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { EleventyPluginOptions } from '../client'

/**
 * Get the config for the data source plugin out of the client config
 */
export function optionsToGrapesJsConfig(options: EleventyPluginOptions) {
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
export function getZeroConfig(config: ClientConfig): EleventyPluginOptions {
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
    // 11ty plugins
    fetchPlugin: {
      duration: '0s',
      type: 'json',
    },
    imagePlugin: false,
    i18nPlugin: false,
    // Default publication paths
    dir: {
      input: '',
      silex: '',
      assets: 'assets',
      css: 'css',
    },
    urls: {
      assets: '/assets',
      css: '/css',
    },
  }
}
