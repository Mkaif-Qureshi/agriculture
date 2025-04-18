import User from '../models/user.model.js';

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            username,
            bio,
            email,
            gender,
            phoneNo,
            profilePic,
            role,
            location
        } = req.body;

        // Add a check for valid userId
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized - No user ID' });
        }

        // Find user in database and update
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update fields
        if (username) user.username = username;
        if (bio !== undefined) user.bio = bio;
        if (email) user.email = email;
        if (gender) user.gender = gender;
        if (phoneNo) user.phoneNo = phoneNo;
        if (profilePic) user.profilePic = profilePic;
        if (role) user.role = role;
        
        // Update location if provided
        if (location) {
            user.location = {
                address: location.address || user.location?.address || '',
                city: location.city || user.location?.city || '',
                state: location.state || user.location?.state || '',
                country: location.country || user.location?.country || '',
                pincode: location.pincode || user.location?.pincode || ''
            };
        }

        // Save updated user
        await user.save();

        // Return updated user data
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                username: user.username,
                bio: user.bio,
                email: user.email,
                gender: user.gender,
                phoneNo: user.phoneNo,
                profilePic: user.profilePic,
                role: user.role,
                location: user.location
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};
