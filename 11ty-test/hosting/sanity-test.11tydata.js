
const EleventyFetch = require('@11ty/eleventy-fetch')
module.exports = async function () {
  const result = {}
  
  try {
    result['sanity'] = (await EleventyFetch(`https://gl93e3h9.api.sanity.io/v2023-08-01/graphql/production/default?cache_buster=350404`, {
      ...{"duration":"1s","type":"json"},
      fetchOptions: {
        headers: {
          'Authorization': `Bearer skGP3qsWCXgPPTqmvIyAdeFhACwWKt94Eq3oCexQNvalA291L03mfLLq0DFHN9pVxhPuTVSs5vfDucKpWZHKRGGKwBdou4QYW32yNBBkHJjl2QGnn67KtdaqRCo7vhxlBObbZdFVylCgtO2M6c4lvkal0owBpVO4PCcMxeUC38z1r8pjvTXJ`,
'content-type': `application/json`,
        },
        method: 'POST',
        body: JSON.stringify({
          query: `query {
  __typename
  allBlog {
    __typename
    author {
      __typename
      name
      avatar {
        __typename
        asset {
          __typename
          url

        }

      }

    }
    title

  }

}`,
        })
      }
    })).data
  } catch (e) {
    console.error('11ty plugin for Silex: error fetching graphql data', e, 'sanity', 'https://gl93e3h9.api.sanity.io/v2023-08-01/graphql/production/default?cache_buster=350404', 'POST', `query {
  __typename
  allBlog {
    __typename
    author {
      __typename
      name
      avatar {
        __typename
        asset {
          __typename
          url

        }

      }

    }
    title

  }

}`)
    throw e
  }

  return result
}
  