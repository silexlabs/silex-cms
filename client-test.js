import EleventyPlugin from '../client.js'

// A test client
export default function (config, options = {}) {
  const opts = {
    ...options,
    dataSources: [
      {
        id: 'countries_api',
        type: 'graphql',
        label: 'Countries API',
        url: 'https://countries.trevorblades.com/graphql',
        method: 'POST',
        headers: {},

      }
    ]
  }
  //config.addPlugin('../client.js', opts)
  config.addPlugin(EleventyPlugin, opts)
  return opts
}
