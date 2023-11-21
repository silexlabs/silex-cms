import { Field, IDataSource, Type } from '@silexlabs/grapesjs-data-source'
import { EleventyPluginOptions } from '../client'
import Backbone from 'backbone'

export default function(config/*, opts: EleventyPluginOptions */): void {
  const dm = config.getEditor().DataSourceManager
  dm.add(new EleventyDataSource())
  // FIXME: why do we have to call it twice?
  dm.add(new EleventyDataSource())
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
    }]
  }
  getQueryables(): Field[] {
    return [{
      id: 'page',
      label: 'Page',
      typeIds: ['page'],
      kind: 'object',
      dataSourceId: 'eleventy',
    }, {
      id: 'eleventy',
      label: 'Eleventy',
      typeIds: ['eleventy'],
      kind: 'object',
      dataSourceId: 'eleventy',
    }, {
      id: 'env',
      label: 'Env',
      typeIds: ['env'],
      kind: 'object',
      dataSourceId: 'eleventy',
    }]
  }
}