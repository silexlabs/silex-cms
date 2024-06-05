import { DataSourceEditor, DataSourceId, Field, removeState, setState } from '@silexlabs/grapesjs-data-source'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
//import { ClientEvent } from '@silexlabs/silex/src/ts/client/events'
import { EleventyPluginOptions, Silex11tyPluginWebsiteSettings } from '../client'
import { html } from 'lit'
import { Page } from 'grapesjs'

interface FieldsByDataSource {
  dataSourceId: DataSourceId
  fields: Field[]
}

/**
 * Set the state on the body component
 * This is only useful to build the GraphQL query
 */
function stateOnBody(editor, value, name, body) {
  if (value) {
    let expression
    try {
      expression = JSON.parse(value)
    } catch (e) {
      console.error(`Invalid JSON for ${name}`, e)
      removeState(body, name)
      editor.runCommand('notifications:add', {
        type: 'error',
        message: `Invalid JSON for ${name}`,
        group: 'Errors in your settings',
      })
    }
    setState(body, name, {
      label: name,
      hidden: true,
      expression,
    })
  } else {
    removeState(body, name)
  }
}

export default function(config: ClientConfig, opts: EleventyPluginOptions): void {
  if(!opts.enable11ty) return // Do not add the settings if 11ty is disabled
  config.on('silex:startup:end', () => {
    const editor = config.getEditor()
    editor.on('silex:settings:save:start' /*ClientEvent.SETTINGS_SAVE_START*/, (page: Page) => {
      const settings = page?.get('settings') as Silex11tyPluginWebsiteSettings
      if (settings) {
        // Set the state on the body component
        // This is only useful to build the GraphQL query
        const body = page.getMainComponent()
        stateOnBody(editor, settings.eleventySeoTitle, 'eleventySeoTitle', body)
        stateOnBody(editor, settings.eleventySeoDescription, 'eleventySeoDescription', body)
        stateOnBody(editor, settings.eleventyFavicon, 'eleventyFavicon', body)
        stateOnBody(editor, settings.eleventyOGImage, 'eleventyOGImage', body)
        stateOnBody(editor, settings.eleventyOGTitle, 'eleventyOGTitle', body)
        stateOnBody(editor, settings.eleventyOGDescription, 'eleventyOGDescription', body)
      }
    })
    config.addSettings({
      id: 'cms',
      label: 'CMS',
      render: (settings: Silex11tyPluginWebsiteSettings) => {
        const queryables = (config.getEditor() as DataSourceEditor).DataSourceManager.getDataTree().getAllQueryables()
        const collectionPageData = queryables.find(field => `${field.dataSourceId}.${field.id}` === settings.eleventyPageData) ?? null
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
      <div class="silex-help">The <a href="https://github.com/silexlabs/silex-cms">Silex CMS</a> integrates <a href="https://www.11ty.dev/docs/">11ty</a> static site generator and your favorite headless CMS with Silex.</div>
      <div class="silex-form__group col2">
        <label class="silex-form__element">
          <h3>Create pages from data</h3>
          <p class="silex-help">The <a href="https://www.11ty.dev/docs/pagination/">Pagination feature</a> is used for iterating over any data to create multiple output files.</p>
          <label class="silex-form__element">Page data
            <select name="eleventyPageData" id="pageDataSelect">
              <option value="" ?selected=${!collectionPageData?.id}>None</option>
              ${queryables
    .filter(field => field.kind === 'list')
    .reduce((groups, field) => {
      const group = groups.find(g => g.dataSourceId === field.dataSourceId)
      if (group) {
        group.fields.push(field)
      } else {
        groups.push({ dataSourceId: field.dataSourceId || 'Unknown', fields: [field] })
      }
      return groups
    }, [] as FieldsByDataSource[])
    .map(group => html`
                  <optgroup label=${group.dataSourceId}>
                    ${group.fields.map(field => html`
                      <option .value=${`${field.dataSourceId}.${field.id}`} .data-field=${JSON.stringify(field)} ?selected=${collectionPageData?.id === field.id}>${field.id}</option>
                    `)}
                  </optgroup>
                `)}
            </select>
          </label>
          <label class="silex-form__element">Size
            <input type="number" name="eleventyPageSize" .value=${settings.eleventyPageSize ?? 1}/>
          </label>
          <label class="silex-form__element">Reverse
            <input type="checkbox" name="eleventyPageReverse" ?checked=${!!settings.eleventyPageReverse}/>
          </label>
          <label class="silex-form__element">Permalink
            <input type="text" name="eleventyPermalink" .value=${settings.eleventyPermalink ?? ''}/>
          </label>
          <label class="silex-form__element">Available languages
            <p class="silex-help">Silex can duplicate this page for each language and generate a different URL for each language.</p>
            <p class="silex-help">Provide a comma separated list of languages. For example: <code>en,fr</code>. An empty value will deactivate this feature.</p>
            <input type="text" name="silexLanguagesList" .value=${settings.silexLanguagesList ?? ''}/>
          </label>
        </label>
        <label class="silex-form__element">
          <h3>Navigation Plugin</h3>
          <p class="silex-help">This 11ty plugin enables infinite-depth hierarchical navigation in Eleventy projects. Supports breadcrumbs too! <a href="https://www.11ty.dev/docs/plugins/navigation/">Read more about the Navigation Plugin</a>.</p>
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
    }, 'page')
  })
}