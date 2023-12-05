const StaticPlugin = require('@silexlabs/silex/dist/plugins/server/plugins/server/StaticPlugin').default

module.exports = (config) => {
  // For source map
  config.addPlugin(StaticPlugin, {
    routes: [
      {
        route: '/client.js.map',
        path: __dirname + '/../dist/client.js.map',
      }, {
        route: '/client.js',
        path: __dirname + '/../dist/client.js',
      },
    ],
  })
}
