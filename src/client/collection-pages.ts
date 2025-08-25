import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { EleventyPluginOptions } from '../client'
import { Editor } from 'grapesjs'
import { html, render } from 'lit-html'
import { COMMAND_PREVIEW_REFRESH, DATA_SOURCE_DATA_LOAD_END, getValue } from '@silexlabs/grapesjs-data-source'
import { TemplateResult } from 'lit-html'

const PREVIEW_INDEX_CHANGED = 'PREVIEW_INDEX_CHANGED'

// Add CSS for collection pages
document.querySelector('head')?.insertAdjacentHTML('beforeend', `
  <style>
  .pages__empty {
    padding: 16px;
    text-align: center;
    color: #888;
    font-size: 12px;
    font-style: italic;
  }
  .pages__page {
    cursor: pointer;
  }
  .pages__page:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  </style>
`)

export default function (config: ClientConfig, opts: EleventyPluginOptions): void {
  if (!opts.enable11ty) return // Do not add the settings if 11ty is disabled

  config.on('silex:startup:end', () => {
    const editor = config.getEditor() as Editor
    const pagesContainer = editor.Panels.getPanel('project-bar-container')
      ?.view
      ?.el
      ?.querySelector('.page-panel-container')

    const container = document.createElement('div')
    pagesContainer?.appendChild(container)

    // Function to update the collection pages display
    const updatePages = () => render(getHtml(editor), container)

    // Listen for data changes and page selection
    editor.on(`
      ${DATA_SOURCE_DATA_LOAD_END}
      ${PREVIEW_INDEX_CHANGED}
      storage:load:end
      page:all
    `, updatePages)

    // Temporary
    editor.on(`
      ${PREVIEW_INDEX_CHANGED}
      `, () => {
      editor.runCommand(COMMAND_PREVIEW_REFRESH)
    })

    // Initial render
    updatePages()
  })
}

function getHtml(editor: Editor): TemplateResult {
  const { items, currentIndex } = getCollectionData(editor)

  return html`
    <header class="project-bar__panel-header">
      <h3 class="project-bar__panel-header-title">Collection Pages</h3>
      <div class="project-bar__panel-header-button gjs-pn-btn" @click=${() => handleAddClick(editor)}>
        <span>✚</span>
      </div>
    </header>
    <div class="pages__wrapper">
      <section class="pages">
        <main class="pages__main">
          <div class="pages__list">
            ${items.length === 0
              ? html`<div class="pages__empty">No collection items found</div>`
              : items.map((item, index) => html`
                  <div
                    class="pages__page ${index === currentIndex ? 'pages__page-selected' : ''}"
                    data-item-index="${index}"
                    @click=${() => handleItemClick(editor, index)}
                  >
                    <div class="pages__page-name">
                      ${getItemDisplayName(item, index)}
                    </div>
                    ${index === currentIndex ? html`<i class="pages__icon pages__remove-btn fa fa-trash"></i>` : ''}
                  </div>
                `)
            }
          </div>
        </main>
      </section>
    </div>
  `
}

function getCollectionData(editor: Editor) {
  const page = editor.Pages.getSelected()
  const body = page?.getMainComponent()

  if (!body) {
    return { items: [], currentIndex: 0 }
  }

  // Find the items state
  const itemsState = body.attributes.publicStates?.find((s: any) => s.id === 'items')
  if (!itemsState?.expression?.length) {
    return { items: [], currentIndex: 0 }
  }

  try {
    const rawData = getValue(itemsState.expression, body as any, false)

    if (Array.isArray(rawData) && rawData.length > 0) {
      // Get current preview index from the expression
      const lastToken = itemsState.expression[itemsState.expression.length - 1]
      const currentIndex = (lastToken && typeof lastToken === 'object' && 'previewIndex' in lastToken)
        ? (lastToken as any).previewIndex || 0
        : 0

      return { items: rawData, currentIndex: Math.min(currentIndex, rawData.length - 1) }
    }
  } catch (e) {
    console.error('Error getting collection data:', e)
  }

  return { items: [], currentIndex: 0 }
}

function getItemDisplayName(item: any, index: number): string {
  // Try to find a meaningful name from the item data
  if (item && typeof item === 'object') {
    // Common fields that might contain names
    const nameFields = ['name', 'title', 'label', 'slug', 'id']

    for (const field of nameFields) {
      if (item[field] && typeof item[field] === 'string') {
        return item[field]
      }
    }

    // If it's an object, show the first string value
    const firstStringValue = Object.values(item).find(value => typeof value === 'string')
    if (firstStringValue) {
      return firstStringValue as string
    }
  }

  // Fallback to index-based name
  return `Item ${index + 1}`
}

function handleItemClick(editor: Editor, index: number) {
  const page = editor.Pages.getSelected()
  const body = page?.getMainComponent()

  if (!body) return

  // Find the items state
  const itemsState = body.attributes.publicStates?.find((s: any) => s.id === 'items')
  if (itemsState?.expression?.length > 0) {
    // Update the preview index
    const token = itemsState.expression[itemsState.expression.length - 1]
    token.previewIndex = index

    // Trigger the preview refresh
    editor.trigger(PREVIEW_INDEX_CHANGED)
  }
}

function handleAddClick(editor: Editor) {
  // For now, just show an alert - this could be expanded to create new items
  alert('Add new collection item functionality would be implemented here')
}
