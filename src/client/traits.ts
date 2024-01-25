import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { html, render } from 'lit-html'

/**
 * @fileoverview
 * This adds these traits to all components:
 *   - unwrap the component
 */

export const UNWRAP_ID = 'plugin-unwrap'
const LABEL = 'Unwrap content'
const LABEL_DETAILS = 'Remove the component and keep its content'

export default function(config: ClientConfig/*, opts: EleventyPluginOptions */): void {
  config.on('silex:grapesjs:end', () => {
    const editor = config.getEditor()

    // Add the new trait to all component types
    editor.DomComponents.getTypes().map(type => {
      editor.DomComponents.addType(type.id, {
        model: {
          defaults: {
            traits: [
              // Keep the type original traits
              ...editor.DomComponents.getType(type.id)?.model.prototype.defaults.traits,
              // Add the new trait
              {
                label: LABEL,
                type: UNWRAP_ID,
                name: UNWRAP_ID,
              },
            ]
          }
        }
      })
    })

    function doRender(el: HTMLElement, remove: boolean) {
      render(html`
      <label for=${UNWRAP_ID} class="gjs-one-bg silex-label">${LABEL_DETAILS}</label>
      <input
        type="checkbox"
        id=${UNWRAP_ID}
        @change=${event => doRender(el, event.target.checked)}
        ?checked=${remove}
        style="appearance: auto; width: 20px; height: 20px;"
      >
    `, el)
    }
    function doRenderCurrent(el: HTMLElement) {
      doRender(el, editor.getSelected()?.get(UNWRAP_ID))
    }

    // inspired by https://github.com/olivmonnier/grapesjs-plugin-header/blob/master/src/components.js
    editor.TraitManager.addType(UNWRAP_ID, {
      createInput({ trait }) {
        // Create a new element container and add some content
        const el = document.createElement('div')
        // update the UI when a page is added/renamed/removed
        editor.on('page', () => doRenderCurrent(el))
        doRenderCurrent(el)
        // this will be the element passed to onEvent and onUpdate
        return el
      },
      // Update the component based on UI changes
      // `elInput` is the result HTMLElement you get from `createInput`
      onEvent({ elInput, component, event }) {
        const value = (elInput.querySelector(`#${UNWRAP_ID}`) as HTMLInputElement)?.checked
        component.set(UNWRAP_ID, value)
      },
      // Update UI on the component change
      onUpdate({ elInput, component }) {
        const value = component.get(UNWRAP_ID)
        doRender(elInput, value)
      },
    })
  })
}