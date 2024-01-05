/**
 * @fileoverview DataSource configuration with defaults
 */

import DataSourcePlugin from '@silexlabs/grapesjs-data-source'
import { GraphQLOptions } from '@silexlabs/grapesjs-data-source/src/datasources/GraphQL'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { EleventyPluginOptions } from '../client'
import { Editor, EditorConfig } from 'grapesjs'

/**
 * Get the config for the data source plugin out of the client config
 */
export function optionsToGrapesJsConfig(options: EleventyPluginOptions): EditorConfig {
  return {
    plugins: [
      DataSourcePlugin as (editor: Editor, options) => void,
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
      el: () => config.getEditor().Panels.getPanel('views-container')?.view.el,
      button: () => config.getEditor().Panels.getPanel('views')!.get('buttons')!.get('open-tm'),
    },
    // Liquid filters
    filters: 'liquid',
    // Default data source
    dataSources: [
      {
        id: 'countries api', // FIXME: the ID is displayed in the completion, not the label
        type: 'graphql',
        label: 'Countries API',
        url: 'https://countries.trevorblades.com/graphql',
        method: 'POST',
        headers: {},
      } as GraphQLOptions
    ],
    // 11ty plugins
    fetchPlugin: {
      duration: '1s',
      type: 'json',
    },
    imagePlugin: true,
    i18nPlugin: true,
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
