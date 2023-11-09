/*
 * @jest-environment jsdom
 */
import { Field, Filter, Property, State } from "@silexlabs/grapesjs-data-source"
import { getLiquidStatement, getLiquidStatementFilters, getLiquidStatementProperties } from "./liquid"
import { expressionWithFirst, expressionWithState, simpleExpression } from "./liquid.mock"
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

//test('get first liquid statement with state', () => {
//  const { expression } = expressionWithState
//  const editor = grapesjs.init({headless: true})
//  const component = editor.addComponents('test')[0]
//  expect(firstLiquidStatement(component, expression[0]))
//  .toMatch(/assign \w+ = \w+/)
//})
//test('get next liquid statement', () => {
//  const { expression } = simpleExpression
//  const editor = grapesjs.init({headless: true})
//  const component = editor.addComponents('test')[0]
//  expect(nextLiquidStatement(component, [expression[0]], expression[1]))
//  .toMatch(/assign \w+ = countries\.language\.name/)
//})
//
//test('simple expression', () => {
//  const { expression } = simpleExpression
//  const editor = grapesjs.init({headless: true})
//  const component = editor.addComponents('test')[0]
//  expect(toLiquid(component, expression))
//  .toMatch(/^\{\% assign \w+ = countries\.language\.countries\.name \%\}\{\{ \w+ \}\}/)
//})
//
//test('expression with "first" filter', () => {
//  const { expression } = expressionWithFirst
//  const editor = grapesjs.init({headless: true})
//  const component = editor.addComponents('test')[0]
//  expect(toLiquid(component, expression))
//  .toMatch(/^\{\% assign \w+ = countries\.continent\.countries \| first \%\}\{\{ \w+\.name \}\}/)
//})
//