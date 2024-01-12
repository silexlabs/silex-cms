
const EleventyFetch = require('@11ty/eleventy-fetch')
module.exports = async function () {
  const result = {}
  
  try {
    result['directus'] = (await EleventyFetch(`https://eco-starter.2.internet2000.net/cms/graphql?cache_buster=190207`, {
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
    translations {
      __typename
      title
      richtext_content
      image {
        __typename
        filename_download

      }
      languages_id {
        __typename
        code

      }

    }

  }

}`,
        })
      }
    })).data
  } catch (e) {
    console.error('11ty plugin for Silex: error fetching graphql data', e, 'directus', 'https://eco-starter.2.internet2000.net/cms/graphql?cache_buster=190207', 'POST', `query {
  __typename
  blog {
    __typename
    label
    translations {
      __typename
      title
      richtext_content
      image {
        __typename
        filename_download

      }
      languages_id {
        __typename
        code

      }

    }

  }

}`)
    throw e
  }


  try {
    result['sanity'] = (await EleventyFetch(`https://gl93e3h9.api.sanity.io/v2023-08-01/graphql/production/default?cache_buster=355613`, {
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
  Blog {
    __typename


  }

}`,
        })
      }
    })).data
  } catch (e) {
    console.error('11ty plugin for Silex: error fetching graphql data', e, 'sanity', 'https://gl93e3h9.api.sanity.io/v2023-08-01/graphql/production/default?cache_buster=355613', 'POST', `query {
  __typename
  Blog {
    __typename


  }

}`)
    throw e
  }

  return result
}
  