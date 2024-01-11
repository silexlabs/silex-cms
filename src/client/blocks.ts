import { ClientConfig } from '@silexlabs/silex'

export default function(config: ClientConfig/*, opts: EleventyPluginOptions */): void {
  config.on('silex:grapesjs:end', () => {
    const editor = config.getEditor()
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