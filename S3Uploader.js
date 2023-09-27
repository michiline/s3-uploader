import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { createReadStream } from 'fs'

const AWS_BUCKET = process.env.AWS_BUCKET_GALLERY
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID_GALLERY
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY_GALLERY

class S3Uploader {
	constructor() {
		this.s3Client = new S3Client({
			region: 'eu-central-1',
			credentials: {
				accessKeyId: AWS_ACCESS_KEY,
				secretAccessKey: AWS_SECRET_ACCESS_KEY,
			},
		})
	}

	async upload({ filePath, s3Path, contentType = 'image/jpeg' }) {
		const uploadParams = {
			Bucket: AWS_BUCKET,
			Key: s3Path,
			Body: createReadStream(filePath),
			ContentType: contentType,
		}

		const upload = new Upload({
			client: this.s3Client,
			leavePartsOnError: false,
			params: uploadParams,
		})

		const fileName = filePath.split('/').slice(-2).join('/')
		const s3FileName = s3Path.split('/').slice(-2).join('/')
		console.log(`-- Uploading ${fileName} as ${s3FileName}`)
		await upload.done()
	}
}

export default S3Uploader
