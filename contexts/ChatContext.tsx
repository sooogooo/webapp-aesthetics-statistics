import React, { createContext, useContext, useState, useMemo } from 'react';

interface ChatContextType {
  initialInput: string;
  setInitialInput: (input: string) => void;
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  inputTrigger: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialInput, _setInitialInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputTrigger, setInputTrigger] = useState(0);

  const setInitialInput = (input: string) => {
    _setInitialInput(input);
    setInputTrigger(prev => prev + 1);
  };
  
  const value = useMemo(() => ({
    initialInput,
    setInitialInput,
    isChatOpen,
    setIsChatOpen,
    inputTrigger
  }), [initialInput, isChatOpen, inputTrigger]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};