import dotenv from 'dotenv'
import { readdirSync } from 'fs'
import { parseArguments, getRootFolders, manageOutputFolder } from './utils.js'
import processGallery from './processGallery.js'

dotenv.config()

// parse arguments

let { folder, type } = parseArguments()
type = type || 'clients' // If type is not defined, default to 'clients'

// prepare root input and output folder paths

const { rootInputFolderPath, rootOutputFolderPath } = getRootFolders(
	import.meta.url,
	folder
)

// delete old and create new output folder

manageOutputFolder(rootOutputFolderPath)

// remove hidden files from the folder list

const galleryFolders = readdirSync(rootInputFolderPath).filter(
	(elem) => !elem.startsWith('.')
)

// iterate over each gallery folder

for (const [index, galleryFolder] of galleryFolders.entries()) {
	await processGallery({
		galleryFolder,
		galleryIndex: index + 1,
		totalGalleryNum: galleryFolders.length,
		galleryType: type,
		rootInputFolderPath,
		rootOutputFolderPath,
	})
}
