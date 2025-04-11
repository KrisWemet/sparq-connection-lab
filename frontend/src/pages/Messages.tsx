import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-provider";
import { messageService, Message } from "@/services/supabase/MessageService";
import { profileService } from "@/services/supabase/ProfileService";
import { ChevronLeft, Send, User, Info, Loader2, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import { toast } from "sonner";
import { UserProfile } from "@/services/supabase/types";

export default function Messages() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendAsSms, setSendAsSms] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Function to get the partner's name (handles potential JSON format)
  const getPartnerName = () => {
    if (!partnerProfile) return "Partner";
    
    const name = partnerProfile.username || "";
    
    // Check if the name is in JSON format
    if (name && typeof name === 'string' && name.includes('{') && name.includes('}')) {
      try {
        const parsed = JSON.parse(name);
        return parsed.fullName || "Partner";
      } catch (e) {
        // If parsing fails, try to extract the name using regex
        const match = name.match(/"fullName"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    
    return name || "Partner";
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch partner profile
        const partner = await profileService.getPartnerProfile();
        setPartnerProfile(partner);
        
        // Fetch messages
        const messageData = await messageService.getMessages();
        setMessages(messageData);
        
        // Mark all unread messages as read
        const unreadIds = messageData
          .filter(m => !m.isRead && !m.isOutgoing)
          .map(m => m.id);
          
        if (unreadIds.length > 0) {
          await messageService.markAsRead(unreadIds);
        }
      } catch (error) {
        console.error("Error fetching message data:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Subscribe to new messages
    const unsubscribe = messageService.subscribeToNewMessages((message) => {
      setMessages(prev => [...prev, message]);
      messageService.markAsRead([message.id]);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!profile?.partnerId) {
      toast.error("You need to connect with a partner first");
      return;
    }
    
    setSending(true);
    try {
      const success = await messageService.sendMessage(newMessage.trim(), sendAsSms);
      if (success) {
        // Add message to UI immediately
        const tempMessage: Message = {
          id: Date.now().toString(), // Temporary ID
          senderId: user?.id || '',
          recipientId: profile.partnerId,
          content: newMessage.trim(),
          isRead: false,
          createdAt: new Date(),
          isOutgoing: true,
          sentViaSms: sendAsSms
        };
        setMessages(prev => [...prev, tempMessage]);
        setNewMessage("");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };
  
  // Generate SMS link to share with partner
  const generateSmsLink = () => {
    if (!user) return '#';
    // Format: SMS body with app link
    const message = `Hey! I'd like to chat with you on our relationship app. Download it and connect with me: ${window.location.origin}/partner-invite`;
    return `sms:?&body=${encodeURIComponent(message)}`;
  };
  
  // Helper to format date
  const formatMessageTime = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
        ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24 flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          {partnerProfile ? (
            <div className="flex items-center gap-3 mx-auto">
              <Avatar>
                <AvatarImage src={partnerProfile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(getPartnerName())}`} />
                <AvatarFallback>{getPartnerName().substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{getPartnerName()}</span>
            </div>
          ) : (
            <h1 className="text-xl font-semibold text-gray-900 mx-auto">
              Messages
            </h1>
          )}
          
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 container max-w-lg mx-auto px-4 pt-6 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : profile?.partnerId ? (
          <>
            {/* Messages container */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Info className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No messages yet.</p>
                  <p>Send the first message to your partner!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[75%]">
                      <div
                        className={`p-3 rounded-lg ${
                          message.isOutgoing
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        {message.content}
                        {message.sentViaSms && (
                          <div className="flex items-center justify-end mt-1 text-xs opacity-80">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            <span>SMS</span>
                          </div>
                        )}
                      </div>
                      <div
                        className={`text-xs text-gray-500 mt-1 ${
                          message.isOutgoing ? 'text-right' : 'text-left'
                        }`}
                      >
                        {formatMessageTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message input */}
            <div className="sticky bottom-0 bg-white p-2 border-t">
              <div className="flex flex-col space-y-2">
                {partnerProfile?.phoneNumber && (
                  <div className="flex items-center space-x-2 px-2">
                    <input
                      type="checkbox"
                      id="send-sms"
                      checked={sendAsSms}
                      onChange={(e) => setSendAsSms(e.target.checked)}
                      className="rounded text-primary"
                    />
                    <label htmlFor="send-sms" className="text-sm text-gray-600">
                      Also send as SMS to {partnerProfile.phoneNumber}
                    </label>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[60px] max-h-[120px]"
                    disabled={sending}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <Card className="mb-6">
            <CardContent className="pt-6 pb-4">
              <div className="text-center">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Connect with Your Partner</h3>
                <p className="text-gray-500 mb-4">
                  You need to connect with your partner to start messaging.
                </p>
                <div className="space-y-4">
                  <Button onClick={() => navigate('/partner-invite')} className="w-full">
                    Partner Connect
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                  </div>
                  <a href={generateSmsLink()} className="block">
                    <Button variant="outline" className="w-full">
                      <Copy className="w-4 h-4 mr-2" />
                      Share via SMS
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
} 