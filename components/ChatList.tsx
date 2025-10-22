import React from 'react';
import { ChatSession } from '../types';
import { Icon } from './Icon';

interface ChatListProps {
    sessions: ChatSession[];
    activeSession: ChatSession | null;
    onSelectSession: (session: ChatSession) => void;
    onCreateChat: () => void;
    onDeleteChat: (sessionId: string) => void;
    isLoading: boolean;
}

const ChatListItemSkeleton: React.FC = () => (
    <div className="flex items-center gap-3 px-3 py-2 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-[var(--text-secondary)] opacity-20"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 rounded bg-[var(--text-secondary)] opacity-20 w-3/4"></div>
            <div className="h-3 rounded bg-[var(--text-secondary)] opacity-20 w-1/2"></div>
        </div>
    </div>
);

export const ChatList: React.FC<ChatListProps> = ({ sessions, activeSession, onSelectSession, onCreateChat, onDeleteChat, isLoading }) => {
    
    const truncate = (text: string, length: number) => {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    return (
        <aside className="w-80 bg-[var(--bg-default)] flex flex-col border-r border-black/20">
            <div className="p-4 flex items-center justify-between border-b border-black/20">
                <h1 className="text-xl font-bold">Chats</h1>
                <button onClick={onCreateChat} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <Icon name="plus" className="w-6 h-6" />
                </button>
            </div>
            <div className="p-2">
                 <div className="relative">
                    <Icon name="search" className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input 
                        type="text" 
                        placeholder="Search chats..."
                        className="w-full bg-[var(--bg-card)] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                 </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {isLoading && (
                    <div className="p-2 space-y-2">
                        {[...Array(5)].map((_, i) => <ChatListItemSkeleton key={i} />)}
                    </div>
                )}
                {!isLoading && sessions.map(session => (
                    <div
                        key={session.id}
                        onClick={() => onSelectSession(session)}
                        className={`group flex items-center gap-3 m-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            activeSession?.id === session.id ? 'bg-[var(--bg-card)]' : 'hover:bg-[var(--bg-card)]/50'
                        }`}
                    >
                        <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center font-bold text-white">
                            {session.title.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h3 className="font-semibold truncate">{session.title}</h3>
                            <p className="text-sm text-[var(--text-secondary)] truncate">
                                {session.messages.length > 0 ? 
                                    truncate(session.messages[session.messages.length - 1].text, 30) : 
                                    'No messages yet'
                                }
                            </p>
                        </div>
                         <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteChat(session.id); }}
                            className="hidden group-hover:block p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                            <Icon name="delete" className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    );
};
