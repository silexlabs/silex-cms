// .eleventy.js
const { EleventyI18nPlugin } = require("@11ty/eleventy");
const Image = require("@11ty/eleventy-img");

module.exports = function(eleventyConfig) {
  // Serve CSS along with the site
  eleventyConfig.addPassthroughCopy({"hosting/css/*.css": "css"});

  // For the fetch plugin
  eleventyConfig.watchIgnores.add('**/.cache/**')

  // i18n plugin
  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    // any valid BCP 47-compatible language tag is supported
    defaultLanguage: "en",
  });

  // Image plugin
  eleventyConfig.addShortcode("image", async function(src, alt, sizes) {
    let metadata = await Image(src, {
      widths: [300, 600],
      formats: ["avif", "jpeg"]
    });
    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };

    // You bet we throw an error on a missing alt (alt="" works okay)
    return Image.generateHTML(metadata, imageAttributes);
  });
};
