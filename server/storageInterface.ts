import { type Event, type InsertEvent, type Photo, type InsertPhoto, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  getEventByShareableLink(link: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  deleteEvent(id: string): Promise<void>;
  verifyEventAccessCode(eventId: string, accessCode: string): Promise<boolean>;

  // Photos
  addPhoto(photo: InsertPhoto): Promise<Photo>;
  getEventPhotos(eventId: string): Promise<Photo[]>;
  getPhotosByAlbum(eventId: string, albumName: string): Promise<Photo[]>;
  getTotalPhotosCount(): Promise<number>;
  updatePhotoLikes(photoId: string, likes: number): Promise<Photo | undefined>;
  getRecentPhotos(limit?: number): Promise<Photo[]>;
  deletePhoto(photoId: string): Promise<void>;

  // Messages
  addMessage(message: InsertMessage): Promise<Message>;
  getEventMessages(eventId: string): Promise<Message[]>;
  updateMessageHearts(messageId: string, hearts: number): Promise<Message | undefined>;
  getTotalMessagesCount(): Promise<number>;

  // Gallery methods
  addGalleryPhoto(category: string, photoData: any): Promise<any>;
  getGalleryPhotos(category?: string): Promise<any[]>;
  deleteGalleryPhoto(photoId: string): Promise<any>;

  // Pricing methods
  updatePricing(pricingData: any): Promise<any>;
  getPricing(): Promise<any>;
  uploadPricingPDF(pdfData: any): Promise<any>;
  
  // Admin methods
  getAdminStats(): Promise<any>;
} 