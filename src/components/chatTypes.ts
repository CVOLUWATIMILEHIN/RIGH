export interface ChatSettings {
  id: string;
  whatsappNumber: string;
  whatsappMessage: string;
  whatsappEnabled: boolean;
  liveChatEnabled: boolean;
  officeHours: string;
  autoReplyMessage: string;
  chatPosition: "bottom-right" | "bottom-left";
  chatTheme: string;
  companyLogo?: string;
  supportEmail: string;
  adminStatus: "online" | "away" | "busy" | "offline";
}

export interface ChatConversation {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  createdAt: string;
  lastMessageAt: string;
  lastMessageText: string;
  status: "active" | "closed" | "resolved";
  assignedAdmin?: string;
  unreadCount: number;
  unreadAdminCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "visitor" | "admin";
  senderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  attachments?: { url: string; name: string; type: string }[];
}
