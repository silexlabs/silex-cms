import { PublicationTransformer } from "@silexlabs/silex/src/ts/client/publication-transformers"
import { Component } from 'grapesjs'
import { getState, getStateIds } from '@silexlabs/grapesjs-data-source'

export function getPublicationTransformer(): PublicationTransformer {
  return {
    renderComponent(component: Component, toHtml: () => string): string | undefined {
      const state = getStateIds(component)
      console.log('renderComponent', component.getName(), component.get('type'))
      return toHtml()
    },
  }
}