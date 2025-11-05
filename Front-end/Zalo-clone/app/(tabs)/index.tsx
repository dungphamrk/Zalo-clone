import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';

const chats = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    lastMessage: 'Bạn: Hẹn gặp nhé!',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    time: '15:30',
    phone: '0912345678',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    lastMessage: 'Ok bạn ơi!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    time: '13:25',
    phone: '0987654321',
  },
];

const FILTERS = ['Tất cả', 'Chưa đọc', 'Nhóm'];

export default function MessageScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(0);
  // Animated shadow for search bar
  const shadowAnim = useRef(new Animated.Value(2)).current;

  const filteredChats = chats.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.lastMessage.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.includes(search)
  );

  const animateShadow = (toVal) => {
    Animated.timing(shadowAnim, {
      toValue: toVal,
      duration: 260,
      useNativeDriver: false,
    }).start();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top","left","right"]}>
      <View style={styles.container}>
        {/* Header với icon vector */}
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>Tin nhắn</Text>
          <Pressable style={styles.headerQr}>
            <Feather name="grid" size={24} color="#fff" />
          </Pressable>
          <Pressable style={styles.headerNoti}>
            <Ionicons name="notifications-outline" size={25} color="#fff" />
            <View style={styles.redDot} />
          </Pressable>
        </View>
        {/* Thanh tìm kiếm */}
        <Animated.View
          style={[
            styles.searchBox,
            {
              shadowOpacity: shadowAnim.interpolate({ inputRange: [2, 5], outputRange: [0.02, 0.14] }),
              elevation: shadowAnim,
            },
          ]}
        >
          <Feather name="search" size={19} color="#2994f2" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm kiếm tin nhắn hoặc số điện thoại"
            placeholderTextColor="#7b868c"
            onFocus={() => animateShadow(5)}
            onBlur={() => animateShadow(2)}
          />
        </Animated.View>
        {/* Filter row */}
        <View style={styles.filterRow}>
          {FILTERS.map((x, i) => (
            <Animatable.View
              key={x}
              animation={activeFilter === i ? 'pulse' : undefined}
              duration={320}
              useNativeDriver
              style={{ borderRadius: 10 }}
            >
              <Pressable
                style={[styles.filterBtn, activeFilter === i && styles.filterActive]}
                onPress={() => setActiveFilter(i)}
              >
                <Text
                  style={[
                    styles.filterBtn,
                    activeFilter === i && styles.filterActive,
                    { backgroundColor: 'transparent', paddingHorizontal: 0, paddingVertical: 0 },
                  ]}
                >{x}</Text>
              </Pressable>
            </Animatable.View>
          ))}
        </View>
        {/* Danh sách chat có animation */}
        <FlatList
          data={filteredChats}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <Animatable.View
              animation="fadeInUp"
              delay={index * 80}
              duration={480}
            >
              <Animatable.View
                animation="pulse"
                duration={330}
                useNativeDriver
              >
                <Pressable
                  style={({ pressed }) => [styles.chatItem, pressed && { transform: [{ scale: 0.96 }] }]}
                  onPress={() => router.push('/chat')}
                >
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                  <View style={styles.chatInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.lastMessage}>{item.lastMessage}</Text>
                  </View>
                  <Text style={styles.time}>{item.time}</Text>
                </Pressable>
              </Animatable.View>
            </Animatable.View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#028fe7' },
  container: {
    flex: 1,
    backgroundColor: '#f8fafd',
  },
  headerBox: {
    flexDirection: 'row', alignItems: 'center', height: 60, backgroundColor: '#028fe7',
    paddingHorizontal: 13, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, elevation: 3,
  },
  headerTitle: { color: '#fff', fontSize: 19, fontWeight: 'bold', flex: 1, letterSpacing: 0.7 },
  headerQr: { marginLeft: 2, marginRight: 6 },
  headerNoti: { marginLeft: 8, marginTop:2, position: 'relative' },
  redDot:{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'red', position: 'absolute', top: 2, right: 2, borderColor:'#fff', borderWidth:1 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 17, marginHorizontal: 14, marginTop: 9,
    marginBottom: 6, height: 40, paddingHorizontal: 11, shadowColor:'#111',shadowOpacity:0.03,shadowRadius:3,elevation:1
  },
  searchInput: { flex: 1, fontSize: 15, color: '#222', padding: 0 },

  filterRow: { flexDirection: 'row', marginBottom: 4, marginLeft: 15 },
  filterBtn: {
    fontSize: 14, color: '#2994f2', backgroundColor: '#e4f2fc',
    borderRadius: 10, paddingVertical: 4, paddingHorizontal: 11, marginRight: 7,
  },
  filterActive: {
    backgroundColor: '#2994f2', color: '#fff', fontWeight: 'bold',
  },
  chatItem: {
    flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff',
    marginHorizontal: 9, borderRadius: 13, marginTop: 7
  },
  avatar: {
    width: 54, height: 54, borderRadius: 27, marginRight: 12, backgroundColor: '#eee'
  },
  chatInfo: { flex: 1 },
  userName: {
    fontWeight: 'bold', fontSize: 16, marginBottom: 2,
  },
  lastMessage: {
    color: '#666', fontSize: 14,
  },
  time: {
    color: '#b2b2b2', fontSize: 12, marginLeft: 8,
  },
  separator: { height: 6 },
});
