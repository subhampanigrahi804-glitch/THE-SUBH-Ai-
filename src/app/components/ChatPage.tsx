import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, LogOut, Sparkles, User, Trash2, Menu } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { chatWithGroq } from '@/services/groqService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPageProps {
  username: string;
  onLogout: () => void;
}

export function ChatPage({ username, onLogout }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello ${username}! 👋 I'm THE SUBH AI, your intelligent assistant. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithGroq(input, messages);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Chat cleared! How can I help you today, ${username}?`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className="fixed lg:relative lg:translate-x-0 w-64 h-screen bg-black border-r-2 border-yellow-400/30 p-4 z-50"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-yellow-400 rounded-full p-2">
              <Bot className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-yellow-400 font-bold">THE SUBH AI</h2>
              <p className="text-yellow-400/50 text-xs">v1.0</p>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-yellow-400/10 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">{username}</span>
            </div>
            <p className="text-yellow-400/50 text-xs">Active now</p>
          </div>

          {/* Actions */}
          <div className="space-y-2 flex-1">
            <Button
              onClick={clearChat}
              variant="ghost"
              className="w-full justify-start text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
          </div>

          {/* Logout */}
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-black border-b-2 border-yellow-400/30 p-4 flex items-center gap-3">
          <Button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            variant="ghost"
            className="lg:hidden text-yellow-400 hover:bg-yellow-400/10"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="bg-yellow-400 rounded-full p-2"
          >
            <Bot className="w-6 h-6 text-black" />
          </motion.div>
          <div>
            <h1 className="text-yellow-400 font-bold">THE SUBH AI Assistant</h1>
            <p className="text-yellow-400/50 text-xs">Powered by GROQ</p>
          </div>
          <div className="ml-auto">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-yellow-400 text-black'
                      : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {message.role === 'assistant' && (
                      <Bot className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    {message.role === 'user' && (
                      <User className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                  <p
                    className={`text-xs ${
                      message.role === 'user' ? 'text-black/60' : 'text-yellow-400/40'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-yellow-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-yellow-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-yellow-400 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t-2 border-yellow-400/30 p-4 bg-black">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 bg-yellow-400/10 border-yellow-400/30 text-yellow-400 placeholder:text-yellow-400/30 focus:border-yellow-400 focus:ring-yellow-400/20 resize-none"
                rows={2}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-full bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
            <p className="text-yellow-400/40 text-xs mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
