import dotenv from 'dotenv'
import { parseArgs } from 'util'
import AdmZip from 'adm-zip'
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

dotenv.config()

export const parseArguments = () => {
	const {
		values: { folder, type },
	} = parseArgs({
		options: {
			folder: {
				type: 'string',
				short: 'f',
			},
			type: {
				type: 'string',
				short: 't',
			},
		},
	})
	return { folder, type }
}

export function getRootFolders(importMetaUrl, folder) {
	const __filename = fileURLToPath(importMetaUrl)
	const __dirname = dirname(__filename)
	const rootInputFolderPath = resolve(__dirname, 'public', folder)
	const rootOutputFolderPath = resolve(__dirname, 'output', folder)
	return { rootInputFolderPath, rootOutputFolderPath }
}

export function manageOutputFolder(rootOutputFolderPath) {
	if (existsSync(rootOutputFolderPath)) {
		rmSync(rootOutputFolderPath, { recursive: true, force: true })
	}
	mkdirSync(rootOutputFolderPath)
}

export const getLastNPathSegments = ({ path, n }) => {
	const pathSegments = path.split('/')
	const lastNSegments = pathSegments.slice(-n)
	return '/' + lastNSegments.join('/')
}

export const zipDirectory = (source, out) => {
	try {
		const zip = new AdmZip()
		zip.addLocalFolder(source)
		zip.writeZip(out)
	} catch (err) {
		console.error(`Something went wrong with zipping. ${err}`)
	}
}

export const compressImage = async ({
	inputImagePath,
	outputImagePath,
	targetSizeKB,
}) => {
	try {
		// Read the file
		const inputBuffer = readFileSync(inputImagePath)

		let quality = 90 // Start with 90% quality
		let compressedBuffer = await sharp(inputBuffer)
			.jpeg({ quality })
			.toBuffer()

		// Check if the compressed image size is under the target size in KB
		while (compressedBuffer.length > targetSizeKB * 1024 && quality > 10) {
			quality -= 5 // Reduce quality by 5% increments
			compressedBuffer = await sharp(inputBuffer)
				.jpeg({ quality })
				.toBuffer()
		}

		// Save the compressed image
		writeFileSync(outputImagePath, compressedBuffer)
	} catch (err) {
		console.error(`Error compressing image: ${err}`)
	}
}
