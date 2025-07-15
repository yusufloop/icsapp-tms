import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { Modal } from 'react-native';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

const N8nChatWebView = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // HTML content that includes the n8n chat widget
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>n8n Chat</title>
        <link href="https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css" rel="stylesheet" />
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                background-color: #f5f5f5;
            }
            .chat-container {
                height: 100vh;
                width: 100%;
                display: flex;
                flex-direction: column;
            }
        </style>
    </head>
    <body>
        <div class="chat-container">
            <div id="n8n-chat"></div>
        </div>
        
        <script type="module">
            import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
            
            try {
                createChat({
                    webhookUrl: 'https://above-dinosaur-weekly.ngrok-free.app/webhook/b4eb85b7-8b54-4465-a206-a44ac666fd4c/chat',
                    target: '#n8n-chat'
                });
            } catch (error) {
                console.error('Error initializing n8n chat:', error);
                document.body.innerHTML = '<div style="padding: 20px; text-align: center;">Error loading chat widget</div>';
            }
        </script>
    </body>
    </html>
  `;

   return (
    <SafeAreaView style={styles.container}>
      {/* Floating Chat Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsChatOpen(true)}
        activeOpacity={0.8}
      >
        <MaterialIcons name="chat" size={28} color="white" />
      </TouchableOpacity>

      {/* Fullscreen Chat Modal */}
      <Modal
        visible={isChatOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsChatOpen(false)}
        transparent={false}
      >
        <SafeAreaView style={styles.fullscreenModal}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsChatOpen(false)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="close" size={28} color="white" />
          </TouchableOpacity>
          {/* Chat WebView */}
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView HTTP error: ', nativeEvent);
            }}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <Text>Loading chat...</Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Constants.statusBarHeight,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#2563eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  closeButton: {
    position: 'absolute',
    top: 32,
    right: 32,
    zIndex: 1001,
    backgroundColor: '#2563eb',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});


export default N8nChatWebView;