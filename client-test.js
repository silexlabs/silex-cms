import EleventyPlugin from '../client.js'

// A test client
export default function (config, options = {}) {
  const opts = {
    dataSources: [
      {
        id: 'countries_api',
        type: 'graphql',
        label: 'Countries API',
        url: 'https://countries.trevorblades.com/graphql',
        method: 'POST',
        headers: {},

      }, {
        id: 'directus',
        type: 'graphql',
        label: 'Directus API',
        url: 'https://eco-starter.2.internet2000.net/cms/graphql',
        method: 'POST',
        headers: {},
      }, {
        id: 'sanity',
        type: 'graphql',
        label: 'Sanity API',
        url: 'https://gl93e3h9.api.sanity.io/v2023-08-01/graphql/production/default',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer skGP3qsWCXgPPTqmvIyAdeFhACwWKt94Eq3oCexQNvalA291L03mfLLq0DFHN9pVxhPuTVSs5vfDucKpWZHKRGGKwBdou4QYW32yNBBkHJjl2QGnn67KtdaqRCo7vhxlBObbZdFVylCgtO2M6c4lvkal0owBpVO4PCcMxeUC38z1r8pjvTXJ',
        },
      }
    ],
    image: true,
    i18n: true,
    ...options,
  }
  //config.addPlugin('../client.js', opts)
  config.addPlugin(EleventyPlugin, opts)
  return opts
}
