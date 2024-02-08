import CmsPlugin from '../client.js'

// A test client config
export default function (config, options = {}) {
  const opts = {
    dataSources: [],
    enable11ty: false, // For now don't publish for 11ty
    image: true,
    i18n: true,
    filters: [
      'generic',
      'liquid',
      {
        type: 'filter',
        id: 'Test custom filter',
        label: 'Test custom filter',
        validate: (field) => !!field,
        output: type => type,
        apply: (str) => {
          console.info(str)
          return str
        },
        options: {},
        quotedOptions: [],
      },
    ],
    ...options,
  }
  config.addPlugin(CmsPlugin, opts)
  return opts
}
