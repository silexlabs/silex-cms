# Silex CMS

This is a Silex plugin to make Eleventy layouts visually with integration of any GraphQL API, allowing for a streamlined, code-free development process

Links

* [Eleventy / 11ty](https://11ty.dev)
* [Silex free/libre website builder](https://www.silex.me)
* [Discussion about this plugin](https://community.silex.me/d/26-work-in-progress-dynamic-websites/24)
* [Issue with ideas and links to compatible CMSs](https://github.com/silexlabs/Silex/issues/1478)

Features

* [x] Visual design interface for Eleventy layouts
* [x] Integration with GraphQL APIs for visula design on real data
* [x] Expression builders for content, visibility conditions and loops
* [x] Automatic generation of Eleventy-specific data files and front matter
* [x] Support for localization and internationalization
* [ ] Live preview of data-driven designs
* [ ] Customizable SEO settings for collection pages
* [ ] Mock data capabilities for offline design testing

> **Add a gif or a live demo of your plugin here**

## Installation

This is how to use the plugin in your Silex instance or JS project

Add as a dependency

```bash
$ npm i --save @silexlabs/silex-plugin-11ty
```

Add to Silex client config:

```js
// silex-client.js
import Eleventy from './js/silex-plugin-11ty/client.js'

export default function(config, options) {
  config.addPlugin(Eleventy, {
    dataSources: [{
      id: 'countries',
      type: 'graphql',
      name: 'Countries',
      url: 'https://countries.trevorblades.com/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }],
    // ... Other options for @silexlabs/grapesjs-data-source plugin - see https://github.com/silexlabs/grapesjs-data-source
    dir: {
      input: 'pages/',
      css: 'css',
    },
    // ... Other options for @silexlabs/silex-plugin-11ty plugin - see below
  })
}
```
And expose the plugin to the front end:

```js
// silex-server.js
const StaticPlugin = require('@silexlabs/silex/dist/plugins/server/plugins/server/StaticPlugin').default
const node_modules = require('node_modules-path')
console.log('node_modules', node_modules('@silexlabs/silex-plugin-11ty'))
module.exports = function(config, options) {
  config.addPlugin(StaticPlugin, {
    routes: [
      {
        route: '/js/silex-plugin-11ty/',
        path: node_modules('@silexlabs/silex-plugin-11ty') + '/@silexlabs/silex-plugin-11ty/dist/',
      },
    ],
  })
}
```

Then start Silex with

```sh
npx @silexlabs/silex --client-config=silex-client.js --server-config=`pwd`/silex-server.js
```

## Options

You can pass an object containing all options of [the GrapesJs DataSource plugin](https://github.com/silexlabs/grapesjs-data-source)

Here are additional options specific to this plugin:

|Option|Description|Default|
|-|-|-
|`fetchPlugin`|Options to pass to [11ty fetch plugin](https://www.11ty.dev/docs/plugins/fetch/)|`{ duration: '1d', type: 'json' }`|
|`imagePlugin`|Enable filters which assume that your eleventy site has the [11ty image plugin installed](https://www.11ty.dev/docs/plugins/image/)|`false`|
|`i18nPlugin`|Enable filters which assume that your eleventy site has the [11ty i18n plugin installed](https://www.11ty.dev/docs/plugins/i18n/)|`false`|
|`dir`|An object with options to define 11ty directory structure|`{}`|
|`dir.input`|Directory for 11ty input files, Silex will publish your site in this folder|`` (empty string)|
|`dir.silex`|Directory for Silex files, Silex will publish your site in this folder. This is relative to the `input` directory|`silex`|
|`dir.html`|Directory for HTML files, Silex will generate HTML files (your site pages) in this folder. This is relative to the `silex` directory|`` (empty string)|
|`dir.assets`|Directory for assets files, Silex will copy your assets (images, css, js, ...) to this folder when you publish your site. This is relative to the `silex` directory|`assets`|
|`dir.css`|Directory for CSS files, Silex will generate CSS files to this folder when you publish your site. This is relative to the `assets` directory|`css`|
|`urls`|An object with options to define your site urls|`{}`|
|`urls.css`|Url of the folder containing the CSS files, Silex will use this to generate links to the CSS files.|`css`|
|`urls.assets`|Url of the folder containing the assets files, Silex will use this to generate links to the assets files.|`assets`|

## Development

Clone the repository

```sh
$ git clone https://github.com/silexlabs/silex-plugin-11ty.git
$ cd silex-plugin-11ty
```

Install dependencies

```sh
$ npm i
```

Build and watch for changes

```sh
$ npm run build:watch
```

Start the dev server on port 3000 with watch and debug

```sh
$ npm run dev
```

Publish a new version

```sh
$ npm test
$ npm run lint:fix
$ git commit -am "new feature"
$ npm version patch
$ git push origin main --follow-tags
```

## License

MIT
