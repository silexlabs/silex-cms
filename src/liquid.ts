import { Expression, FIXED_TOKEN_ID, Filter, Property, State, StateId, Token, getPersistantId, getStateVariableName, DataTree } from '@silexlabs/grapesjs-data-source'
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
    .map(({ liquid }) => liquid)
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
    .map(({liquid}) => liquid)
    .join('\n\t')
}
    assign ${ getStateVariableName(persistantId, stateId) } = ${ statements[statements.length - 1].variableName }
  %}`
}

/**
 * Generate liquid instructions which start and end a loop over the provided expression
 * This is used for components states
 */
export function loopBlock(dataTree: DataTree, component: Component, expression: Expression): [start: string, end: string] {
  if(expression.length === 0) throw new Error('Expression is empty')
  // Check data to loop over
  const field = dataTree.getExpressionResultType(expression, component)
  if (!field) throw new Error(`Expression ${expression.map(token => token.label).join(' -> ')} is invalid`)
  if (field.kind !== 'list') throw new Error(`Provided property needs to be a list in order to loop, not a ${field.kind}`)
  const statements = getLiquidBlock(component, expression)
  const loopDataVariableName = statements[statements.length - 1].variableName
  const persistantId = getPersistantId(component)
  if(!persistantId) {
    console.error('Component', component, 'has no persistant ID. Persistant ID is required to get component states.')
    throw new Error('This component has no persistant ID')
  }
  return [`{% liquid
    ${
  statements
    .map(({liquid}) => liquid)
    .join('\n\t')
}
    %}
    {% for ${getStateVariableName(persistantId, '__data')} in ${ loopDataVariableName } %}
  `, '{% endfor %}']
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
    .map(({liquid}) => liquid)
    .join('\n\t')
}
    %}
    {% if ${ lastVariableName } %}
  `, '{% endif %}']
}

let numNextVar = 0
/**
 * Convert an expression to liquid code
 */
export function getLiquidBlock(component: Component, expression: Expression): { variableName: string, liquid: string }[] {
  if(expression.length === 0) return []
  const result = [] as { variableName: string, liquid: string }[]
  const firstToken = expression[0]
  let lastVariableName = ''
  if(firstToken.type === 'filter') throw new Error('Expression cannot start with a filter')
  if(firstToken.type === 'property') {
    lastVariableName = firstToken.dataSourceId as string || ''
  }
  const rest = [...expression]
  while(rest.length) {
    // Move all tokens until the first filter
    const firstFilterIndex = rest.findIndex(token => token.type === 'filter')
    const variableExpression = firstFilterIndex === -1 ? rest.splice(0) : rest.splice(0, firstFilterIndex)
    // Add all the filters until a property again
    const firstNonFilterIndex = rest.findIndex(token => token.type !== 'filter')
    const filterExpression = firstNonFilterIndex === -1 ? rest.splice(0) : rest.splice(0, firstNonFilterIndex)
    const variableName = getNextVariableName(component, numNextVar++)
    const statement = getLiquidStatement(variableExpression.concat(filterExpression), variableName, lastVariableName)
    lastVariableName = variableName
    result.push({
      variableName,
      liquid: statement,
    })
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
export function getLiquidStatement(expression: Expression, variableName: string, lastVariableName: string = ''): string {
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
      return getStateVariableName(token.componentId, token.storedStateId)
    }
    case 'property': {
      if(token.fieldId === FIXED_TOKEN_ID) {
        return `"${token.options?.value ?? ''}"`
      }
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