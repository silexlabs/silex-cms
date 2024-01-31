import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'

export default function(config: ClientConfig/*, opts: EleventyPluginOptions */): void {
  config.on('silex:grapesjs:end', () => {
    const editor = config.getEditor()
    // **
    // Shortcode
    editor.BlockManager.add('eleventy-shortcode', {
      label: 'Shortcode',
      category: 'Eleventy',
      content: { type: 'eleventy-shortcode' },
      media: '<span style="font-size: 50px;">{%</span>',
    })
    editor.DomComponents.addType('eleventy-shortcode', {
      model: {
        defaults: {
          traits: [{
            type: 'shortcode-name',
            label: 'Shortcode name',
            name: 'shortcode_name',
            placeholder: 'shortcode_name',
          }, {
            type: 'shortcode-attributes',
            label: 'Shortcode attributes',
            name: 'shortcode_attributes',
            placeholder: 'param1, "example param 2"',
          }],
        },
        init() {
          let pending = false
          editor.on('component:add component:remove component:mount', model => {
            if (pending) return
            setTimeout(() => {
              // FIXME: why do we need a timeout?
              if (model.parent() === this || model === this) {
                console.log('add or remove', this)
                pending = true
                updateShortcode(this)
                pending = false
              }
            }, 500)
          })
        },
      },
    })
    function updateShortcode(component) {
      console.log('updateShortcode', { component })
      const { shortcode_attributes, shortcode_name } = component.get('attributes')
      const componentsToKeep = component.components()
        .filter(c => c.view?.el?.nodeType === 1)
      if (componentsToKeep.length) {
        // Paired shortcode
        component.components(`
          {% ${shortcode_name} ${shortcode_attributes ?? ''} %}
            <div class="replace_content"></div>
          {% end${shortcode_name} %}
        `)
        const replaceContentDiv = component.components().find(c => c.getClasses().includes('replace_content'))
        if (!replaceContentDiv) {
          console.error('No replace_content found', { component, componentsToKeep })
          return
        }
        replaceContentDiv.replaceWith(componentsToKeep)
      } else {
        component.components(`
          {% ${shortcode_name} ${shortcode_attributes ?? ''} %}
        `)
      }
    }
    editor.TraitManager.addType('shortcode-name', {
      onEvent({ component }) {
        console.log('onEvent', { component })
        updateShortcode(component)
      },
      onUpdate({ component }) {
        console.log('onUpdate', { component })
        updateShortcode(component)
      },
      onRender({ component }) {
        console.log('onRender', { component })
        updateShortcode(component)
      },
    })
    editor.TraitManager.addType('shortcode-attributes', {
      onEvent({ component }) {
        updateShortcode(component)
      },
    })
    // **
    // Select element
    editor.BlockManager.add('eleventy-select', {
      label: 'select',
      category: 'Eleventy',
      media: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 9c0-.6-.5-1-1.3-1H3.4C2.5 8 2 8.4 2 9v6c0 .6.5 1 1.3 1h17.4c.8 0 1.3-.4 1.3-1V9zm-1 6H3V9h18v6z"></path><path d="M18.5 13l1.5-2h-3zM4 11.5h11v1H4z"></path></svg>',
      content: { type: 'eleventy-select' },
    })
    editor.DomComponents.addType('eleventy-select', {
      model: {
        defaults: {
          tagName: 'select',
          droppable: true,
          // // Prevent the drop down from opening on click
          // script: function() {
          //   this.addEventListener('mousedown', event => {
          //     event.preventDefault()
          //   })
          // },
        },
      },
    })
    // **
    // Option element
    editor.BlockManager.add('eleventy-option', {
      label: 'option',
      category: 'Eleventy',
      media: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
      content: { type: 'eleventy-option' },
    })
    editor.DomComponents.addType('eleventy-option', {
      model: {
        defaults: {
          tagName: 'option',
          droppable: false,
          draggable: 'select, optgroup',
          traits: [
            {
              type: 'text',
              label: 'Value',
              name: 'value',
              placeholder: 'Value',
            },
            {
              type: 'text',
              label: 'Label',
              name: 'label',
              placeholder: 'Label',
            },
          ],
        },
      },
    })
    // **
    // Image web component
    editor.BlockManager.add('eleventy-img', {
      label: 'eleventy-img',
      category: 'Eleventy',
      attributes: { class: 'fa fa-image' },
      id: 'eleventy-img',
      content: { type: 'eleventy-img' },
      // The component `image` is activatable (shows the Asset Manager).
      activate: true,
      // select: true, // Default with `activate: true`
    })
    editor.DomComponents.addType('eleventy-img', {
      extend: 'image',
      model: {
        defaults: {
          traits: [
            ...(editor.DomComponents.getType('image')?.model.prototype.defaults.traits || []),
            {
              type: 'text',
              label: 'Width',
              name: 'width',
              placeholder: '100, 200',
            },
          ],
          attributes: { 'webc:is': 'eleventy-image' },
        },
      },
    })
  })
}