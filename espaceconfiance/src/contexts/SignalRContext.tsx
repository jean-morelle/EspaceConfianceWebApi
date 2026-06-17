import * as signalR from '@microsoft/signalr';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { MessageDto, RoomMessageDto } from '../types';
import { useAuth } from './AuthContext';

interface SignalRContextType {
  chatConnection: signalR.HubConnection | null;
  isConnected: boolean;
  joinConversation: (id: string) => Promise<void>;
  leaveConversation: (id: string) => Promise<void>;
  joinRoom: (id: string) => Promise<void>;
  leaveRoom: (id: string) => Promise<void>;
  sendPrivateMessage: (conversationId: string, content: string) => Promise<void>;
  sendRoomMessage: (roomId: string, content: string) => Promise<void>;
  sendTyping: (conversationId: string, isTyping: boolean) => Promise<void>;
  onMessage: (handler: (msg: MessageDto) => void) => void;
  onRoomMessage: (handler: (msg: RoomMessageDto) => void) => void;
  onTyping: (handler: (data: { userId: string; conversationId: string; isTyping: boolean }) => void) => void;
}

const SignalRContext = createContext<SignalRContextType | null>(null);

export function SignalRProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('accessToken');
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/chat', { accessTokenFactory: () => token ?? '' })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    connection.start()
      .then(() => setIsConnected(true))
      .catch(console.error);

    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    return () => { connection.stop(); };
  }, [isAuthenticated]);

  const invoke = async (method: string, ...args: unknown[]) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke(method, ...args);
    }
  };

  const joinConversation = (id: string) => invoke('JoinConversation', id);
  const leaveConversation = (id: string) => invoke('LeaveConversation', id);
  const joinRoom = (id: string) => invoke('JoinRoom', id);
  const leaveRoom = (id: string) => invoke('LeaveRoom', id);
  const sendPrivateMessage = (conversationId: string, content: string) =>
    invoke('SendPrivateMessage', conversationId, content);
  const sendRoomMessage = (roomId: string, content: string) =>
    invoke('SendRoomMessage', roomId, content);
  const sendTyping = (conversationId: string, isTyping: boolean) =>
    invoke('Typing', conversationId, isTyping);

  const onMessage = (handler: (msg: MessageDto) => void) => {
    connectionRef.current?.on('ReceiveMessage', handler);
  };
  const onRoomMessage = (handler: (msg: RoomMessageDto) => void) => {
    connectionRef.current?.on('ReceiveRoomMessage', handler);
  };
  const onTyping = (handler: (data: { userId: string; conversationId: string; isTyping: boolean }) => void) => {
    connectionRef.current?.on('UserTyping', handler);
  };

  return (
    <SignalRContext.Provider value={{
      chatConnection: connectionRef.current,
      isConnected,
      joinConversation, leaveConversation,
      joinRoom, leaveRoom,
      sendPrivateMessage, sendRoomMessage,
      sendTyping,
      onMessage, onRoomMessage, onTyping,
    }}>
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalR() {
  const ctx = useContext(SignalRContext);
  if (!ctx) throw new Error('useSignalR must be used within SignalRProvider');
  return ctx;
}
