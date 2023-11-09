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

Add to Silex config (client or server)

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
    // ... Other options from @silexlabs/grapesjs-data-source plugin
  })
}
```

## Options

|Option|Description|Default|
|-|-|-
|`dataSources`|List of GraphQL APIs|`[]`|

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