import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertPhotoSchema, insertMessageSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";

// Upload middleware - menggunakan memory storage karena file langsung ke Supabase
const upload = multer({ 
  storage: multer.memoryStorage(), // Store dalam memory, tidak perlu file sementara
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create event
  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data", error });
    }
  });

  // Get event by ID
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Upload photo
  app.post("/api/events/:eventId/photos", upload.single('photo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filename = `${randomUUID()}${path.extname(req.file.originalname)}`;
      
      // Menggunakan buffer langsung dari memory storage
      const fileBuffer = req.file.buffer;
      
      // Membuat data foto dengan URL temporer
      // URL akan diperbarui di dalam metode addPhoto
      const photoData = {
        eventId: req.params.eventId,
        filename: filename,
        originalName: req.file.originalname,
        url: `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`, // Base64 data untuk diupload ke Supabase
        uploaderName: req.body.uploaderName || "Anonymous",
        albumName: req.body.albumName || "Main",
      };

      const validatedData = insertPhotoSchema.parse(photoData);
      const photo = await storage.addPhoto(validatedData);
      
      // Tidak perlu hapus file karena menggunakan memory storage
      
      res.json(photo);
    } catch (error) {
      res.status(400).json({ message: "Failed to upload photo", error });
    }
  });

  // Get event photos
  app.get("/api/events/:eventId/photos", async (req, res) => {
    try {
      const photos = await storage.getEventPhotos(req.params.eventId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Get photos by album
  app.get("/api/events/:eventId/albums/:albumName/photos", async (req, res) => {
    try {
      const photos = await storage.getPhotosByAlbum(req.params.eventId, req.params.albumName);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Add message
  app.post("/api/events/:eventId/messages", async (req, res) => {
    try {
      const messageData = {
        eventId: req.params.eventId,
        guestName: req.body.guestName,
        message: req.body.message,
      };

      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.addMessage(validatedData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Failed to add message", error });
    }
  });

  // Get event messages
  app.get("/api/events/:eventId/messages", async (req, res) => {
    try {
      const messages = await storage.getEventMessages(req.params.eventId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Update message hearts
  app.patch("/api/messages/:messageId/hearts", async (req, res) => {
    try {
      const { hearts } = req.body;
      const message = await storage.updateMessageHearts(req.params.messageId, hearts);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Verify event access code
  app.post("/api/events/:eventId/verify-code", async (req, res) => {
    try {
      const { accessCode } = req.body;
      const isValid = await storage.verifyEventAccessCode(req.params.eventId, accessCode);
      res.json({ valid: isValid });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Update photo likes
  app.patch("/api/photos/:photoId/likes", async (req, res) => {
    try {
      const { likes } = req.body;
      const photo = await storage.updatePhotoLikes(req.params.photoId, likes);
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      res.json(photo);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Gallery routes
  app.post("/api/admin/gallery", upload.single('photo'), async (req, res) => {
    try {
      console.log('Gallery upload request received:', {
        hasFile: !!req.file,
        body: req.body,
        file: req.file ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : null
      });

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filename = `gallery_${randomUUID()}${path.extname(req.file.originalname)}`;
      
      // Menggunakan buffer langsung dari memory storage
      const fileBuffer = req.file.buffer;
      
      // Buat data foto untuk gallery
      const photoData = {
        filename: filename,
        originalName: req.file.originalname,
        url: `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`, // Base64 data untuk diupload ke Supabase
      };

      const category = req.body.category || "Gallery";
      console.log('Calling storage.addGalleryPhoto with category:', category);
      
      const result = await storage.addGalleryPhoto(category, photoData);
      console.log('Storage result:', result);
      
      // Tidak perlu hapus file karena menggunakan memory storage
      
      res.json(result);
    } catch (error) {
      console.error('Gallery upload error:', error);
      res.status(500).json({ 
        message: "Server error", 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.get("/api/admin/gallery/:category?", async (req, res) => {
    try {
      const photos = await storage.getGalleryPhotos(req.params.category);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.delete("/api/admin/gallery/:photoId", async (req, res) => {
    try {
      const result = await storage.deleteGalleryPhoto(req.params.photoId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Pricing routes
  app.get("/api/admin/pricing", async (req, res) => {
    try {
      const pricing = await storage.getPricing();
      res.json(pricing);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/admin/pricing", async (req, res) => {
    try {
      const result = await storage.updatePricing(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/admin/pricing/pdf", upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded" });
      }

      const result = await storage.uploadPricingPDF({
        filename: `pricing_${randomUUID()}${path.extname(req.file.originalname)}`,
        originalName: req.file.originalname,
        buffer: req.file.buffer, // Menggunakan buffer dari memory storage
        size: req.file.size
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Get recent photos for admin
  app.get("/api/admin/recent-photos", async (req, res) => {
    try {
      const photos = await storage.getRecentPhotos(20); // Get last 20 photos
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Delete photo by admin
  app.delete("/api/admin/photos/:photoId", async (req, res) => {
    try {
      await storage.deletePhoto(req.params.photoId);
      res.json({ message: "Photo deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get("/api/admin/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.delete("/api/admin/events/:id", async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Serve uploaded files - tidak lagi diperlukan, semua file akan diambil dari Supabase
  // app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}