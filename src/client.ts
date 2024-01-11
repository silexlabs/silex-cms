import { DataSourceEditorOptions } from '@silexlabs/grapesjs-data-source'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { optionsToGrapesJsConfig, getZeroConfig } from './client/config'
import publication from './client/publication'
import settings from './client/settings'
import { Plugin } from '@silexlabs/silex-plugins'
import states from './client/states'
import DataSource from './client/DataSource'
import filters from './client/filters'
import merge from 'deepmerge'
import { WebsiteSettings } from '@silexlabs/silex/src/ts/types'

export interface EleventyPluginOptions extends DataSourceEditorOptions {
  // 11ty fetch plugin options
  // https://www.11ty.dev/docs/plugins/fetch/
  // Default: { duration: '1d', type: 'json' }
  fetchPlugin?: object,
  // Image plugin enabled to add specific filters
  // https://www.11ty.dev/docs/plugins/image/
  // Default: false
  imagePlugin?: boolean,
  // Internationalization plugin enabled to add specific filters
  // https://www.11ty.dev/docs/plugins/i18n/
  // Default: false
  i18nPlugin?: boolean,
  // Publication paths based on 11ty file structure
  dir?: {
    // Directory for 11ty input files
    // Silex will publish in /_silex/ in this directory
    // E.g. content
    // Default: ''
    input?: string,
    // Directory created in input directory for Silex files
    // Default: _silex
    silex?: string,
    // Directory for the HTML pages relative to the input directory
    // Silex will add HTML pages to this directory
    // Default: ''
    html?: string,
    // Directory for the assets relative to the input directory
    // Silex will add assets to this directory
    // Default assets
    assets?: string,
    // Directory for the CSS files relative to the input directory
    // Silex will add CSS files to this directory
    // Default css
    css?: string,
  },
  urls?: {
    // URL where the CSS files will be accessible to the front end
    // Default: css
    css?: string,
    // URL where the assets will be accessible to the front end
    // Default: assets
    assets?: string,
  },
}

export interface Silex11tyPluginWebsiteSettings extends WebsiteSettings {
  eleventyPageData?: string,
  eleventyPermalink?: string,
  eleventyPageSize?: number,
  eleventyPageReverse?: boolean,
  silexLanguagesList?: string,
  silexLanguagesDefault?: string,
  eleventyNavigationKey?: string,
  eleventyNavigationTitle?: string,
  eleventyNavigationOrder?: number,
  eleventyNavigationParent?: string,
  eleventyNavigationUrl?: string,
}

export default function (config: ClientConfig, options: Partial<EleventyPluginOptions> = {}) {
  // Options with default
  const opts = merge(
    getZeroConfig(config) as EleventyPluginOptions,
    options,
    { arrayMerge: (_, sourceArray) => sourceArray }, // Do not merge arrays by concatenation, just replace if present
  ) as EleventyPluginOptions

  // Wait for the editor to be ready
  // Add the plugins can access editor.DataSourceManager
  config.addPlugin([
    DataSource as Plugin,
    settings as Plugin,
    states as Plugin,
    filters as Plugin,
    publication as Plugin,
  ], opts)

  // Get the config for the data source plugin
  const grapesJsConfig = optionsToGrapesJsConfig(opts)

  // Merge the initial config with GrapesJs config
  // Returns the new config
  config.grapesJsConfig = grapesJsConfig
  // Add styles on the editor to override the default colors
  document.head.insertAdjacentHTML('beforeend', `<style>
    :root {
      --ds-lowlight: #292929 !important;
      --tertiary-color: #a291ff !important;
      --ds-highlight: #a291ff !important;
    }
  </style>`)
  return config
}
