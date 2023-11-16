/*
 * @jest-environment jsdom
 */
import { Field, Filter, Property, State, getOrCreatePersistantId } from "@silexlabs/grapesjs-data-source"
import { assignBlock, echoBlock, getLiquidBlock, getLiquidStatement, getLiquidStatementProperties, ifBlock, loopBlock } from "./liquid"
import { expressionList, expressionListWithWhere, expressionWithFirst, expressionWithState, simpleExpression } from "./liquid.mock"
import grapesjs, { Component } from "grapesjs"

test('get liquid statements for properties', () => {
  const { expression } = simpleExpression
  expect(getLiquidStatementProperties(expression as Property[]))
  .toMatch(/language\.name/)
})

test('get liquid statements for state and properties', () => {
  const { expression } = expressionWithState
  expect(getLiquidStatementProperties(expression as (Property | State)[]))
  .toMatch(/state_\w+___data\.code/)
})

test('get liquid statements', () => {
  const { expression } = simpleExpression
  const result = getLiquidStatement(expression, 'variableName')
  expect(result).toMatch(/assign variableName = language\.name/)
})

test('get liquid statements with initial variable (dataSourceId)', () => {
  const { expression } = simpleExpression
  expect(getLiquidStatement(expression, 'variableName', 'countries'))
  .toMatch(/assign variableName = countries\.language\.name/)
})

test('get liquid statements with state, properties and filters', () => {
  const varName = 'variableName'
  expect(getLiquidStatement(expressionWithState.expression, varName))
  .toMatch(/assign variableName = state_\w+___data\.code/)
  expect(getLiquidStatement(expressionWithFirst.expression.slice(0, 3), varName))
  .toEqual('assign variableName = continent.countries | first')
})

test('malformed expressions', () => {
  const varName = 'variableName'
  // Empty expression
  expect(() => getLiquidStatement([], varName))
  .toThrow('Expression cannot be empty')
  expect(() => getLiquidStatement([], varName, 'countries'))
  .toThrow('Expression cannot be empty')
  // State after property
  expect(() => getLiquidStatement([
    {
      "type": "property",
      "propType": "field",
      "fieldId": "code",
      "label": "code",
      "typeIds": [
        "ID"
      ],
      "dataSourceId": "countries",
      "kind": "scalar"
    } as Property,
    {
      "type": "state",
      "storedStateId": "__data",
      "componentId": "c685",
      "exposed": false,
      "forceKind": "object",
      "label": "loop item"
    } as State,
  ], varName))
  .toThrow('State can only be the first token')
  // Filter first
  expect(() => getLiquidStatement([{
    "type": "filter",
    "id": "first",
    "label": "first",
    "options": {}
  } as Filter, {
    "type": "property",
    "propType": "field",
    "fieldId": "countries",
    "label": "countries",
    "typeIds": [
      "Country"
    ],
    "dataSourceId": "countries",
    "kind": "list"
  } as Property], varName))
  .toThrow('Expression cannot start with a filter')
  // Properties after filter
  expect(() => getLiquidStatement([{
    type: 'property',
    propType: 'field',
    fieldId: 'name',
    label: 'name',
    typeIds: ['ID'],
    dataSourceId: 'countries',
    kind: 'scalar'
  }, {
    "type": "filter",
    "id": "first",
    "label": "first",
    "options": {}
  } as Filter, {
    "type": "property",
    "propType": "field",
    "fieldId": "countries",
    "label": "countries",
    "typeIds": [
      "Country"
    ],
    "dataSourceId": "countries",
    "kind": "list"
  } as Property], varName))
  .toThrow('A filter cannot be followed by a property or state')
})

test('get liquid bloc', () => {
  const { expression } = simpleExpression
  const editor = grapesjs.init({headless: true})
  const component = editor.addComponents('test')[0]
  const result = getLiquidBlock(component, expression)
  expect(result).toHaveLength(1)
  expect(result[0].variableName).toMatch(/var_\w+_[09]*/)
  expect(result[0].liquid).toMatch(/assign \w+ = countries\.language/)
})

test('get liquid bloc', () => {
  const { expression } = expressionWithFirst
  const editor = grapesjs.init({headless: true})
  const component = editor.addComponents('test')[0]
  const result = getLiquidBlock(component, expression)
  expect(result).toHaveLength(2)
  expect(result[0].variableName).toMatch(/var_\w+_[09]*/)
  expect(result[0].liquid).toMatch(/assign \w+ = countries\.continent.countries \| first/)
})

test('echo blok', () => {
  const { expression } = expressionWithFirst
  const editor = grapesjs.init({headless: true})
  const component = editor.addComponents('test')[0]
  const result = echoBlock(component, expression)
    .split('\n')
  expect(result).toHaveLength(5)
  expect(result[0]).toBe('{% liquid')
  expect(result[1])
  .toMatch(/assign \w+ = countries\.continent\.countries \| first/)
  expect(result[2])
  .toMatch(/assign \w+ = \w+\.name/)
  expect(result[3])
  .toMatch(/echo \w+/)
  expect(result[4]).toBe('  %}')
})

test('assign block', () => {
  const { expression } = expressionWithFirst
  const editor = grapesjs.init({headless: true})
  const component = editor.addComponents('test')[0]
  getOrCreatePersistantId(component)
  const result = assignBlock('testStateId', component, expression)
    .split('\n')
  expect(result).toHaveLength(5)
  expect(result[0]).toBe('{% liquid')
  expect(result[1])
  .toMatch(/assign \w+ = countries\.continent\.countries \| first/)
  expect(result[2])
  .toMatch(/assign \w+ = \w+\.name/)
  expect(result[3])
  .toMatch(/assign state_\w+_testStateId = \w+/)
  expect(result[4]).toBe('  %}')
})

test('loop block', () => {
  const editor = grapesjs.init({headless: true})
  const component = editor.addComponents('test')[0]
  getOrCreatePersistantId(component)
  const { expression } = expressionList
  const [start, end] = loopBlock('testStateId', component, expression)
  expect(start.split('\n')).toHaveLength(5)
  expect(start.split('\n')[0]).toBe('{% liquid')
  expect(start.split('\n')[1])
  .toMatch(/assign \w+ = countries\.continent/)
  expect(start.split('\n')[3])
  .toMatch(/{% for state_\w+___data in var_\w+ %}/)

  const [start1, end1] = loopBlock('testStateId', component, expressionListWithWhere.expression)
  expect(start1.split('\n')).toHaveLength(5)
  expect(end1).toMatch(/{% endfor %}/)

  const [start2, end2] = loopBlock('testStateId', component, [
    ...expressionWithFirst.expression,
    ...expressionListWithWhere.expression,
  ])
  expect(start2.split('\n')).toHaveLength(6)
  expect(end2).toMatch(/{% endfor %}/)
})

test('if block', () => {
  const editor = grapesjs.init({headless: true})
  const component = editor.addComponents('test')[0]
  const { expression } = expressionList
  const [start, end] = ifBlock(component, expression)
  expect(start.split('\n')).toHaveLength(5)
  expect(start.split('\n')[0]).toBe('{% liquid')
  expect(start.split('\n')[1])
  .toMatch(/assign \w+ = countries\.continent/)
  expect(start.split('\n')[3])
  .toMatch(/{% if var_\w+ %}/)
})
