import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { 
  ChevronLeft, 
  Send, 
  Image as ImageIcon, 
  Smile, 
  Calendar, 
  PlusCircle, 
  Heart, 
  ThumbsUp,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

// Sample conversation starters
const conversationStarters = [
  {
    id: 1,
    category: "Fun & Playful",
    question: "If we could teleport anywhere for a dream date night right now, where would you want to go?",
  },
  {
    id: 2,
    category: "Deep Connection",
    question: "What's one thing you're proud of about our relationship that you don't think I realize?",
  },
  {
    id: 3,
    category: "Future Planning",
    question: "What's one adventure or experience you'd love for us to save up for in the next few years?",
  },
  {
    id: 4,
    category: "Appreciation",
    question: "What's something small I do that makes you feel loved that I might not realize is important to you?",
  },
  {
    id: 5,
    category: "Intimacy",
    question: "What's one way I could make you feel more special or appreciated in our relationship?",
  },
];

// Sample messages data
const initialMessages = [
  {
    id: 1,
    text: "Hey! How's your day going so far?",
    sender: "partner",
    timestamp: "10:30 AM",
    read: true,
  },
  {
    id: 2,
    text: "Pretty good! Just finished that project I was telling you about. How about you?",
    sender: "self",
    timestamp: "10:32 AM",
    read: true,
  },
  {
    id: 3,
    text: "That's awesome! I'm proud of you for getting it done. I'm just on my lunch break now.",
    sender: "partner",
    timestamp: "10:35 AM",
    read: true,
  },
  {
    id: 4,
    text: "Thanks! What are you thinking for dinner tonight?",
    sender: "self",
    timestamp: "10:36 AM",
    read: true,
  },
  {
    id: 5,
    text: "How about we try that new Italian place? I've been craving pasta all week!",
    sender: "partner",
    timestamp: "10:38 AM",
    read: true,
  },
  {
    id: 6,
    text: "Sounds perfect! Should we go around 7?",
    sender: "self",
    timestamp: "10:40 AM",
    read: true,
  },
  {
    id: 7,
    text: "Works for me! I'll make a reservation. Looking forward to it! ❤️",
    sender: "partner",
    timestamp: "10:41 AM",
    read: true,
  },
];

// Sample scheduled messages
const scheduledMessages = [
  {
    id: 101,
    text: "Good morning! Hope you have a wonderful day today. 💕",
    time: "7:00 AM",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    active: true,
  },
  {
    id: 102,
    text: "Don't forget to take a break and hydrate! 💧",
    time: "2:00 PM",
    days: ["Mon", "Wed", "Fri"],
    active: true,
  },
  {
    id: 103,
    text: "Can't wait to see you tonight! ❤️",
    time: "5:00 PM",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    active: false,
  },
];

export default function Messaging() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [partnerName, setPartnerName] = useState("Alex");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Simulate partner typing
  useEffect(() => {
    if (messages[messages.length - 1].sender === "self") {
      setPartnerTyping(true);
      const timer = setTimeout(() => {
        setPartnerTyping(false);
        // Simulate partner response
        if (Math.random() > 0.5) {
          handlePartnerReply();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    const newMsg = {
      id: messages.length + 1,
      text: newMessage,
      sender: "self",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
  };
  
  const handlePartnerReply = () => {
    const replies = [
      "That sounds great!",
      "I miss you! Can't wait to see you later.",
      "Thinking about you right now. ❤️",
      "How's your day going?",
      "Love that idea!",
      "You always know how to make me smile.",
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    const replyMsg = {
      id: messages.length + 1,
      text: randomReply,
      sender: "partner",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    
    setMessages([...messages, replyMsg]);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendStarter = (question: string) => {
    const newMsg = {
      id: messages.length + 1,
      text: question,
      sender: "self",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    
    setMessages([...messages, newMsg]);
    toast.success("Conversation starter sent!");
  };
  
  const handleToggleScheduled = (id: number) => {
    // In a real app, this would update the database
    toast.success("Message schedule updated!");
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
          <div className="flex items-center gap-3 mx-auto">
            <Avatar>
              <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256" />
              <AvatarFallback>{partnerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{partnerName}</h1>
              <p className="text-xs text-gray-500">
                {partnerTyping ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="container max-w-lg mx-auto px-4 py-2 grid grid-cols-3">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="starters">Conversation Starters</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col">
          <div className="container max-w-lg mx-auto px-4 py-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === "self" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "partner" && (
                    <Avatar className="w-8 h-8 mr-2 flex-shrink-0 self-end mb-1">
                      <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256" />
                      <AvatarFallback>{partnerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="space-y-1 max-w-[75%]">
                    <div 
                      className={`rounded-2xl px-4 py-2 inline-block ${
                        message.sender === "self" 
                          ? "bg-primary text-white rounded-br-none" 
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <p className="text-xs text-gray-500">{message.timestamp}</p>
                  </div>
                </div>
              ))}
              {partnerTyping && (
                <div className="flex justify-start">
                  <Avatar className="w-8 h-8 mr-2 flex-shrink-0 self-end mb-1">
                    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256" />
                    <AvatarFallback>{partnerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-200 rounded-2xl px-4 py-2 rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "200ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "400ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white border-t p-3">
            <div className="container max-w-lg mx-auto">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <PlusCircle className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="pr-10"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <Button 
                  size="icon" 
                  onClick={handleSendMessage}
                  disabled={newMessage.trim() === ""}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="starters" className="container max-w-lg mx-auto px-4 py-4">
          <div className="space-y-4">
            <div className="bg-primary/10 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-medium text-gray-900">Conversation Starters</h2>
              </div>
              <p className="text-sm text-gray-600">
                Use these thoughtful questions to spark meaningful conversations with your partner.
              </p>
            </div>
            
            {conversationStarters.map((starter) => (
              <Card key={starter.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {starter.category}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-4">{starter.question}</p>
                  <div className="flex justify-end">
                    <Button 
                      size="sm"
                      onClick={() => handleSendStarter(starter.question)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="scheduled" className="container max-w-lg mx-auto px-4 py-4">
          <div className="space-y-4">
            <div className="bg-primary/10 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-medium text-gray-900">Scheduled Messages</h2>
              </div>
              <p className="text-sm text-gray-600">
                Set up automatic messages to send to your partner at specific times.
              </p>
            </div>
            
            {scheduledMessages.map((message) => (
              <Card key={message.id} className={`overflow-hidden ${!message.active ? "opacity-60" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{message.time}</span>
                      <span className="text-xs text-gray-500">
                        {message.days.join(", ")}
                      </span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={message.active}
                        onChange={() => handleToggleScheduled(message.id)}
                        id={`toggle-${message.id}`}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                  </div>
                  <p className="text-gray-800 mb-2">{message.text}</p>
                </CardContent>
              </Card>
            ))}
            
            <div className="flex justify-center mt-6">
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add New Scheduled Message
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <BottomNav />
    </div>
  );
} 