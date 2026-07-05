import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useState, useRef } from 'react';

// Comprehensive Socket.IO Manager for real-time communication
class SocketManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private queryClient: any = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private isAdmin = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.socket) {
      this.socket.disconnect();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socketUrl = `${protocol}//${window.location.host}`;

    this.socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket.IO: Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Join appropriate room based on current page
      if (window.location.pathname.includes('/admin')) {
        this.socket?.emit('join-admin');
        this.isAdmin = true;
      } else {
        this.socket?.emit('join-public');
        this.isAdmin = false;
        // Send page view analytics
        this.socket?.emit('page-view', {
          path: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: new Date()
        });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO: Disconnected from server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO: Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Socket.IO: Max reconnection attempts reached');
      }
    });

    // Real-time content update events
    this.socket.on('content-updated', (data) => {
      console.log('Socket.IO: Content updated:', data);
      this.handleContentUpdate(data);
    });

    this.socket.on('skills-updated', (data) => {
      console.log('Socket.IO: Skills updated:', data);
      this.invalidateCache(['/api/skills', '/api/skills-content']);
    });

    this.socket.on('projects-updated', (data) => {
      console.log('Socket.IO: Projects updated:', data);
      this.invalidateCache(['/api/projects', '/api/projects-content']);
    });

    this.socket.on('education-updated', (data) => {
      console.log('Socket.IO: Education updated:', data);
      this.invalidateCache(['/api/education', '/api/education-content']);
    });

    this.socket.on('experience-updated', (data) => {
      console.log('Socket.IO: Experience updated:', data);
      this.invalidateCache(['/api/experience', '/api/experience-content']);
    });

    this.socket.on('certifications-updated', (data) => {
      console.log('Socket.IO: Certifications updated:', data);
      this.invalidateCache(['/api/certifications', '/api/certifications-content']);
    });

    this.socket.on('blog-updated', (data) => {
      console.log('Socket.IO: Blog updated:', data);
      this.invalidateCache(['/api/blog']);
    });

    this.socket.on('contact-updated', (data) => {
      console.log('Socket.IO: Contact updated:', data);
      this.invalidateCache(['/api/contact-content']);
    });

    this.socket.on('about-updated', (data) => {
      console.log('Socket.IO: About updated:', data);
      this.invalidateCache(['/api/about']);
    });

    this.socket.on('hero-updated', (data) => {
      console.log('Socket.IO: Hero updated:', data);
      this.invalidateCache(['/api/hero']);
    });

    this.socket.on('footer-updated', (data) => {
      console.log('Socket.IO: Footer updated:', data);
      this.invalidateCache(['/api/footer']);
    });

    // Admin-specific events
    this.socket.on('admin-connected', (data) => {
      console.log('Socket.IO: Admin connected:', data);
    });

    this.socket.on('public-connected', (data) => {
      console.log('Socket.IO: Public connected:', data);
    });

    this.socket.on('admin-sync', (data) => {
      console.log('Socket.IO: Admin sync:', data);
      this.handleAdminSync(data);
    });

    this.socket.on('new-contact', (data) => {
      console.log('Socket.IO: New contact submission:', data);
      this.triggerEvent('new-contact', data);
      this.invalidateCache(['/api/contacts']);
    });

    this.socket.on('notification', (data) => {
      console.log('Socket.IO: Notification received:', data);
      this.triggerEvent('notification', data);
    });

    this.socket.on('user-typing', (data) => {
      console.log('Socket.IO: User typing:', data);
      this.triggerEvent('user-typing', data);
    });

    this.socket.on('user-stopped-typing', (data) => {
      console.log('Socket.IO: User stopped typing:', data);
      this.triggerEvent('user-stopped-typing', data);
    });

    this.socket.on('analytics-update', (data) => {
      console.log('Socket.IO: Analytics update:', data);
      this.triggerEvent('analytics-update', data);
    });

    this.socket.on('user-disconnected', (data) => {
      console.log('Socket.IO: User disconnected:', data);
      this.triggerEvent('user-disconnected', data);
    });
  }

  private invalidateCache(queryKeys: string[]) {
    if (!this.queryClient) return;
    queryKeys.forEach(key => {
      this.queryClient.invalidateQueries({ queryKey: [key] });
    });
  }

  private handleContentUpdate(data: { type: string; data: any }) {
    if (!this.queryClient) return;
    this.invalidateCache([data.type]);
  }

  private handleAdminSync(data: { type: string; data: any }) {
    if (!this.queryClient) return;
    this.invalidateCache([`/api/${data.type}`]);
  }

  private triggerEvent(eventName: string, data: any) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  // Public methods for managing Socket.IO
  setQueryClient(queryClient: any) {
    this.queryClient = queryClient;
  }

  joinAdminRoom() {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-admin');
      this.isAdmin = true;
    }
  }

  joinPublicRoom() {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-public');
      this.isAdmin = false;
      // Send page view analytics
      this.socket.emit('page-view', {
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date()
      });
    }
  }

  // Emit content updates from admin
  emitContentUpdate(type: string, data: any) {
    if (this.socket && this.isConnected && this.isAdmin) {
      this.socket.emit('content-update', { type, data });
    }
  }

  emitSkillsUpdate(data: any) {
    if (this.socket && this.isConnected && this.isAdmin) {
      this.socket.emit('skills-update', data);
    }
  }

  emitProjectsUpdate(data: any) {
    if (this.socket && this.isConnected && this.isAdmin) {
      this.socket.emit('projects-update', data);
    }
  }

  emitEducationUpdate(data: any) {
    if (this.socket && this.isConnected && this.isAdmin) {
      this.socket.emit('education-update', data);
    }
  }

  emitExperienceUpdate(data: any) {
    if (this.socket && this.isConnected && this.isAdmin) {
      this.socket.emit('experience-update', data);
    }
  }

  emitCertificationsUpdate(data: any) {
    if (this.socket && this.isConnected && this.isAdmin) {
      this.socket.emit('certifications-update', data);
    }
  }

  emitBlogUpdate(data: any) {
    if (this.socket && this.isConnected && this.isAdmin) {
      this.socket.emit('blog-update', data);
    }
  }

  emitContactUpdate(data: any) {
    if (this.socket && this.isConnected && this.isAdmin) {
      this.socket.emit('contact-update', data);
    }
  }

  emitAboutUpdate(data: any) {
    if (this.socket && this.isConnected && this.isAdmin) {
      this.socket.emit('about-update', data);
    }
  }

  emitHeroUpdate(data: any) {
    if (this.socket && this.isConnected && this.isAdmin) {
      this.socket.emit('hero-update', data);
    }
  }

  emitFooterUpdate(data: any) {
    if (this.socket && this.isConnected && this.isAdmin) {
      this.socket.emit('footer-update', data);
    }
  }

  // Contact form interactions
  emitNewContactSubmission(data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('new-contact-submission', data);
    }
  }

  startTyping(data: any) {
    if (this.socket && this.isConnected && !this.isAdmin) {
      this.socket.emit('typing-start', data);
    }
  }

  stopTyping(data: any) {
    if (this.socket && this.isConnected && !this.isAdmin) {
      this.socket.emit('typing-stop', data);
    }
  }

  // Notifications
  sendNotification(data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send-notification', data);
    }
  }

  // Event listener management
  addEventListener(eventName: string, callback: Function) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)?.push(callback);
  }

  removeEventListener(eventName: string, callback: Function) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Connection status
  isSocketConnected() {
    return this.isConnected;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  reconnect() {
    this.connect();
  }
}

// Create singleton instance
export const socketManager = new SocketManager();

// React hook for using Socket.IO
export const useSocket = () => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Set query client for cache invalidation
    socketManager.setQueryClient(queryClient);

    // Listen for connection status changes
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketManager.addEventListener('connect', handleConnect);
    socketManager.addEventListener('disconnect', handleDisconnect);

    // Update connection status
    setIsConnected(socketManager.isSocketConnected());

    return () => {
      socketManager.removeEventListener('connect', handleConnect);
      socketManager.removeEventListener('disconnect', handleDisconnect);
    };
  }, [queryClient]);

  const joinAdminRoom = useCallback(() => {
    socketManager.joinAdminRoom();
  }, []);

  const joinPublicRoom = useCallback(() => {
    socketManager.joinPublicRoom();
  }, []);

  const emitContentUpdate = useCallback((type: string, data: any) => {
    socketManager.emitContentUpdate(type, data);
  }, []);

  const emitSkillsUpdate = useCallback((data: any) => {
    socketManager.emitSkillsUpdate(data);
  }, []);

  const emitProjectsUpdate = useCallback((data: any) => {
    socketManager.emitProjectsUpdate(data);
  }, []);

  const emitEducationUpdate = useCallback((data: any) => {
    socketManager.emitEducationUpdate(data);
  }, []);

  const emitExperienceUpdate = useCallback((data: any) => {
    socketManager.emitExperienceUpdate(data);
  }, []);

  const emitCertificationsUpdate = useCallback((data: any) => {
    socketManager.emitCertificationsUpdate(data);
  }, []);

  const emitBlogUpdate = useCallback((data: any) => {
    socketManager.emitBlogUpdate(data);
  }, []);

  const emitContactUpdate = useCallback((data: any) => {
    socketManager.emitContactUpdate(data);
  }, []);

  const emitAboutUpdate = useCallback((data: any) => {
    socketManager.emitAboutUpdate(data);
  }, []);

  const emitHeroUpdate = useCallback((data: any) => {
    socketManager.emitHeroUpdate(data);
  }, []);

  const emitFooterUpdate = useCallback((data: any) => {
    socketManager.emitFooterUpdate(data);
  }, []);

  const emitNewContactSubmission = useCallback((data: any) => {
    socketManager.emitNewContactSubmission(data);
  }, []);

  const startTyping = useCallback((data: any) => {
    socketManager.startTyping(data);
  }, []);

  const stopTyping = useCallback((data: any) => {
    socketManager.stopTyping(data);
  }, []);

  const sendNotification = useCallback((data: any) => {
    socketManager.sendNotification(data);
  }, []);

  const addEventListener = useCallback((eventName: string, callback: Function) => {
    socketManager.addEventListener(eventName, callback);
  }, []);

  const removeEventListener = useCallback((eventName: string, callback: Function) => {
    socketManager.removeEventListener(eventName, callback);
  }, []);

  return {
    socket: socketManager,
    isConnected,
    joinAdminRoom,
    joinPublicRoom,
    emitContentUpdate,
    emitSkillsUpdate,
    emitProjectsUpdate,
    emitEducationUpdate,
    emitExperienceUpdate,
    emitCertificationsUpdate,
    emitBlogUpdate,
    emitContactUpdate,
    emitAboutUpdate,
    emitHeroUpdate,
    emitFooterUpdate,
    emitNewContactSubmission,
    startTyping,
    stopTyping,
    sendNotification,
    addEventListener,
    removeEventListener
  };
};