import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, Pressable, Animated } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const contacts = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    phone: '0912345678',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    phone: '0987654321',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
];

export default function ContactsScreen() {
  const [search, setSearch] = useState('');
  // animated shadow for search box
  const shadowAnim = useRef(new Animated.Value(2)).current;

  const filteredContacts = contacts.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.includes(search)
  );

  const animateShadow = (toVal) => {
    Animated.timing(shadowAnim, {
      toValue: toVal,
      duration: 240,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm với shadow động*/}
      <Animated.View style={[
        styles.searchBox,
        {
          shadowOpacity: shadowAnim.interpolate({ inputRange: [2, 5], outputRange: [0.02, 0.16] }),
          elevation: shadowAnim,
        }
      ]}>
        <Feather name="search" size={20} color="#2994f2" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm kiếm bạn bè hoặc số điện thoại"
          placeholderTextColor="#7b868c"
          onFocus={() => animateShadow(5)}
          onBlur={() => animateShadow(2)}
        />
      </Animated.View>
      {/* Danh sách bạn bè, item fadeInLeft */}
      <FlatList
        data={filteredContacts}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <Animatable.View animation="fadeInLeft" delay={index*60} duration={500}>
            <Pressable
              style={({ pressed }) => [styles.contactItem, pressed && { transform: [{ scale: 0.96 }] }]}
              android_ripple={{color:'#eaf4fb'}}
            >
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={{ flex:1 }}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.phone}>{item.phone}</Text>
              </View>
              <Animatable.View animation="bounceIn" duration={500} delay={index*90+60}>
                <Pressable style={styles.iconBtn}>
                  <Feather name="phone" size={21} color="#2994f2" />
                </Pressable>
              </Animatable.View>
              <Animatable.View animation="bounceIn" duration={600} delay={index*90+155}>
                <Pressable style={styles.iconBtn}>
                  <MaterialIcons name="videocam" size={23} color="#2994f2" />
                </Pressable>
              </Animatable.View>
            </Pressable>
          </Animatable.View>
        )}
        showsVerticalScrollIndicator={false}
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    padding: 0,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 13,
    borderRadius: 13,
    marginTop: 8,
    shadowColor: '#333',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
    backgroundColor: '#e5eaef'
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1c2536'
  },
  phone: {
    color: '#7b868c',
    fontSize: 13,
    marginTop: 2,
  },
  iconBtn: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 14,
  },
});
