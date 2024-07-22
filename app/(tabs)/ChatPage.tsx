import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { ScaledSheet, vs } from 'react-native-size-matters';
import { collection, query, orderBy, onSnapshot, addDoc, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from '../firebaseConfig'; // Ensure this path is correct
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Message {
  id: string;
  text: string;
  user: string; // Sender ID
  receiver: string; // Receiver ID
  createdAt: Date;
}

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUserId }) => (
  <View style={[styles.messageBubble, message.user === currentUserId ? styles.myMessage : styles.otherMessage]}>
    <Text style={styles.messageText}>{message.text}</Text>
  </View>
);

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;
  const { receiverId } = useLocalSearchParams(); // Get receiver ID from URL params
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (currentUserId && receiverId) {
      const unsubscribe = onSnapshot(
        query(
          collection(firestore, 'messages'),
          orderBy('createdAt', 'asc')
        ),
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          const fetchedMessages: Message[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (
              (data.user === currentUserId && data.receiver === receiverId) ||
              (data.user === receiverId && data.receiver === currentUserId)
            ) {
              fetchedMessages.push({
                id: doc.id,
                text: data.text || '',
                user: data.user || '',
                receiver: data.receiver || '',
                createdAt: (data.createdAt as { toDate: () => Date }).toDate() || new Date(),
              });
            }
          });
          setMessages(fetchedMessages);
          flatListRef.current?.scrollToEnd();
        },
        (error) => {
          console.error('Error fetching messages: ', error);
        }
      );

      return () => unsubscribe();
    }
  }, [currentUserId, receiverId]);

  const sendMessage = async () => {
    if (!currentUserId) {
      console.error('Current user ID is null');
      return;
    }
    if (!receiverId) {
      console.error('Receiver ID is null');
      return;
    }
    if (messageText.trim() === '') {
      console.error('Message text is empty');
      return;
    }

    try {
      await addDoc(collection(firestore, 'messages'), {
        text: messageText.trim(),
        user: currentUserId,
        receiver: receiverId,
        createdAt: new Date(),
      });
      setMessageText(''); // Clear input field immediately
    } catch (error) {
      console.error('Error adding message: ', error);
    }
  };

  // Ensure currentUserId is defined before rendering
  if (!currentUserId) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Image source={require("../../assets/images/Profile8.png")} style={styles.image} />
        <View style={styles.icons}>
          <Pressable>
            <Image source={require("../../assets/images/VoiceCall.png")} style={styles.images} />
          </Pressable>
          <Pressable>
            <Image source={require("../../assets/images/VideoCall.png")} style={styles.images} />
          </Pressable>
        </View>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} currentUserId={currentUserId} />}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={messageText}
            onChangeText={setMessageText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: '10@s',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#c4c4c4',
    alignItems: 'center',
    marginTop: '30@vs',
  },
  icons: {
    flexDirection: 'row',
    gap: '2@s',
  },
  image: {
    height: '50@vs',
    width: '50@s',
    resizeMode: 'contain',
  },
  images: {
    height: '30@vs',
    width: '30@s',
    resizeMode: 'contain',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '10@s',
    borderRadius: '10@vs',
    marginVertical: '5@vs',
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#ECECEC',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: '16@vs',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    padding: '10@s',
  },
  input: {
    flex: 1,
    height: '40@vs',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: '20@vs',
    paddingLeft: '15@s',
  },
  sendButton: {
    marginLeft: '10@s',
    padding: '10@s',
    backgroundColor: '#800000',
    borderRadius: '20@vs',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: '16@vs',
  },
});

export default ChatPage;
