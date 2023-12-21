import { Field, Filter, Options, State, getPersistantId, getStateVariableName } from '@silexlabs/grapesjs-data-source'
import { EleventyPluginOptions } from '../client'
import { html } from 'lit-html'

export default function(config, opts: EleventyPluginOptions): void {
  config.on('silex:startup:end', () => {
    const dm = config.getEditor().DataSourceManager
    if(!dm) {
      throw new Error('No DataSourceManager found, did you forget to add the DataSource plugin?')
    }
    if (opts.imagePlugin) {
      dm.filters.push(...imageFilters)
    }
    if (opts.i18nPlugin) {
      dm.filters.push(...i18nFilters)
    }
  })

  const imageFilters: Filter[] = [{
    type: 'filter',
    id: 'image',
    label: 'Image',
    validate: (input: Field | null) => !!input?.typeIds.includes('String'),
    apply: (input: unknown, options: Options) => `<img src="${input?.toString() ?? ''}" alt="${options.alt}" sizes="${options.sizes}" />`,
    output: (input: Field | null/*, options: Options*/) => ({ ...(input || {} as Field), typeIds: ['String'] }),
    quotedOptions: ['alt'],
    options: {
      alt: '',
      sizes: '',
      widths: '',
    },
    optionsForm: (input: Field | null, options: Options) => {
      return html`
        <form>
          <details>
            <summary>Help</summary>
            Check <a href="https://www.11ty.dev/docs/plugins/image/" target="_blank">11ty's docs about image plugin</a> for more information.
          </details>
          <label>Alt (select a custom state)
            <select name="alt">
              ${
  config.getEditor().DataSourceManager.getDataTree().getContext()
    .filter(token => token.type === 'state' && token.exposed)
    .map((state: State) => {
      const value = getStateVariableName(state.componentId, state.storedStateId)
      const component = (() => {
        let c = config.getEditor().getSelected()
        while(c) {
          if(getPersistantId(c) === state.componentId) return c
          c = c.parent()
        }
        return null
      })()
      if(!component) {
        console.warn(`Could not find component with persistent ID ${state.componentId}`, { state })
        return ''
      }
      return `<option selected="${options.alt === value}" value="${value}">${component.getName()}'s ${state.label}</option>`
    })
    .join('\n')
}
            </select>
          </label>
          <label>Sizes attribute
            <input type="text" name="sizes" value="${options.sizes}" />
          </label>
          <label>Widths (JSON)
            <input type="text" name="widths" value="${options.widths}" />
          </label>
        <div class="buttons">
          <input type="reset" value="Cancel">
          <input type="submit" value="Apply">
        </div>
      `
    },
  }]

  const i18nFilters: Filter[] = [{
    type: 'filter',
    id: 'locale_url',
    label: 'Locale URL',
    validate: (input: Field | null) => !!input?.typeIds.includes('String') && input?.kind === 'scalar',
    apply: (input: unknown/*, options: Options*/) => input,
    output: (input: Field | null/*, options: Options*/) => ({ ...(input || {} as Field), typeIds: ['String'] }),
    quotedOptions: [],
    options: {},
  }, {
    type: 'filter',
    id: 'locale_links',
    label: 'Locale links',
    validate: (input: Field | null) => !!input?.typeIds.includes('String') && input?.kind === 'scalar',
    apply: (input: unknown/*, options: Options*/) => ([{ url: input, lang: 'en', label: 'English' }, { url: input, lang: 'fr', label: 'Français' }]),
    output: (input: Field | null/*, options: Options*/) => ({ ...(input || {} as Field), typeIds: ['locale_link'], kind: 'list' }),
    quotedOptions: [],
    options: {},
  }]
}
