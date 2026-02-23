import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_BUCKET || 'student-photos';

let supabase = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-')) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('📸 Supabase Storage initialized');
} else {
    console.log('📸 Supabase Storage not configured — photo uploads will use local storage');
}

/**
 * Upload a file to Supabase Storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - Unique file name
 * @param {string} mimeType - File MIME type
 * @returns {Promise<{url: string|null, error: string|null}>}
 */
export const uploadPhoto = async (fileBuffer, fileName, mimeType) => {
    if (!supabase) {
        return { url: null, error: 'Supabase not configured' };
    }

    try {
        const filePath = `students/${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, fileBuffer, {
                contentType: mimeType,
                upsert: true,
            });

        if (error) {
            console.error('📸 Supabase upload error:', error.message);
            return { url: null, error: error.message };
        }

        // Get public URL
        const { data: publicData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        console.log('📸 Photo uploaded to Supabase:', publicData.publicUrl);
        return { url: publicData.publicUrl, error: null };
    } catch (err) {
        console.error('📸 Storage error:', err.message);
        return { url: null, error: err.message };
    }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} photoUrl - The full public URL of the photo
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const deletePhoto = async (photoUrl) => {
    if (!supabase || !photoUrl) {
        return { success: false, error: 'Supabase not configured or no URL' };
    }

    try {
        // Extract file path from URL
        // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/students/filename.ext
        const urlParts = photoUrl.split(`/storage/v1/object/public/${bucketName}/`);
        if (urlParts.length < 2) {
            return { success: false, error: 'Could not parse photo URL' };
        }

        const filePath = urlParts[1];

        const { error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

        if (error) {
            console.error('📸 Supabase delete error:', error.message);
            return { success: false, error: error.message };
        }

        console.log('📸 Photo deleted from Supabase:', filePath);
        return { success: true, error: null };
    } catch (err) {
        console.error('📸 Storage delete error:', err.message);
        return { success: false, error: err.message };
    }
};

export const isSupabaseConfigured = () => !!supabase;
