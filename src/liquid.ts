import { Expression, Filter, Property, State, StateId, Token, getPersistantId } from '@silexlabs/grapesjs-data-source'
import { Component } from 'grapesjs'

/**
 * Generate liquid instructions which echo the value of an expression
 */
export function echoBlock(component: Component, expression: Expression): string {
  if(expression.length === 0) throw new Error('Expression is empty')
  const statements = getLiquidBlock(component, expression)
  return `{% liquid
    ${
      statements
      .map(({variableName, liquid}) => liquid)
      .join('\n\t')
    }
    echo ${ statements[statements.length - 1].variableName }
  %}`
}

/**
 * Generate liquid instructions which define a variable for later use
 * This is used for components states
 */
export function assignBlock(stateId: StateId, component: Component, expression: Expression): string {
  if(expression.length === 0) throw new Error('Expression is empty')
  const statements = getLiquidBlock(component, expression)
  const persistantId = getPersistantId(component)
  if(!persistantId) throw new Error('This component has no persistant ID')
  return `{% liquid
    ${
      statements
      .map(({variableName, liquid}) => liquid)
      .join('\n\t')
    }
    assign ${ getStateName(persistantId, stateId) } = ${ statements[statements.length - 1].variableName }
  %}`
}

/**
 * Generate liquid instructions which start and end a loop over the provided expression
 * This is used for components states
 */
export function loopBlock(stateId: StateId, component: Component, expression: Expression): [start: string, end: string] {
  if(expression.length === 0) throw new Error('Expression is empty')
  const last = expression[expression.length - 1]
  // Check data to loop over
  switch(last.type) {
    case 'property':
      if(last.kind !== 'list') throw new Error(`Provided property needs to be a list in order to loop, not a ${last.kind}`)
      break
    case 'state':
      if(last.forceKind !== 'list') throw new Error(`Provided state needs to be a list in order to loop, not a ${last.forceKind}`)
      break
    case 'filter':
      break
  }
  const statements = getLiquidBlock(component, expression)
  const loopDataVariableName = statements[statements.length - 1].variableName
  return [`{% liquid
    ${
      statements
      .map(({variableName, liquid}) => liquid)
      .join('\n\t')
    }
    %}
    {% for ${getStateName(getPersistantId(component), '__data')} in ${ loopDataVariableName } %}
  `, `{% endfor %}`]
}

/**
 * Generate liquid instructions which define a variable for later use
 * This is used for components states
 */
export function ifBlock(component: Component, expression: Expression): [start: string, end: string] {
  if(expression.length === 0) throw new Error('Expression is empty')
  // Check data to loop over
  const statements = getLiquidBlock(component, expression)
  const lastVariableName = statements[statements.length - 1].variableName
  return [`{% liquid
    ${
      statements
      .map(({variableName, liquid}) => liquid)
      .join('\n\t')
    }
    %}
    {% if ${ lastVariableName } %}
  `, `{% endif %}`]
}

let numNextVar = 0
/**
 * Convert an expression to liquid code
 */
export function getLiquidBlock(component: Component, expression: Expression): { variableName: string, liquid: string }[] {
  if(expression.length === 0) return []
  const rest = [...expression]
  const result = []
  const firstToken = expression[0]
  if(firstToken.type === 'filter') throw new Error('Expression cannot start with a filter')
  let lastVariableName = firstToken.type === 'property' ? firstToken.dataSourceId.toString() : ''
  while(rest.length) {
    // Move all tokens until the first filter
    const firstFilterIndex = rest.findIndex(token => token.type === 'filter')
    const variableExpression = firstFilterIndex === -1 ? rest.splice(0) : rest.splice(0, firstFilterIndex)
    // Add all the filters until a property again
    const firstNonFilterIndex = rest.findIndex(token => token.type !== 'filter')
    const filterExpression = firstNonFilterIndex === -1 ? rest.splice(0) : rest.splice(0, firstNonFilterIndex)
    const variableName = getNextVariableName(component, numNextVar++)
    //console.log({expression, variableExpression, filterExpression, firstFilterIndex, firstNonFilterIndex})
    const statement = getLiquidStatement(variableExpression.concat(filterExpression), variableName, lastVariableName)
    lastVariableName = variableName
    result.push({variableName, liquid: statement})
  }
  return result
}

export function getNextVariableName(component: Component, numNextVar: number): string {
  return `var_${component.ccid}_${numNextVar}`
}

export function getStateName(componentId: string, stateId: StateId): string {
  return `state_${ componentId }_${ stateId }`
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
        return getStateName(token.componentId, token.storedStateId)
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