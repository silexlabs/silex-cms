
const EleventyFetch = require('@11ty/eleventy-fetch')
module.exports = async function () {
  const result = {}
  
  try {
    result['directus'] = (await EleventyFetch(`https://eco-starter.2.internet2000.net/cms/graphql`, {
      type: 'json',
      ...{"duration":"0s","type":"json"},
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
    console.error('11ty plugin for Silex: error fetching graphql data', e, 'directus', 'https://eco-starter.2.internet2000.net/cms/graphql', 'POST', `query {
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

  return result
}
  