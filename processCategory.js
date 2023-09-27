import { mkdirSync, readdirSync } from 'fs'
import { resolve } from 'path'
import processImage from './processImage.js'

const processCategory = async ({
	galleryFolder,
	categoryFolder,
	categoryIndex,
	totalCategoryNum,
	galleryType,
	galleryInputFolderPath,
	galleryOutputFolderPath,
}) => {
	// prepare input/output folder paths

	const categoryInputFolderPath = resolve(
		galleryInputFolderPath,
		categoryFolder
	)
	const categoryOutputFolderPath = resolve(
		galleryOutputFolderPath,
		categoryFolder
	)

	// create output folder

	mkdirSync(categoryOutputFolderPath)

	console.log(
		`\n*** Processing category # ${categoryIndex}/${totalCategoryNum} - ${categoryFolder}/${galleryFolder}\n`
	)

	// prepare image list

	const images = readdirSync(categoryInputFolderPath)
		.filter((file) => {
			return !file.startsWith('.')
		})
		.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

	// upload images

	let categoryImages = []

	for (const [imageIndex, image] of images.entries()) {
		console.log(
			`-- ${imageIndex + 1}/${
				images.length
			} - ${categoryIndex}/${totalCategoryNum} - ${categoryFolder}/${galleryFolder}`
		)
		const outputImage = await processImage({
			image,
			imageIndex,
			categoryInputFolderPath,
			categoryOutputFolderPath,
			categoryFolder,
			galleryFolder,
			galleryType,
		})

		categoryImages.push(outputImage)
	}
	return categoryImages
}

export default processCategory
