const cloudinary = require("cloudinary").v2;

function requireEnv(name) {
    if (!process.env[name]) throw new Error(`Missing ${name} in .env`);
    return process.env[name];
}

cloudinary.config({
    cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: requireEnv("CLOUDINARY_API_KEY"),
    api_secret: requireEnv("CLOUDINARY_API_SECRET"),
});

async function uploadToCloudinaryFromUpload(upload, folder = "comp3133_assignment1") {
  // upload is a GraphQL Upload -> has createReadStream()
    const { createReadStream, filename } = await upload;

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
        {
            folder,
            resource_type: "image",
            public_id: filename.replace(/\.[^/.]+$/, ""), // filename without extension
        },
        (err, result) => {
            if (err) return reject(err);
            resolve(result); // result.secure_url etc.
        }
        );

        createReadStream().pipe(stream);
    });
}

module.exports = {
    uploadToCloudinaryFromUpload,
};
