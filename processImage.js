import { copyFileSync } from 'fs'
import { resolve } from 'path'
import S3Uploader from './S3Uploader.js'
import sizeOf from 'image-size'
import { getLastNPathSegments } from './utils.js'
import { getPlaiceholder } from 'plaiceholder'

const s3Uploader = new S3Uploader()

const processImage = async ({
	image,
	imageIndex,
	categoryInputFolderPath,
	categoryOutputFolderPath,
	categoryFolder,
	galleryFolder,
	galleryType,
}) => {
	// prepare image details
	const imagePath = resolve(categoryInputFolderPath, image)
	// const outputImageName = `img-${imageIndex + 1}.jpg`
	const outputImagePath = resolve(categoryOutputFolderPath, image)
	const s3ImagePath = `${galleryType}/${galleryFolder}/${categoryFolder}/${image}`
	const dimensions = sizeOf(imagePath)

	// calculate image aspect ratio and cap width / height

	const aspectRatio =
		Math.round((dimensions.width / dimensions.height) * 100) / 100
	let width, height
	if (aspectRatio < 1) {
		height = Math.min(1080, dimensions.height)
		width = height * aspectRatio
	} else {
		width = Math.min(1920, dimensions.width)
		height = width / aspectRatio
	}

	// get image blurred placeholder

	const { base64 } = await getPlaiceholder(
		getLastNPathSegments({ path: imagePath, n: 4 })
	)

	// copy image to output folder

	copyFileSync(imagePath, outputImagePath)

	let outputImage = {
		id: imageIndex,
		src: s3ImagePath,
		blurData: base64,
		aspectRatio,
		width,
		height,
	}

	// upload image

	await s3Uploader.upload({ filePath: imagePath, s3Path: s3ImagePath })

	return outputImage
}

export default processImage
