import { DataSourceEditor, removeState, setState, toExpression } from '@silexlabs/grapesjs-data-source'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
//import { ClientEvent } from '@silexlabs/silex/src/ts/client/events'
import { EleventyPluginOptions, Silex11tyPluginWebsiteSettings } from '../client'
import { html } from 'lit'
import { Page } from 'grapesjs'
import {ref, createRef, Ref} from 'lit/directives/ref.js'

const paginationWarning: Ref<HTMLElement> = createRef()

/**
 * Main function to add the settings to the page
 */
export default function(config: ClientConfig, opts: EleventyPluginOptions): void {
  if(!opts.enable11ty) return // Do not add the settings if 11ty is disabled
  config.on('silex:startup:end', () => {
    const editor = config.getEditor() as DataSourceEditor
    editor.on(/* ClientEvent.SETT(INGS_SAVE_START */'silex:settings:save:start', (page: Page) => updateBodyStates(editor, page))
    config.addSettings({
      id: 'cms',
      label: 'CMS',
      render: (settings: Silex11tyPluginWebsiteSettings) => render(settings, config),
    }, 'page')
  })
}

/**
 * Set the state on the body component
 * This is only useful to build the GraphQL query
 */
function stateOnBody(editor, value, name, body) {
  if (value) {
    const expression = toExpression(value)
    if(expression) {
      setState(body, name, {
        label: name,
        hidden: true,
        expression,
      })
    } else {
      console.error(`Invalid JSON for ${name}`)
      removeState(body, name)
      editor.runCommand('notifications:add', {
        type: 'error',
        message: `Invalid JSON for ${name}`,
        group: 'Errors in your settings',
      })
    }
  } else {
    removeState(body, name)
  }
}

/**
 * Set the state on the body component
 * This is only useful to build the GraphQL query
 */
function updateBodyStates(editor: DataSourceEditor, page: Page) {
  paginationWarning.value?.classList.add('silex-hidden')
  if (page) {
    const settings = page?.get('settings') as Silex11tyPluginWebsiteSettings | undefined
    if (settings) {
      const body = page.getMainComponent()
      stateOnBody(editor, settings.eleventySeoTitle, 'eleventySeoTitle', body)
      stateOnBody(editor, settings.eleventySeoDescription, 'eleventySeoDescription', body)
      stateOnBody(editor, settings.eleventyFavicon, 'eleventyFavicon', body)
      stateOnBody(editor, settings.eleventyOGImage, 'eleventyOGImage', body)
      stateOnBody(editor, settings.eleventyOGTitle, 'eleventyOGTitle', body)
      stateOnBody(editor, settings.eleventyOGDescription, 'eleventyOGDescription', body)
      stateOnBody(editor, settings.eleventyPageData, 'eleventyPageData', body)
      stateOnBody(editor, settings.eleventyPermalink, 'eleventyPermalink', body)
    }
  }
}

/**
 * Render the settings form
 */
function render(settings: Silex11tyPluginWebsiteSettings, config: ClientConfig) {
  setTimeout(() => {
    // Update the settings form when the selection changed without recreating the form
    (document.querySelectorAll('#settings-cms input') as NodeListOf<HTMLInputElement>)
      .forEach((input: HTMLInputElement) => {
        switch (input.type) {
        case 'checkbox':
          input.checked = !!settings[input.name]
          break
        default:
          input.value = settings[input.name] ?? ''
        }
      })
  })
  return html`
    <style>
      form.silex-form input[type="checkbox"] {
        width: 20px;
        height: 20px;
      }
      .settings-dialog > div .silex-form__element > label {
        border: none;
      }
    </style>
    <div id="settings-cms" class="silex-hideable silex-hidden">
      <div class="gjs-sm-sector-title">Silex CMS - Page settings</div>
      <div class="silex-help">
        The "Silex CMS" feature integrates <a target="_blank" href="https://www.11ty.dev/">11ty</a> static site generator and your favorite headless CMS with Silex.
        <br>Read the <a target="_blank" href="https://docs.silex.me/en/user/cms">documentation</a> to learn more.
      </div>
      <div class="silex-form__group col2">
        <label class="silex-form__element">
          <h3>Create pages from data</h3>
          <p class="silex-help">Pagination allows you to iterate over data and create multiple webiste pages from a single page in Silex. </p>
          <state-editor
            id="eleventyPageData"
            name="eleventyPageData"
            value=${settings.eleventyPageData ?? ''}
            .editor=${config.getEditor()}
            @change=${() => {
    paginationWarning.value?.classList.remove('silex-hidden')
  }}
            no-states
            no-filters
          >
            <label slot="label">Data</label>
          </state-editor>
          <div
            ${ref(paginationWarning)}
            class="silex-warning silex-hidden"
            style="margin-top: 10px; padding: 10px; background-color: #f8d7da; border-color: #f5c6cb; color: #721c24; border: 1px solid transparent; border-radius: .25rem;"
            >
            <p>Pagination data changed. Please click <strong>Apply</strong> and reload Silex. This will make it possible to set the permalink with the latest available data.</p>
          </div>
          <label class="silex-form__element">Size
            <input type="number" name="eleventyPageSize" .value=${settings.eleventyPageSize ?? 1}/>
          </label>
          <label class="silex-form__element">Reverse
            <input type="checkbox" name="eleventyPageReverse" ?checked=${!!settings.eleventyPageReverse}/>
          </label>
          <state-editor
            id="eleventyPermalink"
            name="eleventyPermalink"
            value=${settings.eleventyPermalink ?? ''}
            .editor=${config.getEditor()}
          >
            <label slot="label">Permalink</label>
          </state-editor>
          <label class="silex-form__element">Available languages
            <p class="silex-help">Silex can duplicate this page for each language and generate a different URL for each language.</p>
            <p class="silex-help">Provide a comma separated list of languages. For example: <code>en,fr</code>. An empty value will deactivate this feature.</p>
            <input type="text" name="silexLanguagesList" .value=${settings.silexLanguagesList ?? ''}/>
          </label>
        </label>
        <label class="silex-form__element">
          <h3>Navigation Plugin</h3>
          <p class="silex-help">This 11ty plugin enables infinite-depth hierarchical navigation in Eleventy projects. Supports breadcrumbs too! <a target="_blank" href="https://www.11ty.dev/docs/plugins/navigation/">Read more about the Navigation Plugin</a>.</p>
          <label class="silex-form__element">Key
            <input type="text" name="eleventyNavigationKey" .value=${settings.eleventyNavigationKey ?? ''}/>
          </label>
          <label class="silex-form__element">Title
            <input type="text" name="eleventyNavigationTitle" .value=${settings.eleventyNavigationTitle ?? ''}/>
          </label>
          <label class="silex-form__element">Order
            <input type="number" name="eleventyNavigationOrder" .value=${settings.eleventyNavigationOrder ?? ''}/>
          </label>
          <label class="silex-form__element">Parent
            <input type="text" name="eleventyNavigationParent" .value=${settings.eleventyNavigationParent ?? ''}/>
          </label>
          <label class="silex-form__element">URL
            <input type="text" name="eleventyNavigationUrl" .value=${settings.eleventyNavigationUrl ?? ''}/>
          </label>
        </label>
        <label class="silex-form__element">
          <h3>SEO</h3>
          <state-editor
            id="eleventySeoTitle"
            name="eleventySeoTitle"
            value=${settings.eleventySeoTitle ?? ''}
            .editor=${config.getEditor()}
          >
            <label slot="label">Title</label>
          </state-editor>
          <state-editor
            id="eleventySeoDescription"
            name="eleventySeoDescription"
            value=${settings.eleventySeoDescription ?? ''}
            .editor=${config.getEditor()}
          >
            <label slot="label">Description</label>
          </state-editor>
          <state-editor
            id="eleventyFavicon"
            name="eleventyFavicon"
            value=${settings.eleventyFavicon ?? ''}
            .editor=${config.getEditor()}
          >
            <label slot="label">Favicon</label>
          </state-editor>
        </label>
        <label class="silex-form__element">
          <h3>Social</h3>
          <state-editor
            id="eleventyOGImage"
            name="eleventyOGImage"
            value=${settings.eleventyOGImage ?? ''}
            .editor=${config.getEditor()}
          >
            <label slot="label">OG Image</label>
          </state-editor>
          <state-editor
            id="eleventyOGTitle"
            name="eleventyOGTitle"
            value=${settings.eleventyOGTitle ?? ''}
            .editor=${config.getEditor()}
          >
            <label slot="label">OG Title</label>
          </state-editor>
          <state-editor
            id="eleventyOGDescription"
            name="eleventyOGDescription"
            value=${settings.eleventyOGDescription ?? ''}
            .editor=${config.getEditor()}
          >
            <label slot="label">OG Description</label>
          </state-editor>
      </div>
    </div>
    `
}
