/**
 * @fileoverview DataSource configuration with defaults
 */

import DataSourcePlugin from '@silexlabs/grapesjs-data-source'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { EleventyPluginOptions } from '../client'
import { Editor, EditorConfig } from 'grapesjs'

const settingsEl = document.createElement('div')

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
      settingsEl: () => settingsEl,
      defaultFixed: true,
      // Show all editors by default
      disableStates: false,
      disableAttributes: false,
      disableProperties: false,
    },
    // Liquid filters
    filters: 'liquid',
    // Default data source
    dataSources: [],
    // Enable 11ty publication and filters
    enable11ty: true,
    // 11ty plugins
    // fetchPlugin: { cache: 'no-cache' },
    // i18nPlugin: true,
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
