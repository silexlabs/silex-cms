//import env from './env.js'
import CmsPlugin from '../client.js'

// A test client config
export default function (config, options = {}) {
  const opts = {
    dataSources: [
      //{
      //  id: 'countries_api',
      //  type: 'graphql',
      //  label: 'Countries API',
      //  url: 'https://countries.trevorblades.com/graphql',
      //  method: 'POST',
      //  headers: {},
      //}, {
      //  id: 'sanity',
      //  type: 'graphql',
      //  label: 'Sanity API',
      //  url: 'https://gl93e3h9.api.sanity.io/v2023-08-01/graphql/production/default',
      //  method: 'POST',
      //  headers: {
      //    'Authorization': 'Bearer skGP3qsWCXgPPTqmvIyAdeFhACwWKt94Eq3oCexQNvalA291L03mfLLq0DFHN9pVxhPuTVSs5vfDucKpWZHKRGGKwBdou4QYW32yNBBkHJjl2QGnn67KtdaqRCo7vhxlBObbZdFVylCgtO2M6c4lvkal0owBpVO4PCcMxeUC38z1r8pjvTXJ',
      //  },
      //},
      //{
      //  id: 'directus',
      //  type: 'graphql',
      //  name: 'Directus API',
      //  url: `https://${env.APP_NAME}.${env.CAPROVER_DOMAIN}/cms/graphql`,
      //  method: 'POST',
      //  headers: {
      //    'Content-Type': 'application/json',
      //    'Authorization': 'Bearer HLjFzkT6u3S8mkJyk4EmFEcpUAgKmybV',
      //  },
      //},
    ],
    enable11ty: true,
    // i18nPlugin: false,
    // fetchPlugin: false,
    filters: [
      // 'generic',
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
