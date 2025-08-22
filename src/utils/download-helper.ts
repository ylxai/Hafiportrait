// Download helper utilities for handling CORS and external domains

export interface DownloadOptions {
  url: string;
  filename: string;
  onProgress?: (progress: number) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export class DownloadManager {
  private static allowedDomains = [
    '147.251.255.227:3002',
    'hafiportrait.photography',
    'localhost',
    '127.0.0.1'
  ];

  static isExternalDomain(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return !urlObj.hostname.includes(window.location.hostname);
    } catch {
      return false;
    }
  }

  static isAllowedDomain(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return this.allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.host === domain
      );
    } catch {
      return false;
    }
  }

  static async downloadImage({ url, filename, onProgress, onSuccess, onError }: DownloadOptions): Promise<void> {
    try {
      const isExternal = this.isExternalDomain(url);
      
      if (isExternal && this.isAllowedDomain(url)) {
        // Use proxy for external allowed domains
        await this.downloadViaProxy(url, filename, onProgress);
      } else if (!isExternal) {
        // Direct download for same domain
        await this.downloadDirect(url, filename, onProgress);
      } else {
        // Open in new tab for disallowed domains
        window.open(url, '_blank');
        return;
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Download failed:', error);
      onError?.(error as Error);
      // Final fallback
      window.open(url, '_blank');
    }
  }

  private static async downloadViaProxy(url: string, filename: string, onProgress?: (progress: number) => void): Promise<void> {
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Proxy download failed: ${response.status}`);
    }

    const blob = await this.streamToBlob(response, onProgress);
    this.triggerDownload(blob, filename);
  }

  private static async downloadDirect(url: string, filename: string, onProgress?: (progress: number) => void): Promise<void> {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Direct download failed: ${response.status}`);
    }

    const blob = await this.streamToBlob(response, onProgress);
    this.triggerDownload(blob, filename);
  }

  private static async streamToBlob(response: Response, onProgress?: (progress: number) => void): Promise<Blob> {
    const reader = response.body?.getReader();
    const contentLength = parseInt(response.headers.get('content-length') || '0');
    
    if (!reader) {
      return response.blob();
    }

    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      if (contentLength > 0 && onProgress) {
        const progress = (receivedLength / contentLength) * 100;
        onProgress(Math.round(progress));
      }
    }

    return new Blob(chunks);
  }

  private static triggerDownload(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}