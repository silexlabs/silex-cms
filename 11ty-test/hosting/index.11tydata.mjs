

export default async function (configData) {
  const data = {
    ...configData,
    lang: '',
  }
  const result = {}
  try {
  const response = await fetch(`https://countries.trevorblades.com/graphql`, {

  headers: {
    'Content-Type': `application/json`,
  },
  method: 'POST',
  body: JSON.stringify({
    query: `query {
__typename
continents {
  __typename
  name

}

}`,
  })
  })

  if (!response.ok) {
    throw new Error(`Error fetching graphql data: HTTP status code ${response.status}, HTTP status text: ${response.statusText}`)
  }

  const json = await response.json()

  if (json.errors) {
    throw new Error(`GraphQL error: \
> ${json.errors.map(e => e.message).join('\
> ')}`)
  }

  result['ds-1'] = json.data
} catch (e) {
  console.error('11ty plugin for Silex: error fetching graphql data', e, 'ds-1', 'https://countries.trevorblades.com/graphql')
  throw e
}
  return result
}
  