# Silex CMS

⚠️ DEPRECATED**: This plugin has been integrated into the main [silex-lib](https://github.com/silexlabs/silex-lib/) package

This is a Silex plugin to make Eleventy layouts visually with integration of any GraphQL API, allowing for a streamlined, code-free development process

> This plugin requires you to use 11ty v3.0.0 or higher in your project

Links

* [User docs](https://docs.silex.me/en/user/cms)
* [Developer docs](https://docs.silex.me/en/dev/cms)
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
$ npm i --save @silexlabs/silex-cms
```

Add to Silex client config:

```js
// silex-client.js
import Eleventy from './js/silex-cms/client.js'

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
    // ... Other options for @silexlabs/silex-cms plugin - see below
  })
}
```
And expose the plugin to the front end:

```js
// silex-server.js
const StaticPlugin = require('@silexlabs/silex/dist/plugins/server/plugins/server/StaticPlugin').default
const node_modules = require('node_modules-path')
module.exports = function(config, options) {
  config.addPlugin(StaticPlugin, {
    routes: [
      {
        route: '/js/silex-cms/',
        path: node_modules('@silexlabs/silex-cms') + '/@silexlabs/silex-cms/dist/',
      },
    ],
  })
}
```

Then start Silex with

```sh
npx @silexlabs/silex --client-config=silex-client.js --server-config=`pwd`/silex-server.js
```

### 11ty configuration

By default you don't need to configure 11ty, but you can customize the 11ty configuration by creating a `.eleventy.js` file where the silex website is being published.

For example to enable the 11ty fetch plugin:

```js
module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(require('@11ty/eleventy-plugin-fetch'), {
    duration: '1d',
  })
}
```

Then in the website settings, you can enable the fetch plugin from the settings > CMS screen.


## Options

You can pass an object containing all options of [the GrapesJs DataSource plugin](https://github.com/silexlabs/grapesjs-data-source#options)

Here are additional options specific to this plugin:

|Option|Description|Default|
|-|-|-|
| `dataSources` and other data source options | An array of data sources to use in the CMS. Check [Data Source plugin optsion](https://github.com/silexlabs/grapesjs-data-source?tab=readme-ov-file#options) | `[]` |
| `enable11ty` | Enable the 11ty integration. If false, the publication will not publish to 11ty and do not display 11ty data. | `true` |
| `cacheBuster` | Add cache buster to graphql queries | `false` |
|`fetchPlugin`|Options to pass to [11ty fetch plugin](https://www.11ty.dev/docs/plugins/fetch/)|`false` and can be activated by the website config|
|`i18nPlugin`|Enable filters which assume that your eleventy site has the [11ty i18n plugin installed](https://www.11ty.dev/docs/plugins/i18n/)|`false` and can be activated by the website config|
|`dir`|An object with options to define 11ty directory structure|`{}`|
|`dir.input`|Directory for 11ty input files, Silex will publish your site in this folder|`` (empty string)|
|`dir.silex`|Directory for Silex files, Silex will publish your site in this folder. This is relative to the `input` directory|`silex`|
|`dir.html`|Directory for HTML files, Silex will generate HTML files (your site pages) in this folder. This is relative to the `silex` directory|`` (empty string)|
|`dir.assets`|Directory for assets files, Silex will copy your assets (images, css, js, ...) to this folder when you publish your site. This is relative to the `silex` directory|`assets`|
|`dir.css`|Directory for CSS files, Silex will generate CSS files to this folder when you publish your site. This is relative to the `assets` directory|`css`|
|`urls`|An object with options to define your site urls|`{}`|
|`urls.css`|Url of the folder containing the CSS files, Silex will use this to generate links to the CSS files.|`css`|
|`urls.assets`|Url of the folder containing the assets files, Silex will use this to generate links to the assets files.|`assets`|

> Note that `fetchPlugin` and `i18nPlugin` can be activated on a per-site basis in the website settings.

## Dev notes

Hidden states

* States with hidden property set to true
* Not rendered in the HTML page as liquid
* Not visible in the properties panel
* Visible in completion of expressions

Public states

* In the UI they are represented by a list in the properties panel "states" section
* In the HTML page they are rendered as "assign" liquid blocks before the element
* You get these states with getState(id, true)
* They are typically properties custom states the user need to create expressions, e.g. to use in the append filter

Private states

* In the UI they are represented in the properties panel as element's properties
* In the HTML page they are rendered as liquid blocks in place of the element, for loops, echo, if, etc.
* You get these states with getState(id, false)
* They are typically properties of the element, like "innerHTML", "src", "href", etc.

Attributes vs Properties vs States

* Attributes are the HTML attributes, e.g. "src", "href", "class", etc.
* Properties are the properties of the element, e.g. "innerHTML", repeat/loop data, visibility conditions, etc.
* States are reusable expressions which are not visible in the HTML page, e.g. "myVar", "myVar2", etc.

Attributes with multiple values

* If you define an attribute multiple times, the last value will replace the previous ones
* Exception: "class" or "style", the values are merged, including the initial values defined elsewhere in Silex


## Development

Clone the repository

```sh
$ git clone https://github.com/silexlabs/silex-cms.git
$ cd silex-cms
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
