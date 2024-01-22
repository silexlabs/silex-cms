import { Field, Filter, Options, State, getContext, getPersistantId, getStateVariableName } from '@silexlabs/grapesjs-data-source'
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
    // Eleventy provided filters: https://www.11ty.dev/docs/filters/#eleventy-provided-filters
    dm.filters.push({
      type: 'filter',
      id: 'log',
      label: 'log (11ty)',
      validate: (field: Field | null) => !!field,
      output: type => type,
      apply: (str) => {
        console.info(str)
        return str
      },
      options: {},
    }, {
      type: 'filter',
      id: 'slugify',
      label: 'slugify (11ty)',
      validate: (field: Field | null) => !!field && field.typeIds.map(t => t.toLowerCase()).includes('string') && field.kind === 'scalar',
      output: type => type,
      apply: (str) => {
        return str.toString().toLowerCase().replace(/\s+/g, '-')
      },
      options: {},
    })
  })

  const imageFilters: Filter[] = [{
    type: 'filter',
    id: 'image',
    label: 'image (11ty)',
    validate: (input: Field | null) => !!input?.typeIds.map(t => t.toLowerCase()).includes('string'),
    apply: (input: unknown, options: Options) => `<img src="${input?.toString() ?? ''}" alt="${options.alt}" sizes="${options.sizes}" />`,
    output: (input: Field | null/*, options: Options*/) => ({ ...(input || {} as Field), typeIds: ['String'] }),
    quotedOptions: ['alt'],
    optionsKeys: ['alt', 'sizes', 'widths'],
    options: {
      alt: '',
      sizes: '',
      widths: '',
    },
    optionsForm: (input: Field | null, options: Options) => {
      const selected = config.getEditor().getSelected()
      const states = getContext(selected, config.getEditor().DataSourceManager.getDataTree()) as State[]
      return html`
        <form>
          <details>
            <summary>Help</summary>
            Check <a href="https://www.11ty.dev/docs/plugins/image/" target="_blank">11ty's docs about image plugin</a> for more information.
          </details>
          <label>Alt (select a custom state)
            <select name="alt">
              ${
  states
    .filter(token => token.type === 'state' && token.exposed)
    .map((state: State) => {
      const value = getStateVariableName(state.componentId, state.storedStateId)
      const component = (() => {
        let c = selected
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
    label: 'locale_url (11ty)',
    validate: (input: Field | null) => !!input?.typeIds.map(t => t.toLowerCase()).includes('string') && input?.kind === 'scalar',
    apply: (input: unknown/*, options: Options*/) => input,
    output: (input: Field | null/*, options: Options*/) => ({ ...(input || {} as Field), typeIds: ['String'] }),
    options: {},
  }, {
    type: 'filter',
    id: 'locale_links',
    label: 'locale_links (11ty)',
    validate: (input: Field | null) => !!input?.typeIds.map(t => t.toLowerCase()).includes('string') && input?.kind === 'scalar',
    apply: (input: unknown/*, options: Options*/) => ([{ url: input, lang: 'en', label: 'English' }, { url: input, lang: 'fr', label: 'Français' }]),
    output: (input: Field | null/*, options: Options*/) => ({ ...(input || {} as Field), typeIds: ['locale_link'], kind: 'list' }),
    options: {},
  }]
}
