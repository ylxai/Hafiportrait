import { events, photos, messages, type Event, type InsertEvent, type Photo, type InsertPhoto, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { IStorage } from './storageInterface';

export class MemStorage implements IStorage {
  private events: Map<string, Event>;
  private photos: Map<string, Photo>;
  private messages: Map<string, Message>;

  constructor() {
    this.events = new Map();
    this.photos = new Map();
    this.messages = new Map();
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const shareableLink = `https://wedibox.app/event/${id}`;
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareableLink)}`;

    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const event: Event = {
      ...insertEvent,
      id,
      qrCode,
      shareableLink,
      accessCode,
      isPremium: insertEvent.isPremium ?? false,
      createdAt: new Date(),
    };

    this.events.set(id, event);
    return event;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventByShareableLink(link: string): Promise<Event | undefined> {
    return Array.from(this.events.values()).find(event => event.shareableLink === link);
  }

  async addPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = randomUUID();
    const photo: Photo = {
      ...insertPhoto,
      id,
      albumName: insertPhoto.albumName ?? "Tamu",
      uploaderName: insertPhoto.uploaderName ?? null,
      uploadedAt: new Date(),
      likes: 0,
    };

    this.photos.set(id, photo);
    return photo;
  }

  async getEventPhotos(eventId: string): Promise<Photo[]> {
    return Array.from(this.photos.values())
      .filter(photo => photo.eventId === eventId)
      .sort((a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime());
  }

  async getPhotosByAlbum(eventId: string, albumName: string): Promise<Photo[]> {
    return Array.from(this.photos.values())
      .filter(photo => photo.eventId === eventId && photo.albumName === albumName)
      .sort((a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime());
  }

  async addMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      hearts: 0,
      createdAt: new Date(),
    };

    this.messages.set(id, message);
    return message;
  }

  async getEventMessages(eventId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.eventId === eventId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async updateMessageHearts(messageId: string, hearts: number): Promise<Message | undefined> {
    const message = this.messages.get(messageId);
    if (message) {
      const updated = { ...message, hearts };
      this.messages.set(messageId, updated);
      return updated;
    }
    return undefined;
  }

  // Admin methods for MemStorage
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async deleteEvent(id: string): Promise<void> {
    this.events.delete(id);
    // Delete related photos and messages
    Array.from(this.photos.entries()).forEach(([photoId, photo]) => {
      if (photo.eventId === id) {
        this.photos.delete(photoId);
      }
    });
    Array.from(this.messages.entries()).forEach(([messageId, message]) => {
      if (message.eventId === id) {
        this.messages.delete(messageId);
      }
    });
  }

  async getTotalPhotosCount(): Promise<number> {
    return this.photos.size;
  }

  async getTotalMessagesCount(): Promise<number> {
    return this.messages.size;
  }

  async updatePhotoLikes(photoId: string, likes: number): Promise<Photo | undefined> {
    const photo = this.photos.get(photoId);
    if (photo) {
      const updated = { ...photo, likes };
      this.photos.set(photoId, updated);
      return updated;
    }
    return undefined;
  }

  async verifyEventAccessCode(eventId: string, accessCode: string): Promise<boolean> {
    const event = this.events.get(eventId);
    return event ? event.accessCode === accessCode : false;
  }

  // Stub implementations for methods that MemStorage doesn't fully implement
  async getRecentPhotos(limit: number = 20): Promise<Photo[]> {
    return [];
  }

  async deletePhoto(photoId: string): Promise<void> {
    this.photos.delete(photoId);
  }

  async addGalleryPhoto(category: string, photoData: any) {
    return { success: true, photoData };
  }

  async getGalleryPhotos(category?: string) {
    return [];
  }

  async deleteGalleryPhoto(photoId: string) {
    return { success: true };
  }

  async updatePricing(pricingData: any) {
    return { success: true, pricingData };
  }

  async getPricing() {
    return {
      basic: { price: "5000000", description: "4 jam liputan, 100 foto edit, USB flashdisk, online gallery" },
      premium: { price: "8000000", description: "8 jam liputan, 200 foto edit, album cetak, USB flashdisk, online gallery, video highlight" },
      platinum: { price: "12000000", description: "Full day coverage, unlimited foto edit, premium album, USB + online gallery, cinematic video, same day edit" }
    };
  }

  async uploadPricingPDF(pdfData: any) {
    return { success: true, pdfData };
  }

  async getAdminStats() {
    return {
      totalEvents: this.events.size,
      totalPhotos: this.photos.size,
      totalMessages: this.messages.size,
      activeEvents: Array.from(this.events.values()).filter(event => new Date(event.date) >= new Date()).length,
      storageUsed: "0 KB"
    };
  }
}

// Database storage implementation
import { DatabaseStorage } from './databaseStorage';

// Use SupabaseStorage instead of DatabaseStorage
// Import the actual implementation from separate file to avoid circular dependency
import { SupabaseStorage } from './supabaseStorage';
export const storage = new SupabaseStorage();