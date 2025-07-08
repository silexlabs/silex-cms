import { EleventyI18nPlugin } from "@11ty/eleventy";
import Image from "@11ty/eleventy-img";

export default function(eleventyConfig) {
  // Serve CSS along with the site
  eleventyConfig.addPassthroughCopy({"hosting/css/*.css": "css"});

  // For the fetch plugin
  eleventyConfig.watchIgnores.add('**/.cache/**');

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

  return {
    dir: {
      input: "hosting",
      output: "_site"
    }
  };
}
