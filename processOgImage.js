import { compressImage } from './utils.js'
import { resolve } from 'path'
import S3Uploader from './S3Uploader.js'

const s3Uploader = new S3Uploader()

const processOgImage = async ({
	image,
	galleryInputFolderPath,
	galleryOutputFolderPath,
	galleryFolder,
	galleryType,
}) => {
	const inputImagePath = resolve(galleryInputFolderPath, image)
	const outputImagePath = resolve(galleryOutputFolderPath, 'og.jpg')
	const s3ImagePath = `${galleryType}/${galleryFolder}/og.jpg`

	// upload image

	await compressImage({ inputImagePath, outputImagePath, targetSizeKB: 300 })

	await s3Uploader.upload({ filePath: outputImagePath, s3Path: s3ImagePath })
	return {
		src: s3ImagePath,
		width: 320,
		height: 213,
		alt: 'Photo gallery cover image',
	}
}

export default processOgImage
