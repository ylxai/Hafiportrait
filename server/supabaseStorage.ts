import { events, photos, messages, type Photo, type InsertPhoto } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { supabase, supabaseAdmin, PHOTOS_BUCKET, uploadToS3, deleteFromS3 } from "./supabase";
import { DatabaseStorage } from "./databaseStorage";
import { IStorage } from "./storageInterface";

export class SupabaseStorage extends DatabaseStorage implements IStorage {
  // Override method untuk menambahkan foto - menggunakan Supabase Storage alih-alih file sistem lokal
  async addPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = randomUUID();
    
    // Jika URL adalah base64, maka ini adalah upload langsung dari frontend
    if (insertPhoto.url && insertPhoto.url.startsWith('data:')) {
      // Ekstrak tipe data dan base64 data
      const matches = insertPhoto.url.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Format data URL tidak valid');
      }

      const contentType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      // Upload ke Supabase Storage via S3 API
      const filePath = `${insertPhoto.eventId}/${insertPhoto.filename || `${id}.${this.getExtensionFromMime(contentType)}`}`;
      
      const uploadResult = await uploadToS3(filePath, buffer, contentType);

      if (!uploadResult.success) {
        throw new Error('Error uploading to Supabase S3');
      }

      // Set public URL dari S3 upload
      insertPhoto.url = uploadResult.publicUrl;
    }

    // Simpan metadata foto ke database
    const photoData = {
      ...insertPhoto,
      id,
      albumName: insertPhoto.albumName ?? "Tamu",
      uploaderName: insertPhoto.uploaderName ?? null,
      likes: 0,
    };

    const [photo] = await db
      .insert(photos)
      .values(photoData)
      .returning();
    
    return photo;
  }

  // Override method untuk menghapus foto - menghapus dari Supabase Storage
  async deletePhoto(photoId: string): Promise<void> {
    // Dapatkan data foto dari database
    const [photo] = await db.select().from(photos).where(eq(photos.id, photoId)).limit(1);
    
    if (photo?.url) {
      try {
        // Ekstrak path file dari URL publik
        const fileUrl = new URL(photo.url);
        const pathParts = fileUrl.pathname.split('/');
        const filePath = pathParts.slice(pathParts.indexOf(PHOTOS_BUCKET) + 1).join('/');
        
        // Hapus file dari Supabase Storage via S3 API
        await deleteFromS3(filePath);
      } catch (error) {
        console.error('Error parsing URL foto:', error);
      }
    }

    // Hapus data dari database
    await db.delete(photos).where(eq(photos.id, photoId));
  }

  // Override method untuk menghapus event - hapus semua foto yang terkait dari Supabase Storage
  async deleteEvent(id: string): Promise<void> {
    // Dapatkan semua foto event
    const eventPhotos = await this.getEventPhotos(id);
    
    // Hapus semua foto dari Supabase Storage
    for (const photo of eventPhotos) {
      await this.deletePhoto(photo.id);
    }

    // Hapus data event dari database
    await db.delete(messages).where(eq(messages.eventId, id));
    await db.delete(events).where(eq(events.id, id));
  }

  // Override method untuk gallery photos - menggunakan Supabase Storage
  async addGalleryPhoto(category: string, photoData: any) {
    try {
      console.log('SupabaseStorage.addGalleryPhoto called:', { category, photoDataKeys: Object.keys(photoData) });
      
      const GALLERY_EVENT_ID = 'gallery';
      const id = randomUUID();
      
      // Jika URL adalah base64, upload ke Supabase Storage
      if (photoData.url && photoData.url.startsWith('data:')) {
        console.log('Processing base64 data for Supabase upload');
        
        const matches = photoData.url.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          throw new Error('Format data URL tidak valid');
        }

        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        console.log('Buffer created, size:', buffer.length);

        // Upload ke Supabase Storage via S3 API dengan path khusus gallery
        const filePath = `gallery/${category}/${photoData.filename || `${id}.${this.getExtensionFromMime(contentType)}`}`;
        console.log('Uploading to Supabase S3 at path:', filePath);
        
        const uploadResult = await uploadToS3(filePath, buffer, contentType);

        if (!uploadResult.success) {
          throw new Error('Error uploading to Supabase S3');
        }

        console.log('Supabase S3 upload successful');

        // Set public URL dari S3 upload
        photoData.url = uploadResult.publicUrl;
        console.log('Public URL obtained:', uploadResult.publicUrl);
      }

      // Simpan metadata foto ke database
      const galleryPhotoData = {
        id,
        eventId: GALLERY_EVENT_ID,
        filename: photoData.filename || `gallery_${id}`,
        originalName: photoData.originalName || photoData.filename,
        url: photoData.url,
        uploaderName: "Admin",
        albumName: category || "Gallery",
        likes: 0,
      };

      console.log('Inserting photo metadata to database:', galleryPhotoData);

      const [photo] = await db
        .insert(photos)
        .values(galleryPhotoData)
        .returning();
      
      console.log('Database insert successful:', photo);
      
      return { success: true, photo };
    } catch (error) {
      console.error('Error adding gallery photo:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Override method untuk menghapus gallery photo dari Supabase Storage
  async deleteGalleryPhoto(photoId: string) {
    try {
      const GALLERY_EVENT_ID = 'gallery';
      
      // Dapatkan data foto dari database
      const [photo] = await db.select().from(photos)
        .where(and(eq(photos.id, photoId), eq(photos.eventId, GALLERY_EVENT_ID)))
        .limit(1);
      
      if (!photo) {
        return { success: false, error: 'Gallery photo not found' };
      }

      // Hapus file dari Supabase Storage
      if (photo.url) {
        try {
          const fileUrl = new URL(photo.url);
          const pathParts = fileUrl.pathname.split('/');
          const filePath = pathParts.slice(pathParts.indexOf(PHOTOS_BUCKET) + 1).join('/');
          
          await deleteFromS3(filePath);
        } catch (error) {
          console.error('Error parsing URL foto:', error);
        }
      }
      
      // Hapus foto dari database
      await db.delete(photos).where(eq(photos.id, photoId));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting gallery photo:', error);
      return { success: false, error };
    }
  }

  // Utility function untuk mendapatkan ekstensi file dari MIME type
  private getExtensionFromMime(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg'
    };
    return map[mime] || 'jpg';
  }
} 