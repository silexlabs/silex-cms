import { DataSourceEditor, Field, IDataSource, Type } from '@silexlabs/grapesjs-data-source'
import { EleventyPluginOptions } from '../client'
import Backbone from 'backbone'
import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'

export default function(config: ClientConfig, opts: EleventyPluginOptions): void {
  config.on('silex:startup:end', () => {
    const dm = (config.getEditor() as DataSourceEditor).DataSourceManager
    if(!dm) {
      throw new Error('No DataSourceManager found, did you forget to add the DataSource plugin?')
    }
    if(opts.enable11ty) {
      // Add the 11ty data source
      // Use silent: true to avoid triggering a save
      const eleventyDs = dm.add(new EleventyDataSource(), {merge: false, silent: true})
      // FIXME: Workaround: the added instance is not a Backbone model
      eleventyDs.isConnected = eleventyDs.get('isConnected')
      eleventyDs.getQuery = eleventyDs.get('getQuery')
      eleventyDs.getTypes = eleventyDs.get('getTypes')
      eleventyDs.getQueryables = eleventyDs.get('getQueryables')
      eleventyDs.connect = eleventyDs.get('connect')
      eleventyDs.id = eleventyDs.get('id')
      eleventyDs.cid = eleventyDs.get('cid')
      eleventyDs.hidden = eleventyDs.get('hidden')
      eleventyDs.attributes.url = ''
      // No, this triggers a save: eleventyDs.set('url', '')
    }
  })
}

export const EleventyDataSourceId = 'eleventy'

class EleventyDataSource extends Backbone.Model<EleventyPluginOptions> implements IDataSource {
  /**
   * FIXME: this is required because _.uniqueId in backbone gives the same id as the one in the main app (c1), so we probably use a different underscore instance?
   */
  cid = EleventyDataSourceId

  /**
   * Unique identifier of the data source
   * This is used to retrieve the data source from the editor
   */
  id = EleventyDataSourceId
  label = 'Eleventy'
  hidden = true

  /**
   * Implement IDatasource
   */
  async connect(): Promise<void> {}
  isConnected(): boolean { return true }

  /**
   * Implement IDatasource
   */
  getQuery(/*expressions: Expression[]*/): string { return '' }

  /**
   * Implement IDatasource
   */
  getTypes(): Type[] {
    return [{
      id: 'string',
      label: 'String',
      dataSourceId: 'eleventy',
      fields: [],
    }, {
      id: 'number',
      label: 'Number',
      dataSourceId: 'eleventy',
      fields: [],
    }, {
      id: 'date',
      label: 'Date',
      dataSourceId: 'eleventy',
      fields: [],
    }, {
      id: 'page',
      label: 'page',
      dataSourceId: 'eleventy',
      fields: [{
        id: 'url',
        label: 'url',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'fileSlug',
        label: 'fileSlug',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'filePathStem',
        label: 'filePathStem',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'date',
        label: 'date',
        typeIds: ['date'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'inputPath',
        label: 'inputPath',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'outputPath',
        label: 'outputPath',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'outputFileExtension',
        label: 'outputFileExtension',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'lang',
        label: 'lang',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }],
    }, {
      id: 'pagination',
      label: 'pagination',
      dataSourceId: 'eleventy',
      fields: [{
        id: 'hrefs',
        label: 'hrefs',
        typeIds: ['string'],
        kind: 'list',
        dataSourceId: 'eleventy',
      }, {
        id: 'href',
        label: 'href',
        typeIds: ['paginationHref'],
        kind: 'object',
        dataSourceId: 'eleventy',
      }, {
        id: 'pageNumber',
        label: 'pageNumber',
        typeIds: ['number'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'pages',
        label: 'pages',
        typeIds: ['page'],
        kind: 'list',
        dataSourceId: 'eleventy',
      }],
    }, {
      id: 'paginationHref',
      label: 'paginationHref',
      dataSourceId: 'eleventy',
      fields: [{
        id: 'next',
        label: 'next',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'previous',
        label: 'previous',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'first',
        label: 'first',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'last',
        label: 'last',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }],
    }, {
      id: 'eleventy',
      label: 'eleventy',
      dataSourceId: 'eleventy',
      fields: [{
        id: 'version',
        label: 'version',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'generator',
        label: 'generator',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'env',
        label: 'env',
        typeIds: ['env'],
        kind: 'object',
        dataSourceId: 'eleventy',
      }]
    }, {
      id: 'env',
      label: 'env',
      dataSourceId: 'eleventy',
      fields: [{
        id: 'root',
        label: 'root',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'config',
        label: 'config',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'source',
        label: 'source',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'runMode',
        label: 'runMode',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }],
    }, {
      id: 'locale_link',
      label: 'locale_link',
      dataSourceId: 'eleventy',
      fields: [{
        id: 'url',
        label: 'url',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'lang',
        label: 'lang',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'label',
        label: 'label',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }],
    }]
  }

  /**
   * Implement IDatasource
   */
  getQueryables(): Field[] {
    return [{
      id: 'page',
      label: 'page',
      typeIds: ['page'],
      kind: 'object',
      dataSourceId: 'eleventy',
    //}, {
    //  id: 'eleventy',
    //  label: 'eleventy',
    //  typeIds: ['eleventy'],
    //  kind: 'object',
    //  dataSourceId: 'eleventy',
    //}, {
    //  id: 'env',
    //  label: 'env',
    //  typeIds: ['env'],
    //  kind: 'object',
    //  dataSourceId: 'eleventy',
    }]
  }
}

export class EleventyDataSourceTest extends EleventyDataSource {
}
