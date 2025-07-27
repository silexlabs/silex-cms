import { ClientConfig } from '@silexlabs/silex/src/ts/client/config'
import { getValue } from '@silexlabs/grapesjs-data-source'
import { Editor } from 'grapesjs'

// Import the PREVIEW_INDEX_CHANGED constant
const PREVIEW_INDEX_CHANGED = 'PREVIEW_INDEX_CHANGED'

// CSS styles for the items preview control
document.querySelector('head')?.insertAdjacentHTML('beforeend', `
  <style>
  .items-preview-control {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    font-size: 12px;
    color: white;
    margin-left: 8px;
  }
  .items-preview-control label {
    margin: 0;
    color: white;
    font-weight: normal;
  }
  .items-preview-control input[type="range"] {
    width: 80px;
    height: 20px;
  }
  .items-preview-control input[type="number"] {
    width: 50px;
    height: 24px;
    padding: 2px 4px;
    border: 1px solid #444;
    border-radius: 2px;
    background: #333;
    color: white;
    font-size: 11px;
  }
  .items-preview-control input[type="number"]:focus {
    outline: 1px solid #007cff;
  }
  .items-preview-info {
    font-size: 11px;
    color: #ccc;
    margin-left: 4px;
  }
  .items-preview-control.hidden {
    display: none;
  }
  </style>
`)

class ItemsPreviewControl {
  private editor: Editor
  private container: HTMLElement
  private rangeInput: HTMLInputElement
  private numberInput: HTMLInputElement
  private infoSpan: HTMLElement
  private previewIndex = 0
  private maxIndex = 0
  private hasItems = false
  private updating = false

  constructor(editor: Editor) {
    this.editor = editor
    this.container = this.createControlElement()
    this.rangeInput = this.container.querySelector('input[type="range"]')!
    this.numberInput = this.container.querySelector('input[type="number"]')!
    this.infoSpan = this.container.querySelector('.items-preview-info')!

    this.setupEventListeners()
    this.updatePreviewData()
  }

  private createControlElement(): HTMLElement {
    const div = document.createElement('div')
    div.className = 'items-preview-control hidden'
    div.innerHTML = `
      <label>Item:</label>
      <input type="range" step="1" min="0" max="0" value="0">
      <input type="number" step="1" min="0" max="0" value="0">
      <span class="items-preview-info">/ 0</span>
    `
    return div
  }

  private setupEventListeners() {
    // Listen for input changes
    this.rangeInput.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value)
      this.updateItemsPreviewIndex(value)
      this.numberInput.value = value.toString()
    })

    this.numberInput.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value)
      if (value >= 0 && value <= this.maxIndex) {
        this.updateItemsPreviewIndex(value)
        this.rangeInput.value = value.toString()
      }
    })

    // Listen for editor events
    this.editor.on('page:select', () => {
      setTimeout(() => this.updatePreviewData(), 50)
    })

    this.editor.on('data-source:data-load:end', () => {
      setTimeout(() => this.updatePreviewData(), 50)
    })

    // Listen for preview index changes (but not our own updates)
    this.editor.on(PREVIEW_INDEX_CHANGED, () => {
      if (!this.updating) {
        setTimeout(() => this.updatePreviewData(), 50)
      }
    })
  }

  updatePreviewData() {
    if (!this.editor) return

    const page = this.editor.Pages.getSelected()
    const body = page?.getMainComponent()
    if (!body) {
      this.setVisibility(false)
      return
    }

    // Find the items state directly (following state-editor pattern)
    const itemsState = body.attributes.publicStates?.find((s: any) => s.id === 'items')
    if (!itemsState?.expression?.length) {
      this.setVisibility(false)
      return
    }

    // Get preview data for the items expression
    try {
      const rawData = getValue(itemsState.expression, body, false)

      if (Array.isArray(rawData) && rawData.length > 0) {
        this.hasItems = true
        this.maxIndex = rawData.length - 1

        // Get current preview index from the expression
        const lastToken = itemsState.expression[itemsState.expression.length - 1]
        if (lastToken && typeof lastToken === 'object' && 'previewIndex' in lastToken) {
          this.previewIndex = (lastToken as any).previewIndex || 0
        } else {
          this.previewIndex = 0
        }

        // Ensure preview index is within bounds
        if (this.previewIndex > this.maxIndex) {
          this.previewIndex = this.maxIndex
          this.updateItemsPreviewIndex(this.previewIndex)
        }

        this.updateUI()
        this.setVisibility(true)
      } else {
        this.setVisibility(false)
      }
    } catch (e) {
      console.error('Error getting items preview data:', e)
      this.setVisibility(false)
    }
  }

  private updateUI() {
    this.rangeInput.max = this.maxIndex.toString()
    this.rangeInput.value = this.previewIndex.toString()
    this.numberInput.max = this.maxIndex.toString()
    this.numberInput.value = this.previewIndex.toString()
    this.infoSpan.textContent = `/ ${this.maxIndex}`
  }

  private setVisibility(visible: boolean) {
    if (visible) {
      this.container.classList.remove('hidden')
    } else {
      this.container.classList.add('hidden')
    }
    this.hasItems = visible
  }

  private updateItemsPreviewIndex(newIndex: number) {
    if (!this.editor) return

    const page = this.editor.Pages.getSelected()
    const body = page?.getMainComponent()
    if (!body) return

    // Find the items state directly (following state-editor pattern)
    const itemsState = body.attributes.publicStates?.find((s: any) => s.id === 'items')
    if (itemsState?.expression?.length > 0) {
      // Set updating flag to prevent feedback loop
      this.updating = true

      // Directly modify the last token's previewIndex (same as state-editor does)
      const token = itemsState.expression[itemsState.expression.length - 1]
      token.previewIndex = newIndex

      this.previewIndex = newIndex

      // Trigger the preview index changed event
      this.editor.trigger(PREVIEW_INDEX_CHANGED)

      // Clear the updating flag after a short delay
      setTimeout(() => {
        this.updating = false
      }, 100)
    }
  }

  getElement(): HTMLElement {
    return this.container
  }

  destroy() {
    this.container.remove()
    // Note: GrapesJS doesn't seem to have an off method, so we can't clean up listeners
  }
}

export default function(config: ClientConfig): void {
  config.on('silex:grapesjs:end', () => {
    const editor = config.getEditor()

    // Create the items preview control
    const itemsControl = new ItemsPreviewControl(editor)

    // Add it to the options panel in the toolbar
    const optionsPanel = editor.Panels.getPanel('options')
    if (optionsPanel) {
      // Insert the control into the panel's view element
      const panelEl = optionsPanel.view.el
      if (panelEl) {
        panelEl.appendChild(itemsControl.getElement())
      }
    }
  })
}
