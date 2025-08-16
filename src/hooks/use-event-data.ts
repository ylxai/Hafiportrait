'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event, Photo, Message, MessageReactions } from "@/lib/database";

export function useEventData(eventId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['/api/events', eventId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/events/${eventId}`);
      return response.json() as Promise<Event>;
    },
    enabled: !!eventId,
  });

  // Fetch event photos
  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['/api/events', eventId, 'photos'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/events/${eventId}/photos`);
      return response.json() as Promise<Photo[]>;
    },
    enabled: !!eventId,
  });

  // Fetch event messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/events', eventId, 'messages'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/events/${eventId}/messages`);
      return response.json() as Promise<Message[]>;
    },
    enabled: !!eventId,
  });

  // Verify access code mutation
  const verifyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", `/api/events/${eventId}/verify-code`, { accessCode: code });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Kode Akses Benar!",
        description: "Anda sekarang dapat mengupload foto.",
      });
    },
    onError: () => {
      toast({
        title: "Kode Salah",
        description: "Silakan periksa kembali kode akses Anda.",
        variant: "destructive",
      });
    },
  });

  return {
    event,
    photos,
    messages,
    eventLoading,
    photosLoading,
    messagesLoading,
    verifyCodeMutation,
    queryClient,
  };
}