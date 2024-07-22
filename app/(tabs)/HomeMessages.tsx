import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { useRouter } from 'expo-router';

interface User {
  id: string;
  username: string;
  displayName: string;
  profilePicture: string;
  createdAt: Date;
}

export default function HomeMessages() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userQuery = query(collection(firestore, 'userDetails'));
        const unsubscribe = onSnapshot(userQuery, (querySnapshot) => {
          const usersList: User[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data) {
              usersList.push({
                id: doc.id,
                username: data.username || '',
                displayName: data.displayName || '',
                profilePicture: data.profilePicture || '',
                createdAt: (data.createdAt as { toDate: () => Date }).toDate() || new Date(),
              });
            }
          });
          setUsers(usersList);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <TextInput style={styles.searchInput} placeholder="Search" />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.messageItem} onPress={() => router.push(`/ChatPage?receiverId=${item.id}`)}>
            <Image source={{ uri: item.profilePicture }} style={styles.messageImage} />
            <View style={styles.messageContent}>
              <Text style={styles.messageName}>{item.username}</Text>
              <Text style={styles.messageText}>{item.displayName}</Text>
            </View>
            <Text style={styles.messageTime}>{item.createdAt.toLocaleTimeString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    padding: 10,
    marginVertical: 10,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  messageImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  messageContent: {
    flex: 1,
  },
  messageName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
    color: '#555',
  },
  messageTime: {
    fontSize: 14,
    color: '#aaa',
  },
});
