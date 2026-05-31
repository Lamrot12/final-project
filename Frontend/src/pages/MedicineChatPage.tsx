import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function MedicineChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your medicine assistant. Ask me any questions about medications, drug interactions, or pharmaceutical information.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || data.message || 'No response received',
        sources: data.normalized_drugs || data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your medicine assistant. Ask me any questions about medications, drug interactions, or pharmaceutical information.',
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Medicine Chat</h1>
                <p className="text-sm text-slate-500">Ask about medications and drugs</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Clear Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white border border-slate-200 shadow-lg overflow-hidden">
            {/* Messages Area */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-300">
                        <p className="text-xs font-semibold mb-1">Sources:</p>
                        <ul className="text-xs list-disc list-inside space-y-1">
                          {message.sources.map((source, idx) => (
                            <li key={idx}>{source}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 p-4 bg-slate-50">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about medications, drug interactions, etc..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </Card>

          {/* Info Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 text-sm">About Medicine Chat</h3>
                <p className="text-xs text-blue-700 mt-1">
                  This AI assistant can help you with information about medications, drug interactions,
                  dosage guidelines, and pharmaceutical questions. It uses advanced AI models to provide
                  accurate and helpful responses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
