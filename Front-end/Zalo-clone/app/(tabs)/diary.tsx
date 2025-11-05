import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import React from 'react';

const diaries = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    content: 'Đây là nhật ký đầu tiên.',
    image: '',
    time: '2h trước'
  },
  {
    id: '2',
    name: 'Trần Thị B',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    content: 'Check-in Sài Gòn!',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80',
    time: '5h trước'
  },
];

export default function DiaryScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={diaries}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.diaryItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.time}>{item.time}</Text>
              <Text>{item.content}</Text>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.diaryImage} />
              ) : null}
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafd',
    padding: 8,
  },
  diaryItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    marginTop: 5
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  time: {
    color: '#aaaaaa',
    fontSize: 12,
    marginBottom: 5,
  },
  diaryImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 8,
  },
  separator: {
    height: 6,
  },
});
