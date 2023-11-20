import { html } from 'lit-html'

export default function(config/*, opts: EleventyPluginOptions */): void {
  config.addSettings({
    id: 'eleventy',
    label: 'Eleventy',
    render: (settings) => {
      const queryables = config.getEditor().DataSourceManager.getDataTree().getAllQueryables()
      const collectionPageData = queryables.find(field => field.id === settings.eleventyPageData) ?? null
      setTimeout(() => {
        // Update the settings form when the selection changed without recreating the form
        Array.from(document.querySelectorAll('#settings-eleventy input'))
          .forEach((input: HTMLInputElement) => {
            switch(input.type) {
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
    </style>
    <div id="settings-eleventy" class="silex-hideable silex-hidden">
      <div class="gjs-sm-sector-title">11ty Plugin</div>
      <div class="silex-help">The 11ty plugin enables you to integrate <a href="https://www.11ty.dev/docs/">11ty</a> static site generator with Silex.</div>
      <div class="silex-form__group col2">
        <label class="silex-form__element">
          <h3>Create pages from data</h3>
          <p class="silex-help">The <a href="https://www.11ty.dev/docs/pagination/">Pagination feature</a> is used for iterating over any data to create multiple output files.</p>
          <label class="silex-form__element">Page data
            <p class="">Select the data source to use for creating pages. <a href="https://www.11ty.dev/docs/pagination/">Read more about Pagination</a>.</p>
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
                      <option .value=${field.id} .data-field=${JSON.stringify(field)} ?selected=${collectionPageData?.id === field.id}>${field.id}</option>
                    `)}
                  </optgroup>
                `)}
            </select>
          </label>
          <label class="silex-form__element">Size
            <p class="">Set the number of items per page. To get </p>
            <input type="number" name="eleventyPageSize" .value=${settings.eleventyPageSize ?? 1}/>
          </label>
          <label class="silex-form__element">Reverse
            <p class="">Reverse the order of the items in the collection.</p>
            <input type="checkbox" name="eleventyPageReverse" ?checked=${!!settings.eleventyPageReverse ?? false}/>
          </label>
          <label class="silex-form__element">Permalink
            <p class="">Change the output target of the current template. Normally, you cannot use template syntax to reference other variables in your data, but <code>permalink</code> is an exception. <a href="https://www.11ty.dev/docs/permalinks/">Read more about Permalinks</a>.</p>
            <input type="text" name="eleventyPermalink" .value=${settings.eleventyPermalink ?? ''}/>
          </label>
        </label>
        <label class="silex-form__element">
          <h3>Internationalization (I18n)</h3>
          <p class="silex-help">This 11ty plugin enables you to use multiple languages in your 11ty site. <a href="https://www.11ty.dev/docs/languages/">Read more about the I18n plugin</a>.</p>
          Enable
          <input type="checkbox" name="eleventyI18n" ?checked=${!!settings.eleventyI18n ?? false}/>
          <label class="silex-form__element">Default language
            <input type="text" name="eleventyI18nDefaultLanguage" .value=${settings.eleventyI18nDefaultLanguage ?? ''}/>
          </label>
        </label>
        <label class="silex-form__element">
          <h3>Image</h3>
          <p class="silex-help">This 11ty plugin enables you to use responsive images in your 11ty site. <a href="https://www.11ty.dev/docs/plugins/image/">Read more about the Image plugin</a>. Enable this option will only make an image filter available in Silex, it will not configure the 11ty plugin - this you need to do in the 11ty config file.</p>
          Enable
          <input type="checkbox" name="eleventyImage" ?checked=${!!settings.eleventyImage ?? false}/>
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
}