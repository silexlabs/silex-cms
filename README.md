# Eleventy Visual Designer

Eleventy Visual Designer is a Silex plugin that simplifies the creation of Eleventy layouts. It provides a visual interface to design pages while seamlessly integrating GraphQL data, allowing for a streamlined, code-free development process

Links

* [Eleventy / 11ty](https://11ty.dev)
* [Silex free/libre website builder](https://www.silex.me)

Features

1. Visual design interface for Eleventy layouts
1. Integration with GraphQL APIs for visula design on real data
1. Expression builders for content, visibility conditions and loops
1. Live preview of data-driven designs
1. Automatic generation of Eleventy-specific data files and front matter
1. Support for localization and internationalization
1. Customizable SEO settings for collection pages
1. Mock data capabilities for offline design testing

> **Add a gif or a live demo of your plugin here**

## Installation

This is how to use the plugin in your Silex instance or JS project

Add as a dependency

```bash
$ npm i --save @silexlabs/silex-plugin-11ty
```

Add to Silex client config:

```js
import plugin from '@silexlabs/silex-plugin-11ty'
// Or import YourPlugin from '../path/to/silex-plugin-11ty'
// Or import YourPlugin from 'http://unpkg.com/silex-plugin-11ty'
export default function(config, options) {
  config.addPlugin(plugin, {
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
    dir {
      input: 'pages/',
      css: 'css',
    },
    // ... Other options for @silexlabs/silex-plugin-11ty plugin - see below
  })
}
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