import { createChat } from '@n8n/chat';
// import '@n8n/chat/style.css';
import { useEffect } from 'react';

const N8nChatWidget = () => {
	useEffect(() => {
		createChat({
	webhookUrl: 'https://above-dinosaur-weekly.ngrok-free.app/webhook/b4eb85b7-8b54-4465-a206-a44ac666fd4c/chat'
,
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
		
		'My name is Mustaqim Bot. How can I assist you today?'
	],
	i18n: {
		en: {
			title: 'Hi there! 👋',
			subtitle: "Start a chat. We're here to help you 24/7 in Logitrax.",
			footer: '',
			getStarted: 'New Conversation',
			inputPlaceholder: 'Type your question..',
		},
	},
});
	}, []);

  // User-friendly chat widget container with header and close button
  return (
	<div
	  className="fixed bottom-6 right-6 z-50 w-96 max-w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col"
	  style={{ minHeight: 420 }}
	>
	  {/* Header */}
	  <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white">
		<span className="font-semibold text-lg">Chat with Mustaqim Bot</span>
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