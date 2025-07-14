import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface N8nChatWidgetProps {
  webhookUrl?: string;
  style?: any;
  onMessage?: (message: any) => void;
}

export default function N8nChatWidget({ 
  webhookUrl = 'https://above-dinosaur-weekly.ngrok-free.app/webhook/b4eb85b7-8b54-4465-a206-a44ac666fd4c/chat',
  style,
  onMessage 
}: N8nChatWidgetProps) {
  const webViewRef = useRef<WebView>(null);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>N8n Chat</title>
      <link href="https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css" rel="stylesheet" />
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: transparent;
        }
        
        /* Customize chat widget appearance */
        .n8n-chat {
          height: 100vh;
          width: 100%;
        }
        
        /* Hide any potential scrollbars */
        ::-webkit-scrollbar {
          display: none;
        }
      </style>
    </head>
    <body>
      <div id="n8n-chat-container"></div>
      
      <script type="module">
        import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
        
        try {
          createChat({
            webhookUrl: '${webhookUrl}',
            target: '#n8n-chat-container',
            // Additional configuration options
            mode: 'embedded',
            showWelcomeMessage: true,
            initialMessages: [],
            // Customize appearance
            theme: {
              primaryColor: '#0A84FF',
              textColor: '#000000',
              backgroundColor: '#FFFFFF'
            }
          });
          
          // Send ready message to React Native
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'CHAT_READY'
          }));
          
        } catch (error) {
          console.error('Failed to initialize n8n chat:', error);
          
          // Send error message to React Native
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'CHAT_ERROR',
            error: error.message
          }));
        }
        
        // Listen for messages and forward to React Native
        window.addEventListener('message', (event) => {
          if (event.data && typeof event.data === 'object') {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'CHAT_MESSAGE',
              data: event.data
            }));
          }
        });
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'CHAT_READY':
          console.log('N8n chat widget is ready');
          break;
          
        case 'CHAT_ERROR':
          console.error('N8n chat error:', message.error);
          break;
          
        case 'CHAT_MESSAGE':
          console.log('Chat message:', message.data);
          onMessage?.(message.data);
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  };

  const handleLoadError = (error: any) => {
    console.error('WebView load error:', error);
  };

  const handleHttpError = (error: any) => {
    console.error('WebView HTTP error:', error);
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        onError={handleLoadError}
        onHttpError={handleHttpError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        scrollEnabled={true}
        bounces={false}
        // Allow mixed content for development
        mixedContentMode="compatibility"
        // Additional security settings
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Network settings for ngrok
        onShouldStartLoadWithRequest={(request) => {
          // Allow ngrok URLs and CDN resources
          const allowedDomains = [
            'cdn.jsdelivr.net',
            'ngrok-free.app',
            'ngrok.io'
          ];
          
          const isAllowed = allowedDomains.some(domain => 
            request.url.includes(domain)
          ) || request.url.startsWith('data:') || request.url.startsWith('blob:');
          
          return isAllowed;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

// Export additional utility functions
export const sendMessageToChat = (webViewRef: React.RefObject<WebView>, message: string) => {
  if (webViewRef.current) {
    const script = `
      // Find the chat input and send message
      const chatInput = document.querySelector('input[type="text"], textarea');
      if (chatInput) {
        chatInput.value = '${message.replace(/'/g, "\\'")}';
        chatInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Find and click send button
        const sendButton = document.querySelector('button[type="submit"], .send-button');
        if (sendButton) {
          sendButton.click();
        }
      }
    `;
    
    webViewRef.current.injectJavaScript(script);
  }
};

export const clearChatHistory = (webViewRef: React.RefObject<WebView>) => {
  if (webViewRef.current) {
    const script = `
      // Clear chat history if available
      if (window.n8nChat && window.n8nChat.clear) {
        window.n8nChat.clear();
      }
    `;
    
    webViewRef.current.injectJavaScript(script);
  }
};