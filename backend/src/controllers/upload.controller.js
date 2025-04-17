import { v2 as cloudinary } from 'cloudinary';

export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        const fileStr = req.file.buffer.toString('base64');
        const fileType = req.file.mimetype;
        
        const uploadResponse = await cloudinary.uploader.upload(
            `data:${fileType};base64,${fileStr}`,
            {
                folder: 'profile_pictures',
                resource_type: 'image',
                transformation: [
                    { width: 400, height: 400, crop: 'fill' },
                    { quality: 'auto' }
                ]
            }
        );

        res.status(200).json({
            success: true,
            imageUrl: uploadResponse.secure_url,
            publicId: uploadResponse.public_id
        });
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
};
