import { Field, IDataSource, Type } from '@silexlabs/grapesjs-data-source'
import { EleventyPluginOptions } from '../client'
import Backbone from 'backbone'

export default function(config/*, opts: EleventyPluginOptions */): void {
  config.on('silex:startup:end', () => {
    const dm = config.getEditor().DataSourceManager
    if(!dm) {
      throw new Error('No DataSourceManager found, did you forget to add the DataSource plugin?')
    }
    // FIXME: why do we have to call it twice before the setTimeout?
    dm.add(new EleventyDataSource())
    dm.add(new EleventyDataSource())
    dm.add(new EleventyDataSource())
  })
}

class EleventyDataSource extends Backbone.Model<EleventyPluginOptions> implements IDataSource {
  id = 'eleventy'
  async connect(): Promise<void> {}
  getQuery(/*expressions: Expression[]*/): string { return '' }
  getTypes(): Type[] {
    return [{
      id: 'page',
      label: 'Page',
      dataSourceId: 'eleventy',
      fields: [{
        id: 'url',
        label: 'Url',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'fileSlug',
        label: 'File slug',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'filePathStem',
        label: 'File path stem',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'date',
        label: 'Date',
        typeIds: ['date'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'inputPath',
        label: 'Input path',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'outputPath',
        label: 'Output path',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'outputFileExtension',
        label: 'Output file extension',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'lang',
        label: 'Lang',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }],
    }, {
      id: 'pagination',
      label: 'Pagination',
      dataSourceId: 'eleventy',
      fields: [{
        id: 'hrefs',
        label: 'Hrefs',
        typeIds: ['string'],
        kind: 'list',
        dataSourceId: 'eleventy',
      }, {
        id: 'href',
        label: 'Href',
        typeIds: ['paginationHref'],
        kind: 'object',
        dataSourceId: 'eleventy',
      }, {
        id: 'pageNumber',
        label: 'Page number',
        typeIds: ['number'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'pages',
        label: 'Pages',
        typeIds: ['page'],
        kind: 'list',
        dataSourceId: 'eleventy',
      }],
    }, {
      id: 'paginationHref',
      label: 'Pagination href',
      dataSourceId: 'eleventy',
      fields: [{
        id: 'next',
        label: 'Next',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'previous',
        label: 'Previous',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'first',
        label: 'First',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'last',
        label: 'Last',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }],
    }, {
      id: 'eleventy',
      label: 'Eleventy',
      dataSourceId: 'eleventy',
      fields: [{
        id: 'version',
        label: 'Version',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'generator',
        label: 'Generator',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'env',
        label: 'Env',
        typeIds: ['env'],
        kind: 'object',
        dataSourceId: 'eleventy',
      }]
    }, {
      id: 'env',
      label: 'Env',
      dataSourceId: 'eleventy',
      fields: [{
        id: 'root',
        label: 'Root',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'config',
        label: 'Config',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'source',
        label: 'Source',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'runMode',
        label: 'Run mode',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }],
    }, {
      id: 'locale_link',
      label: 'Link',
      dataSourceId: 'eleventy',
      fields: [{
        id: 'url',
        label: 'Url',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'lang',
        label: 'Lang',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }, {
        id: 'label',
        label: 'Label',
        typeIds: ['string'],
        kind: 'scalar',
        dataSourceId: 'eleventy',
      }],
    }]
  }
  getQueryables(): Field[] {
    return [{
      id: 'page',
      label: 'Page',
      typeIds: ['page'],
      kind: 'object',
      dataSourceId: 'eleventy',
    //}, {
    //  id: 'eleventy',
    //  label: 'Eleventy',
    //  typeIds: ['eleventy'],
    //  kind: 'object',
    //  dataSourceId: 'eleventy',
    //}, {
    //  id: 'env',
    //  label: 'Env',
    //  typeIds: ['env'],
    //  kind: 'object',
    //  dataSourceId: 'eleventy',
    }]
  }
}