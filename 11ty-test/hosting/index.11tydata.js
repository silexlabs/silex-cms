
const EleventyFetch = require('@11ty/eleventy-fetch')
module.exports = async function () {
  const result = {}
  
  try {
    result['directus'] = (await EleventyFetch(`https://eco-starter.eco2.i2k.site/cms/graphql?cache_buster=190923`, {
      ...{"duration":"1s","type":"json"},
      fetchOptions: {
        headers: {
          'content-type': `application/json`,
        },
        method: 'POST',
        body: JSON.stringify({
          query: `query {
  __typename
  blog {
    __typename
    label
    id

  }

}`,
        })
      }
    })).data
  } catch (e) {
    console.error('11ty plugin for Silex: error fetching graphql data', e, 'directus', 'https://eco-starter.eco2.i2k.site/cms/graphql?cache_buster=190923', 'POST', `query {
  __typename
  blog {
    __typename
    label
    id

  }

}`)
    throw e
  }

  return result
}
  