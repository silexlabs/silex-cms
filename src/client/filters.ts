import { Field, Filter, Options } from '@silexlabs/grapesjs-data-source'
import { EleventyPluginOptions } from '../client'

export default function(config, opts: EleventyPluginOptions): void {
  config.on('silex:startup:end', () => {
    const dm = config.getEditor().DataSourceManager
    if(!dm) {
      throw new Error('No DataSourceManager found, did you forget to add the DataSource plugin?')
    }
    const initialFilters = dm.filters
    if (opts.imagePlugin) {
      dm.filters = [...initialFilters, ...imageFilters]
    }
    if (opts.i18nPlugin) {
      dm.filters = [...initialFilters, ...i18nFilters]
    }
  })
}

const imageFilters: Filter[] = [{
  type: 'filter',
  id: 'image',
  label: 'Image',
  validate: (input: Field | null) => !!input?.typeIds.includes('string'),
  apply: (input: unknown, options: Options) => `<img src="${input?.toString() ?? ''}" alt="${options.alt}" sizes="${options.sizes}" />`,
  output: (input: Field | null/*, options: Options*/) => ({ ...(input || {} as Field), typeIds: ['string'] }),
  options: {
    alt: '',
    sizes: '',
  },
  optionsForm: (input: Field | null, options: Options) => {
    if (!input) return null
    return `
      <div class="gjs-field">
        <label class="gjs-label">Alt</label>
        <input type="text" class="gjs-field-alt" name="alt" value="${options.alt}" />
      </div>
      <div class="gjs-field">
        <label class="gjs-label">Sizes</label>
        <input type="text" class="gjs-field-sizes" name="sizes" value="${options.sizes}" />
      </div>
    `
  },
}]

const i18nFilters: Filter[] = [{
  type: 'filter',
  id: 'locale_url',
  label: 'Locale URL',
  validate: (input: Field | null) => !!input?.typeIds.includes('string') && input?.kind === 'scalar',
  apply: (input: unknown/*, options: Options*/) => input,
  output: (input: Field | null/*, options: Options*/) => ({ ...(input || {} as Field), typeIds: ['string'] }),
  options: {},
}, {
  type: 'filter',
  id: 'locale_links',
  label: 'Locale links',
  validate: (input: Field | null) => !!input?.typeIds.includes('string') && input?.kind === 'scalar',
  apply: (input: unknown/*, options: Options*/) => ([{ url: input, lang: 'en', label: 'English' }, { url: input, lang: 'fr', label: 'Français' }]),
  output: (input: Field | null/*, options: Options*/) => ({ ...(input || {} as Field), typeIds: ['locale_link'], kind: 'list' }),
  options: {},
}]

