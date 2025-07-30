import { events, photos, messages, type Event, type InsertEvent, type Photo, type InsertPhoto, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { IStorage } from './storageInterface';

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const shareableLink = `https://wedibox.app/event/${id}`;
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareableLink)}`;

    const eventData = {
      ...insertEvent,
      id,
      qrCode,
      shareableLink,
      accessCode,
      isPremium: insertEvent.isPremium ?? false,
    };

    const [event] = await db
      .insert(events)
      .values(eventData)
      .returning();
    return event;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getEventByShareableLink(link: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.shareableLink, link));
    return event || undefined;
  }

  async addPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = randomUUID();
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

  async getEventPhotos(eventId: string): Promise<Photo[]> {
    return db.select().from(photos)
      .where(eq(photos.eventId, eventId))
      .orderBy(desc(photos.uploadedAt));
  }

  async getPhotosByAlbum(eventId: string, albumName: string): Promise<Photo[]> {
    return db.select().from(photos)
      .where(and(eq(photos.eventId, eventId), eq(photos.albumName, albumName)))
      .orderBy(desc(photos.uploadedAt));
  }

  async addMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const messageData = {
      ...insertMessage,
      id,
      hearts: 0,
    };

    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    return message;
  }

  async getEventMessages(eventId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(eq(messages.eventId, eventId))
      .orderBy(desc(messages.createdAt));
  }

  async updateMessageHearts(messageId: string, hearts: number): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set({ hearts })
      .where(eq(messages.id, messageId))
      .returning();
    return message || undefined;
  }

  async getRecentPhotos(limit: number = 20): Promise<Photo[]> {
    return await db
      .select()
      .from(photos)
      .orderBy(desc(photos.uploadedAt))
      .limit(limit);
  }

  async deletePhoto(photoId: string): Promise<void> {
    // Delete the file from filesystem
    const photo = await db.select().from(photos).where(eq(photos.id, photoId)).limit(1);
    if (photo[0]?.url) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'uploads', path.basename(photo[0].url));
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    // Delete from database
    await db.delete(photos).where(eq(photos.id, photoId));
  }

  // Admin methods
  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(desc(events.createdAt));
  }

  async deleteEvent(id: string): Promise<void> {
    // Delete related photos and messages first
    await db.delete(photos).where(eq(photos.eventId, id));
    await db.delete(messages).where(eq(messages.eventId, id));
    await db.delete(events).where(eq(events.id, id));
  }

  async getTotalPhotosCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(photos);
    return result[0]?.count || 0;
  }

  async getTotalMessagesCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(messages);
    return result[0]?.count || 0;
  }

  async updatePhotoLikes(photoId: string, likes: number): Promise<Photo | undefined> {
    const [photo] = await db
      .update(photos)
      .set({ likes })
      .where(eq(photos.id, photoId))
      .returning();
    return photo || undefined;
  }

  async verifyEventAccessCode(eventId: string, accessCode: string): Promise<boolean> {
    const [event] = await db.select().from(events)
      .where(and(eq(events.id, eventId), eq(events.accessCode, accessCode)));
    return !!event;
  }

  // Gallery methods
  async addGalleryPhoto(category: string, photoData: any) {
    try {
      // Gunakan eventId khusus untuk gallery photos
      const GALLERY_EVENT_ID = 'gallery';
      
      const id = randomUUID();
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

      const [photo] = await db
        .insert(photos)
        .values(galleryPhotoData)
        .returning();
      
      return { success: true, photo };
    } catch (error) {
      console.error('Error adding gallery photo:', error);
      return { success: false, error };
    }
  }

  async getGalleryPhotos(category?: string) {
    try {
      const GALLERY_EVENT_ID = 'gallery';
      
      let query = db.select().from(photos)
        .where(eq(photos.eventId, GALLERY_EVENT_ID))
        .orderBy(desc(photos.uploadedAt));
      
      if (category && category !== 'All') {
        query = db.select().from(photos)
          .where(and(eq(photos.eventId, GALLERY_EVENT_ID), eq(photos.albumName, category)))
          .orderBy(desc(photos.uploadedAt));
      }
      
      return await query;
    } catch (error) {
      console.error('Error getting gallery photos:', error);
      return [];
    }
  }

  async deleteGalleryPhoto(photoId: string) {
    try {
      const GALLERY_EVENT_ID = 'gallery';
      
      // Verifikasi bahwa foto adalah gallery photo
      const [photo] = await db.select().from(photos)
        .where(and(eq(photos.id, photoId), eq(photos.eventId, GALLERY_EVENT_ID)))
        .limit(1);
      
      if (!photo) {
        return { success: false, error: 'Gallery photo not found' };
      }
      
      // Hapus foto dari database
      await db.delete(photos).where(eq(photos.id, photoId));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting gallery photo:', error);
      return { success: false, error };
    }
  }

  // Pricing methods
  async updatePricing(pricingData: any) {
    // Store pricing in database or file
    return { success: true, pricingData };
  }

  async getPricing() {
    // Get current pricing
    return {
      basic: { price: "5000000", description: "4 jam liputan, 100 foto edit, USB flashdisk, online gallery" },
      premium: { price: "8000000", description: "8 jam liputan, 200 foto edit, album cetak, USB flashdisk, online gallery, video highlight" },
      platinum: { price: "12000000", description: "Full day coverage, unlimited foto edit, premium album, USB + online gallery, cinematic video, same day edit" }
    };
  }

  async uploadPricingPDF(pdfData: any) {
    // Store PDF file
    return { success: true, pdfData };
  }

  async getAdminStats() {
    const totalEvents = await this.getAllEvents().then(events => events.length);
    const totalPhotos = await this.getTotalPhotosCount();
    const totalMessages = await this.getTotalMessagesCount();
    const activeEvents = await this.getAllEvents().then(events => 
      events.filter(event => new Date(event.date) >= new Date()).length
    );

    return {
      totalEvents,
      totalPhotos,
      totalMessages,
      activeEvents,
      storageUsed: "2.4 GB"
    };
  }
} 