import { ClientConfig } from '@silexlabs/silex'

export default function(config: ClientConfig/*, opts: EleventyPluginOptions */): void {
  config.on('silex:grapesjs:end', () => {
    const editor = config.getEditor()
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
          // Prevent the drop down from opening on click
          script: function() {
            console.log('script', this)
            this.addEventListener('mousedown', event => {
              event.preventDefault()
            })
          },
        },
      },
    })
    editor.BlockManager.add('eleventy-option', {
      label: 'option',
      category: 'Eleventy',
      media: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
      content: { type: 'eleventy-option' },
    })
    editor.DomComponents.addType('eleventy-select', {
      model: {
        defaults: {
          tagName: 'select',
          droppable: true,
          // Prevent the drop down from opening on click
          script: function() {
            console.log('script', this)
            this.addEventListener('mousedown', event => {
              event.preventDefault()
            })
          },
        },
      },
    })
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
            ...editor.DomComponents.getType('image').model.prototype.defaults.traits,
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