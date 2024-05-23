import StaticPlugin from '@silexlabs/silex/dist/plugins/server/plugins/server/StaticPlugin'

export default (config) => {
  config.addPlugin(StaticPlugin, {
    routes: [
      {
        // For source map
        route: '/client.js.map',
        path: __dirname + '/../dist/client.js.map',
      }, {
        route: '/client.js',
        path: __dirname + '/../dist/client.js',
      },
    ],
  })
}
