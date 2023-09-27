import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import processCategory from './processCategory.js'
import processCoverImage from './processCoverImage.js'
import processOgImage from './processOgImage.js'

const processGallery = async ({
	galleryFolder,
	galleryIndex,
	totalGalleryNum,
	galleryType,
	rootInputFolderPath,
	rootOutputFolderPath,
}) => {
	// prepare input/output folder paths

	const galleryInputFolderPath = resolve(rootInputFolderPath, galleryFolder)
	const galleryOutputFolderPath = resolve(rootOutputFolderPath, galleryFolder)

	// prepare category folder list

	const folderContent = readdirSync(galleryInputFolderPath)

	const categoryFolders = folderContent.filter(
		(elem) =>
			!elem.startsWith('.') &&
			elem !== 'cover.jpg' &&
			elem !== 'cover-mobile.jpg'
	)

	// check if cover image exists

	if (!folderContent.includes('cover.jpg')) {
		console.log(`ERROR: no cover image for ${galleryFolder} found`)
		return
	}

	// create output folder

	mkdirSync(galleryOutputFolderPath)

	// iterate over each category folder

	console.log(
		`\n*** Processing gallery - ${galleryIndex}/${totalGalleryNum} - ${galleryFolder}\n`
	)

	const categories = []

	for (const [index, categoryFolder] of categoryFolders.entries()) {
		const categoryImages = await processCategory({
			galleryFolder,
			categoryFolder,
			categoryIndex: index + 1,
			totalCategoryNum: categoryFolders.length,
			galleryType,
			galleryInputFolderPath,
			galleryOutputFolderPath,
		})
		categories.push({
			categoryId: categoryFolder,
			images: categoryImages,
		})
	}

	// upload cover images

	console.log(`\n*** Processing cover images\n`)

	const cover = await processCoverImage({
		image: 'cover.jpg',
		galleryInputFolderPath,
		galleryOutputFolderPath,
		galleryFolder,
		galleryType,
	})

	let coverMobile

	if (existsSync(resolve(galleryInputFolderPath, 'cover-mobile.jpg'))) {
		coverMobile = await processCoverImage({
			image: 'cover-mobile.jpg',
			galleryInputFolderPath,
			galleryOutputFolderPath,
			galleryFolder,
			galleryType,
		})
	} else {
		coverMobile = cover
	}

	// process cover image for OG image

	const ogImage = await processOgImage({
		image: 'cover.jpg',
		galleryInputFolderPath,
		galleryOutputFolderPath,
		galleryFolder,
		galleryType,
	})

	const output = {
		galleryId: galleryFolder,
		categories,
		cover: {
			web: cover,
			mobile: coverMobile,
		},
		og: ogImage,
	}
	const outputJsonPath = resolve(
		rootOutputFolderPath,
		`${galleryFolder}.json`
	)
	writeFileSync(outputJsonPath, JSON.stringify(output))
}

export default processGallery
