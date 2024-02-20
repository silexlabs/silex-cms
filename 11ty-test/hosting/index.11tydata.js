
import EleventyFetch from '@11ty/eleventy-fetch'
export default async function () {
  const result = {}
  
  try {
    result['countries_api'] = (await EleventyFetch(`https://countries.trevorblades.com/graphql?cache_buster=725440`, {
      ...{"duration":"1s","type":"json"},
      fetchOptions: {
        headers: {
          'content-type': `application/json`,
        },
        method: 'POST',
        body: JSON.stringify({
          query: `query {
  __typename
  continents {
    __typename


  }

}`,
        })
      }
    })).data
  } catch (e) {
    console.error('11ty plugin for Silex: error fetching graphql data', e, 'countries_api', 'https://countries.trevorblades.com/graphql?cache_buster=725440', 'POST', `query {
  __typename
  continents {
    __typename


  }

}`)
    throw e
  }

  return result
}
  