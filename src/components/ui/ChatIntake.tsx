import { type ReactNode } from 'react';

export function ChatThread({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-lg" aria-live="polite">
      {children}
    </div>
  );
}

export function AssistantBubble({ children }: { children: ReactNode }) {
  return <div className="chat-bubble chat-bubble-assistant">{children}</div>;
}

export function UserBubble({ children }: { children: ReactNode }) {
  return <div className="chat-bubble chat-bubble-user">{children}</div>;
}
