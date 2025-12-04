import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import type { ChatMessage, Distribution, ChatHistoryItem } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import useLocalStorage from '../hooks/useLocalStorage';
import ReactMarkdown from 'react-markdown';
import { useLoading } from '../contexts/LoadingContext';
import { useChat } from '../contexts/ChatContext';
import Feedback from './Feedback';

interface ChatbotProps {
  selectedDistribution: Distribution;
}

const Chatbot: React.FC<ChatbotProps> = ({ selectedDistribution }) => {
  const { isChatOpen: isOpen, setIsChatOpen: setIsOpen, initialInput, inputTrigger } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useLocalStorage<ChatHistoryItem[]>('chatHistory', []);
  const [activeView, setActiveView] = useState<'chat' | 'history'>('chat');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const { startLoading, stopLoading } = useLoading();
  const lastTriggerRef = useRef(0);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY }), []);

  const startNewChat = () => {
    const newChat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `你是一位专为医美行业从业者服务的AI助教，精通统计学和数据分析。你的任务是用通俗易懂的中文，清晰、简洁地解释各种统计学概念。
        当前用户正在学习“${selectedDistribution.name}”，请围绕这个主题进行回答。
        请根据用户的设定调整你的回答风格：风格=${settings.aiStyle}，长度=${settings.aiLength}。
        非必要情况请勿使用英文。`,
      },
    });
    setChat(newChat);
    const newId = `chat_${Date.now()}`;
    setMessages([{ role: 'model', text: `你好！我看到你正在学习 ${selectedDistribution.name}。有什么可以帮你的吗？`, id: `${newId}-m-0` }]);
    setCurrentChatId(newId);
    setActiveView('chat');
  };

  useEffect(() => {
    if (isOpen) {
      startNewChat();
    }
  }, [isOpen, selectedDistribution, settings.aiStyle, settings.aiLength]);
  
  useEffect(() => {
    if (inputTrigger > lastTriggerRef.current) {
        setInput(initialInput);
        lastTriggerRef.current = inputTrigger;
    }
  }, [inputTrigger, initialInput]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || !chat) return;

    const userMessage: ChatMessage = { role: 'user', text: messageText, id: `${currentChatId}-u-${messages.length}` };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    startLoading();

    try {
      const response = await chat.sendMessage({ message: messageText });
      const modelMessage: ChatMessage = { role: 'model', text: response.text, id: `${currentChatId}-m-${updatedMessages.length}` };
      const finalMessages = [...updatedMessages, modelMessage];
      setMessages(finalMessages);

      if (currentChatId) {
        const existingHistory = history.find(h => h.id === currentChatId);
        if (existingHistory) {
          setHistory(history.map(h => h.id === currentChatId ? { ...h, messages: finalMessages, timestamp: Date.now() } : h));
        } else {
          setHistory([...history, { id: currentChatId, title: messageText.substring(0, 20), messages: finalMessages, model: selectedDistribution.name, timestamp: Date.now() }]);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = { role: 'model', text: '抱歉，我遇到了一些问题，请稍后再试。' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };
  
  const loadHistory = (item: ChatHistoryItem) => {
    setCurrentChatId(item.id);
    setMessages(item.messages);
    setActiveView('chat');
  };
  
  const deleteHistory = (id: string) => {
    setHistory(history.filter(h => h.id !== id));
  };


  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 md:bottom-6 right-6 bg-[color:rgb(var(--color-primary))] text-white p-3 rounded-full shadow-lg hover:opacity-90 transition-all duration-300 focus:outline-none z-20 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
        aria-label="打开AI助教"
      >
        <span className="material-symbols-outlined text-3xl">psychology</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 w-full md:max-w-md h-full md:h-[70vh] md:max-h-[600px] bg-white rounded-none md:rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
          <header className="flex items-center justify-between p-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] md:rounded-t-2xl">
            <div className="flex items-center space-x-2">
              <button onClick={() => setActiveView('history')} className={`p-1 rounded-md ${activeView === 'history' ? 'bg-white' : ''}`}><span className="material-symbols-outlined text-lg">history</span></button>
              <h3 className="text-base font-bold text-[color:var(--color-text-base)]">AI 助教</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-base)]" aria-label="关闭对话">
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>
          
          {activeView === 'chat' ? (
            <div className="flex-1 p-4 overflow-y-auto bg-[color:var(--color-bg-muted)]">
              {/* Chat content */}
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-xl prose prose-sm ${msg.role === 'user' ? 'bg-[color:rgb(var(--color-primary))] text-white' : 'bg-white text-[color:var(--color-text-base)] shadow-sm'}`}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    {msg.role === 'model' && index > 0 && msg.id && (
                        <div className="mt-1.5 ml-1">
                            <Feedback contentId={msg.id} contentType="chatbot_response" promptText="" />
                        </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-xl bg-white text-slate-700 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          ) : (
            <div className="flex-1 p-2 overflow-y-auto bg-[color:var(--color-bg-muted)]">
                {/* History content */}
                <button onClick={startNewChat} className="w-full text-center p-2 mb-2 bg-white border border-[color:var(--color-border)] rounded-lg text-sm font-medium text-[color:var(--color-primary)]"> + 开始新对话</button>
                <div className="space-y-2">
                  {history.sort((a,b) => b.timestamp - a.timestamp).map(item => (
                    <div key={item.id} className="group flex items-center justify-between p-2 bg-white rounded-lg border border-[color:var(--color-border)]">
                      <button onClick={() => loadHistory(item)} className="flex-1 text-left">
                        <p className="text-sm font-medium text-ellipsis overflow-hidden whitespace-nowrap">{item.title}</p>
                        <p className="text-xs text-[color:var(--color-text-muted)]">{new Date(item.timestamp).toLocaleString()}</p>
                      </button>
                       <button onClick={() => deleteHistory(item.id)} className="p-1 text-[color:var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="material-symbols-outlined text-base">delete</span>
                       </button>
                    </div>
                  ))}
                </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="p-3 border-t border-[color:var(--color-border)] bg-white md:rounded-b-2xl">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="问点什么吧..."
                className="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-primary)/0.5)]"
                disabled={isLoading || activeView === 'history'}
                aria-label="聊天输入框"
              />
              <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-1 top-1/2 -translate-y-1/2 bg-[color:rgb(var(--color-primary))] text-white p-2 rounded-full hover:opacity-90 disabled:bg-slate-400 transition" aria-label="发送消息">
                 <span className="material-symbols-outlined text-base">send</span>
              </button>
              
              {isLoading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-full flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-sm font-medium text-[color:var(--color-text-base)]">AI 正在思考...</span>
                    <div className="w-1/2 h-1 bg-[color:rgb(var(--color-primary)/0.2)] rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full w-full animate-loading-bar bg-[color:rgb(var(--color-primary))]"></div>
                    </div>
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;