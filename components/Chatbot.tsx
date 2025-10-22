import React, { useState, useEffect, useRef } from 'react';
import { getChatResponseStream, generateChatTitle } from '../services/geminiService';
import { ChatMessage, ChatSession } from '../types';
import { Icon } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';

interface ChatbotProps {
    session: ChatSession | null;
    onSessionUpdate: (session: ChatSession) => void;
}

const groupMessages = (messages: ChatMessage[]) => {
    if (!messages.length) return [];

    const grouped = [];
    let currentGroup = { sender: messages[0].sender, messages: [messages[0]] };

    for (let i = 1; i < messages.length; i++) {
        const message = messages[i];
        const lastMessage = currentGroup.messages[currentGroup.messages.length - 1];
        
        if (message.sender === currentGroup.sender && message.timestamp - lastMessage.timestamp < 5 * 60 * 1000) {
            currentGroup.messages.push(message);
        } else {
            grouped.push(currentGroup);
            currentGroup = { sender: message.sender, messages: [message] };
        }
    }
    grouped.push(currentGroup);
    return grouped;
};

export const Chatbot: React.FC<ChatbotProps> = ({ session, onSessionUpdate }) => {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [editingMessage, setEditingMessage] = useState<{id: string, text: string} | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, isStreaming]);

  if (!session) {
      return (
        <div className="flex-1 flex items-center justify-center bg-[var(--bg-card)]">
            <div className="text-center">
                <Icon name="chatbot" className="w-16 h-16 mx-auto text-[var(--text-secondary)] mb-4" />
                <h2 className="text-2xl font-medium text-[var(--text-primary)]">Select a chat to start</h2>
                <p className="text-[var(--text-secondary)]">Or create a new one from the sidebar.</p>
            </div>
        </div>
      );
  }

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const userInput = input;
    setInput('');
    
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: userInput,
      sender: 'user',
      timestamp: Date.now(),
    };

    const isFirstMessage = session.messages.length === 0;
    const updatedMessages = [...session.messages, userMessage];
    
    const botMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        text: '',
        sender: 'bot',
        timestamp: Date.now(),
    };

    const sessionWithUserMessage = {...session, messages: [...updatedMessages, botMessage] };
    onSessionUpdate(sessionWithUserMessage);
    setIsStreaming(true);

    try {
        let fullResponse = '';
        const stream = getChatResponseStream(updatedMessages, userInput);
        for await (const chunk of stream) {
            fullResponse += chunk;
            const updatedBotMessage = { ...botMessage, text: fullResponse };
            onSessionUpdate({ ...session, messages: [...updatedMessages, updatedBotMessage] });
        }
        
        if (isFirstMessage && session.title === "New Chat") {
             const newTitle = await generateChatTitle(userInput);
             onSessionUpdate({ ...session, title: newTitle, messages: [...updatedMessages, {...botMessage, text: fullResponse}] });
        }

    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        text: "Sorry, I couldn't get a response. Please try again.",
        sender: 'bot',
        timestamp: Date.now(),
      }
      onSessionUpdate({...session, messages: [...updatedMessages, errorMessage]});
    } finally {
      setIsStreaming(false);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    const updatedMessages = session.messages.filter(m => m.id !== messageId);
    onSessionUpdate({...session, messages: updatedMessages});
  }

  const handleUpdateMessage = () => {
    if (!editingMessage) return;
    const updatedMessages = session.messages.map(m => m.id === editingMessage.id ? {...m, text: editingMessage.text} : m);
    onSessionUpdate({...session, messages: updatedMessages});
    setEditingMessage(null);
  }

  const groupedMessages = groupMessages(session.messages);

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-card)]">
        <header className="p-4 border-b border-[var(--bg-default)]">
            <h2 className="text-xl font-semibold">{session.title}</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {session.messages.length === 0 && !isStreaming && (
                 <div className="flex flex-col items-center justify-center h-full text-center">
                    <Icon name="logo" className="w-16 h-16 text-[var(--text-secondary)] mb-4" />
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">How can I help you today?</h2>
                </div>
            )}
            {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex} className={`flex flex-col gap-1 ${group.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`w-full max-w-2xl flex flex-col gap-1 ${group.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        {group.messages.map((message) => (
                             <div key={message.id} className="group flex items-center gap-2">
                                {message.sender === 'user' && (
                                    <div className="hidden group-hover:flex items-center gap-1">
                                        <button onClick={() => setEditingMessage({id: message.id, text: message.text})} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><Icon name="edit" className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteMessage(message.id)} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><Icon name="delete" className="w-4 h-4" /></button>
                                    </div>
                                )}
                                {editingMessage?.id === message.id ? (
                                    <div className="flex-1 flex gap-2">
                                        <textarea value={editingMessage.text} onChange={(e) => setEditingMessage({...editingMessage, text: e.target.value})} className="w-full p-2 rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)] border border-transparent focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" rows={2}/>
                                        <button onClick={handleUpdateMessage} className="p-2"><Icon name="check" className="w-5 h-5"/></button>
                                        <button onClick={() => setEditingMessage(null)} className="p-2"><Icon name="close" className="w-5 h-5"/></button>
                                    </div>
                                ) : (
                                    <div className={`px-4 py-2 text-base rounded-2xl ${
                                        message.sender === 'user' ? 'bg-[var(--bubble-user)] text-[var(--text-primary)]' : 'bg-[var(--bubble-bot)] text-[var(--text-primary)]'
                                    }`}>
                                        {message.text}
                                        {isStreaming && message.id === session.messages[session.messages.length - 1].id && <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1"></span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                     <p className="text-xs text-[var(--text-secondary)] px-2">
                        {new Date(group.messages[group.messages.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            ))}
            <div ref={endOfMessagesRef} />
        </div>

        <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--bg-default)]">
            <div className="flex items-center gap-2 bg-[var(--bg-default)] rounded-2xl p-2 max-w-3xl mx-auto">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Ask me anything..."
                    className="flex-1 p-2 bg-transparent focus:outline-none resize-none text-[var(--text-primary)]"
                    rows={1}
                    disabled={isStreaming}
                />
                <button
                    onClick={handleSend}
                    disabled={isStreaming || !input.trim()}
                    className="p-2 font-semibold text-white bg-[var(--accent)] rounded-full hover:opacity-90 disabled:bg-[var(--text-secondary)] disabled:cursor-not-allowed"
                >
                    <Icon name="send" className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
  );
};