import { ClientConfig } from "@silexlabs/silex/src/ts/client/config";
import { EleventyPluginOptions, Silex11tyPluginWebsiteSettings } from "../client";
import { html } from "lit-html";

export default function(config: ClientConfig, opts: EleventyPluginOptions): void {
  config.on('silex:startup:end', () => {
    config.addSettings({
      id: 'cms',
      label: 'CMS',
      render: (settings: Silex11tyPluginWebsiteSettings) => {
        return html`
        <div id="settings-cms" class="silex-hideable silex-hidden">
          <div class="gjs-sm-sector-title">Silex CMS</div>
          <div class="silex-help">The <a href="https://github.com/silexlabs/silex-cms">Silex CMS</a> integrates <a href="https://www.11ty.dev/docs/">11ty</a> static site generator and your favorite headless CMS with Silex.</div>
            ${opts.view?.settingsEl ? (opts.view.settingsEl as () => HTMLElement)() : ''}
          </div>
          </div>
        </div>
        `
      }
    }, 'site')
  })
}