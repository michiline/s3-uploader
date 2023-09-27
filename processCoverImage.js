import { copyFileSync } from 'fs'
import { resolve } from 'path'
import S3Uploader from './S3Uploader.js'
import { getLastNPathSegments } from './utils.js'
import { getPlaiceholder } from 'plaiceholder'

const s3Uploader = new S3Uploader()

const processImage = async ({
	image,
	galleryInputFolderPath,
	galleryOutputFolderPath,
	galleryFolder,
	galleryType,
}) => {
	// prepare image details
	const imagePath = resolve(galleryInputFolderPath, image)
	const outputImagePath = resolve(galleryOutputFolderPath, image)
	const s3ImagePath = `${galleryType}/${galleryFolder}/${image}`

	// get image blurred placeholder

	const { base64 } = await getPlaiceholder(
		getLastNPathSegments({ path: imagePath, n: 3 })
	)

	// copy image to output folder

	copyFileSync(imagePath, outputImagePath)

	let outputImage = {
		src: s3ImagePath,
		blurData: base64,
	}

	// upload image

	await s3Uploader.upload({ filePath: imagePath, s3Path: s3ImagePath })

	return outputImage
}

export default processImage
