import { PublicationTransformer } from '@silexlabs/silex/src/ts/client/publication-transformers'
import { Component } from 'grapesjs'
import { StoredState, getState, getStateIds } from '@silexlabs/grapesjs-data-source'
import { echoBlock, ifBlock } from '../liquid'

/**
 * Make html attribute
 * Quote strings, no values for boolean
 */
function makeAttribute(key, value) {
  switch (typeof value) {
    case 'boolean': return value ? key : ''
    default: return `${key}="${value}"`
  }
}

/**
 * Make inline style
 */
function makeStyle(key, value) {
  return `${key}: ${value};`
}

/**
 * Render the components when they are published
 */
export function getPublicationTransformer(): PublicationTransformer {
  return {
    renderComponent(component: Component, toHtml: () => string): string | undefined {
      const statesIds = getStateIds(component, false)
      const statesArr = statesIds
        .map(stateId => ({
          stateId,
          state: getState(component, stateId, false),
        }))
        .concat(getStateIds(component, true).map(stateId => ({
          stateId,
          state: getState(component, stateId, true),
        })))
        .filter(({state}) => state.expression.length > 0)
      // Convenience key value object
      const statesObj = statesArr
        .reduce((final, {stateId, state}) => ({
          ...final,
          [stateId]: state,
        }), {} as Record<string, StoredState>)

      if(statesArr.length) {
        const tagName = component.get('tagName')
        if(tagName) {
          const className = component.getClasses().join(' ')
            + statesObj.className && statesObj.className?.expression.length ? ` ${ echoBlock(component, statesObj.className.expression) }` : ''
          const attributes = Object.entries(component.get('attributes') as object).map(([key, value]) => makeAttribute(key, value)).join(' ')
          // TODO: + statesObj.attributes
          const style = Object.entries(component.getStyle()).map(([key, value]) => makeStyle(key, value)).join(' ')
            +  statesObj.style && statesObj.style?.expression.length ? ` ${ echoBlock(component, statesObj.style.expression) }` : ''
          const innerHtml = component.getInnerHTML()
            + statesObj.innerHtml && statesObj.innerHtml?.expression.length ? echoBlock(component, statesObj.innerHtml.expression) : ''
          const [ifStart, ifEnd] = statesObj.condition?.expression.length ? ifBlock(component, statesObj.condition.expression) : []
          const [forStart, forEnd] = statesObj.___data?.expression.length ? ifBlock(component, statesObj.___data.expression) : []
          const before = (ifStart ?? '') + (forStart ?? '')
          const after = (ifEnd ?? '') + (forEnd ?? '')
          // TODO: src, href, alt
          return `${before
          }<${tagName}
                ${attributes}${className ? ` class="${className}"` : '' }${style ? ` style="${style}"` : ''}
              >${innerHtml
            }</${tagName}>${after
          }`
        } else {
          // Not a real component
          // FIXME: understand why
          throw new Error('Why no tagName?')
        }
      } else {
        return toHtml()
      }
    },
  }
}