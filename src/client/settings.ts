import { DataSourceEditor } from '@silexlabs/grapesjs-data-source'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { html } from 'lit-html'
import { Silex11tyPluginWebsiteSettings } from '../client'
//import { createRef } from 'lit/directives/ref.js'
//import { StepsSelector } from '@silexlabs/steps-selector'
//import { renderExpression } from '@silexlabs/grapesjs-data-source'

//const pageDataInputRef = createRef<StepsSelector>()
export default function(config: ClientConfig/*, opts: EleventyPluginOptions */): void {
  config.on('silex:startup:end', () => {
    config.addSettings({
      id: 'eleventy',
      label: 'Eleventy',
      render: (settings: Silex11tyPluginWebsiteSettings) => {
        const queryables = (config.getEditor() as DataSourceEditor).DataSourceManager.getDataTree().getAllQueryables()
        const collectionPageData = queryables.find(field => `${field.dataSourceId}.${field.id}` === settings.eleventyPageData) ?? null
        setTimeout(() => {
          // Update the settings form when the selection changed without recreating the form
          (document.querySelectorAll('#settings-eleventy input') as NodeListOf<HTMLInputElement>)
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
        // Create the selector for the page data
        // const page = config.getEditor().Pages.getSelected()
        // const body = page.getMainComponent()
        // const pageDataInput = renderExpression(body, config.getEditor().DataSourceManager.dataTree, 'xxxx', 'Page data', true, pageDataInputRef)
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
    <div id="settings-eleventy" class="silex-hideable silex-hidden">
      <div class="gjs-sm-sector-title">11ty Plugin</div>
      <div class="silex-help">The <a href="https://github.com/silexlabs/silex-cms">11ty plugin for Silex</a> <strong>is installed</strong>. It integrates <a href="https://www.11ty.dev/docs/">11ty</a> static site generator with Silex.</div>
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
        groups.push({ dataSourceId: field.dataSourceId, fields: [field] })
      }
      return groups
    }, [])
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
            <input type="checkbox" name="eleventyPageReverse" ?checked=${!!settings.eleventyPageReverse ?? false}/>
          </label>
          <label class="silex-form__element">Permalink
            <input type="text" name="eleventyPermalink" .value=${settings.eleventyPermalink ?? ''}/>
          </label>
          <label class="silex-form__element">Available languages
            <p class="silex-help">Silex can duplicate this page for each language and generate a different URL for each language.</p>
            <p class="silex-help">Provide a comma separated list of languages. For example: <code>en,fr</code>. An empty value will deactivate this feature.</p>
            <input type="text" name="silexLanguagesList" .value=${settings.silexLanguagesList ?? ''}/>
          </label>
          <label class="silex-form__element">Default language
            <p class="silex-help">If set, this language will be omitted from the URL. For example: <code>en</code> means that the english version of the page will be available at <code>/page.html</code> and the french version at <code>/fr/page.html</code></p>
            <input type="text" name="silexLanguagesDefault" .value=${settings.silexLanguagesDefault ?? ''}/>
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
      </div>
    </div>
    `
      }
    }, 'page')
  })
}