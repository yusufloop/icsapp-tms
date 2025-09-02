import { createChat } from '@n8n/chat';
// import '@n8n/chat/style.css';
import { useEffect } from 'react';

const N8nChatWidget = () => {
  useEffect(() => {
    createChat({
      webhookUrl: 'https://above-dinosaur-weekly.ngrok-free.app/webhook/b4eb85b7-8b54-4465-a206-a44ac666fd4c/chat',
      webhookConfig: {
        method: 'POST',
        headers: {}
      },
      target: '#n8n-chat',
      mode: 'window',
      chatInputKey: 'chatInput',
      chatSessionKey: 'sessionId',
      loadPreviousSession: true,
      metadata: {},
      showWelcomeScreen: false,
      defaultLanguage: 'en',
      initialMessages: [
        ' ',
      
      ],
      i18n: {
        en: {
          title: 'Hi there! 👋',
          subtitle: "My Name is Siti, We're here to help you 24/7 in Logitrax.",
          footer: '',
          getStarted: 'New Conversation',
          inputPlaceholder: 'Type your question..',
          closeButtonTooltip: 'Close chat',
        },
      },
    });

    // Add N8n CSS variables for clean theming
    const addChatTheme = () => {
      let style = document.getElementById('n8n-chat-theme') as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement('style');
        style.id = 'n8n-chat-theme';
        document.head.appendChild(style);
      }
      
      style.textContent = `
        :root {
          --chat--color-primary: #3b82f6;
          --chat--color-primary-shade-50: #2563eb;
          --chat--color-primary-shade-100: #1d4ed8;
          --chat--color-secondary: #10b981;
          --chat--color-secondary-shade-50: #059669;
          --chat--color-white: #ffffff;
          --chat--color-light: #f8fafc;
          --chat--color-light-shade-50: #f1f5f9;
          --chat--color-light-shade-100: #e2e8f0;
          --chat--color-medium: #cbd5e1;
          --chat--color-dark: #1e293b;
          --chat--color-disabled: #94a3b8;
          --chat--color-typing: #64748b;

          --chat--spacing: 1rem;
          --chat--border-radius: 12px;
          --chat--transition-duration: 0.2s;

          --chat--window--width: 400px;
          --chat--window--height: 600px;

          --chat--header-height: auto;
          --chat--header--padding: var(--chat--spacing);
          --chat--header--background: var(--chat--color-primary);
          --chat--header--color: var(--chat--color-white);
          --chat--header--border-top: none;
          --chat--header--border-bottom: none;
          --chat--heading--font-size: 1.5rem;
          --chat--subtitle--font-size: 0.875rem;
          --chat--subtitle--line-height: 1.4;

          --chat--textarea--height: 44px;

          --chat--message--font-size: 0.875rem;
          --chat--message--padding: 0.75rem;
          --chat--message--border-radius: 18px;
          --chat--message-line-height: 1.4;
          --chat--message--bot--background: var(--chat--color-light-shade-50);
          --chat--message--bot--color: var(--chat--color-dark);
          --chat--message--bot--border: none;
          --chat--message--user--background: var(--chat--color-primary);
          --chat--message--user--color: var(--chat--color-white);
          --chat--message--user--border: none;
          --chat--message--pre--background: rgba(0, 0, 0, 0.05);

          --chat--toggle--background: var(--chat--color-primary);
          --chat--toggle--hover--background: var(--chat--color-primary-shade-50);
          --chat--toggle--active--background: var(--chat--color-primary-shade-100);
          --chat--toggle--color: var(--chat--color-white);
          --chat--toggle--size: 64px;
        }

        /* Additional custom styling for better UX */
        #n8n-chat {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
        }

        /* Ensure proper input styling */

        #n8n-chat input,
        #n8n-chat textarea {
          border: 1px solid var(--chat--color-medium) !important;
          border-radius: 20px !important;
          padding: 10px 16px !important;
          font-size: 14px !important;
          transition: all var(--chat--transition-duration) ease !important;
        }

        #n8n-chat textarea {
          width: 100% !important;
          flex: 1 !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }

        #n8n-chat input:focus,
        #n8n-chat textarea:focus {
          border-color: var(--chat--color-primary) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          outline: none !important;
        }

        /* Submit button styling */
        #n8n-chat button[type="submit"],
        #n8n-chat .send-button {
          background: var(--chat--color-primary) !important;
          border: none !important;
          border-radius: 50% !important;
          width: 40px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all var(--chat--transition-duration) ease !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25) !important;
        }

        #n8n-chat button[type="submit"]:hover {
          background: var(--chat--color-primary-shade-50) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35) !important;
        }

        /* Input container layout */
        #n8n-chat .input-container,
        #n8n-chat form {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          padding: 16px !important;
          background: var(--chat--color-white) !important;
          border-top: 1px solid var(--chat--color-light-shade-100) !important;
        }

        /* Compact message styling */
        #n8n-chat .message {
          margin: 6px 0 !important;
          max-width: 80% !important;
        }

        #n8n-chat .message.bot {
          margin-right: auto !important;
          background: var(--chat--message--bot--background) !important;
          color: var(--chat--message--bot--color) !important;
          border-bottom-left-radius: 4px !important;
        }

        #n8n-chat .message.user {
          margin-left: auto !important;
          background: var(--chat--message--user--background) !important;
          color: var(--chat--message--user--color) !important;
          border-bottom-right-radius: 4px !important;
        }
      `;
    };

    // Apply theme immediately and watch for DOM changes
    setTimeout(addChatTheme, 50);
    setTimeout(addChatTheme, 200);
    setTimeout(addChatTheme, 500);

    return () => {
      const style = document.getElementById('n8n-chat-theme');
      if (style) document.head.removeChild(style);
    };
  }, []);

  // User-friendly chat widget container with header and close button
  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-96 max-w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col"
      style={{ minHeight: 420 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white">
        <span className="font-semibold text-lg">Chat with logibot</span>
        <button
          className="text-white hover:text-blue-200 text-xl font-bold focus:outline-none"
          onClick={() => {
            const el = document.querySelector('.fixed.bottom-6.right-6');
            if (el) (el as HTMLElement).style.display = 'none';
          }}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>
      {/* Chat body */}
      <div id="n8n-chat" className="flex-1 p-3 overflow-y-auto" />
    </div>
  );
};

export default N8nChatWidget;