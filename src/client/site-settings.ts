import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { EleventyPluginOptions } from '../client'
import { html } from 'lit-html'

export default function(config: ClientConfig, opts: EleventyPluginOptions): void {
  config.on('silex:startup:end', () => {
    config.addSettings({
      id: 'cms',
      label: 'CMS',
      render: () => {
        return html`
        <div id="settings-cms" class="silex-hideable silex-hidden">
          <div class="gjs-sm-sector-title">Silex CMS</div>
          <div class="silex-help">
            <p>The <a href="https://github.com/silexlabs/silex-cms">Silex CMS feature</a> integrates with your favorite headless CMS, API or database.</p>
            <p>By adding data sources to your website you activate <a href="https://www.11ty.dev/docs/">11ty static site generator</a> integration. When you wil publish your website, the generated files assume you build the site with 11ty and possibly with Gitlab pages.</p>
          </div>
            ${opts.view?.settingsEl ? (opts.view.settingsEl as () => HTMLElement)() : ''}
          </div>
          </div>
        </div>
        `
      }
    }, 'site')
  })
}