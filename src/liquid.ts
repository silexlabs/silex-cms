import { Expression, Filter, Property, State, Token } from '@silexlabs/grapesjs-data-source'
import { Component } from 'grapesjs'

/**
 * Convert an expression to liquid code
 */
export function toLiquid(component: Component, expression: Expression): { variableName: string, liquid: string }[] {
  if(expression.length === 0) return []
  const rest = [...expression]
  const result = []
  let numNextVar = 0
  const firstToken = expression[0]
  if(firstToken.type === 'filter') throw new Error('Expression cannot start with a filter')
  let lastVariableName = firstToken.type === 'property' ? firstToken.dataSourceId.toString() : ''
  while(rest.length) {
    // Move all tokens until the first filter
    const variableExpression = rest.splice(0, rest.findIndex(token => token.type === 'filter'))
    // Add all the filters until a property again
    .concat(rest.splice(0, rest.findIndex(token => token.type !== 'filter')))
    const variableName = getNextVariableName(component, numNextVar++)
    const variabelString = getLiquidStatement(variableExpression, variableName, lastVariableName)
    lastVariableName = variableName
    result.push({variableName, liquid: variabelString})
  }
  return result
}

export function getNextVariableName(component: Component, numNextVar: number): string {
  return `var_${component.ccid}_${numNextVar}`
}

/**
 * Get the liquid assign statement for the expression
 * The expression must
 * - start with a property or state
 * - once it has a filter it canot have a property again
 * - state can only be the first token
 * 
 * Example of return value: `countries.continent.countries | first.name`
 */
export function getLiquidStatement(expression: Token[], variableName: string, lastVariableName: string = ''): string {
  if(expression.length === 0) throw new Error('Expression cannot be empty')
  // Split expression in 2: properties and filters
  const firstFilterIndex = expression.findIndex(token => token.type === 'filter')
  if(firstFilterIndex === 0) throw new Error('Expression cannot start with a filter')
  const properties = (firstFilterIndex < 0 ? expression : expression.slice(0, firstFilterIndex)) as (Property | State)[]
  const filters = firstFilterIndex > 0 ? expression.slice(firstFilterIndex) as Filter[] : []
  // Check that no properties or state come after filter
  if(filters.find(token => token.type !== 'filter')) {
    throw new Error('A filter cannot be followed by a property or state')
  }
  // Start with the assign statement
  return `assign ${variableName} = ${
    lastVariableName ? `${ lastVariableName }.` : ''
  }${
    // Add all the properties
    getLiquidStatementProperties(properties)
  }${
    // Add all the filters
    getLiquidStatementFilters(filters)
  }`
}

export function getLiquidStatementProperties(properties: (Property | State)[]): string {
  return properties.map((token, index) => {
    switch (token.type) {
      case 'state': {
        if (index !== 0) throw new Error('State can only be the first token in an expression')
        return `state_${ token.componentId }_${ token.storedStateId }`
      }
      case 'property': {
        return token.fieldId
      }
      default: {
        throw new Error(`Only state or property can be used in an expression, got ${(token as Token).type}`)
      }
    }
  })
  .join('.')
}

export function getLiquidStatementFilters(filters: Filter[]): string {
  if(!filters.length) return ''
  return ' | ' + filters.map(token => {
    const options = token.options ? Object.values(token.options) : []
    return `${token.id}${options.length ? `: ${options.join(', ')}` : ''}`
  })
  .join(' | ')
}