const imageKit = require("@imagekit/nodejs");
const logger = require('../utils/logger');

const imagekit = new imageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});


async function uploadFile(buffer) {
    try {
        const response = await imagekit.files.upload({
            file: buffer.toString('base64'),
            fileName: `blog_${Date.now()}.jpg`
        });
        logger.info("ImageKit upload success", { fileName: response.name });
        return response;
    } catch (error) {
        logger.error("ImageKit upload error", { error: error.message });
        throw error;
    }
}

module.exports = uploadFile;