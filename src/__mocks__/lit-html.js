// Mock implementation of lit-html for testing
const html = (strings, ...values) => {
  return {
    strings,
    values,
    _$litType$: 1
  }
}

const render = (template, container) => {
  // Simple mock implementation
  if (container && template) {
    container.innerHTML = template.toString()
  }
}

const nothing = Symbol('nothing')
const noChange = Symbol('noChange')

module.exports = {
  html,
  render,
  nothing,
  noChange
}