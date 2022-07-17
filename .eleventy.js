const Image = require("@11ty/eleventy-img");
const lodash = require("lodash");
const path = require("path");

function imageShortcode(src, alt, lazy, async, sizes="100w") {
	const options = {
		formats: ["webp", "jpeg"],
		widths: [480, 768, 1024],
		urlPath: `${process.env.mode === "prod" ? "/game-developer-studio-page" : ""}/assets/images/`,
		outputDir: "./docs/assets/images/",
		filenameFormat(id, src, width, format, options) {
			const { name } = path.parse(src);
			return `${name}-${width}w.${format}`;
		},
		sharpJpegOptions: { quality: 75 }
	};

	Image(src, options);

	let imageAttributes = { alt, draggable: "false", sizes };

	if (lazy) imageAttributes.loading = "lazy";
	if (async) imageAttributes.decoding = "async";

	const metadata = Image.statsSync(src, options);
	return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function (eleventyConfig) {
	const games = lodash.groupBy(require("./src/_data/games.json"), "title");
	const dateOptions = {
		year: "numeric",
		day: "numeric",
		month: "long"
	};

	eleventyConfig.addPassthroughCopy("assets/images");

	eleventyConfig.addNunjucksShortcode("image", imageShortcode);

	eleventyConfig.addNunjucksFilter("toLocaleDate", date => date.toLocaleDateString("en-GB", dateOptions));
	eleventyConfig.addNunjucksFilter("getShowcaseGames", titles => titles.map(title => games[title][0]));
	eleventyConfig.addNunjucksFilter("findGameLink", title => games[title][0].link);
	eleventyConfig.addNunjucksFilter("head", (data, size) => data.slice(0, size));

	eleventyConfig.setBrowserSyncConfig({
		online: false,
		open: "local"
	});

	return {
		markdownTemplateEngine: "njk",
		pathPrefix: process.env.mode === "dev" ? "/" : "/game-studio-landing-page/",
		dir: {
			input: "src",
			output: "docs"
		},
	};
}
