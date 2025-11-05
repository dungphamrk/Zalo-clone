import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const features = [
  { key: 'video', label: 'Zalo Video', desc: '[Xem nhiều] Đà Lạt bước vào mùa hoa...', icon: <Feather name="play-circle" size={27} color="#29a0f6" /> },
  { key: 'news', label: 'Trang tin tổng hợp', desc: '', icon: <Feather name="file-text" size={26} color="#fb728a" /> },
  { key: 'game', label: 'Game Center', desc: 'ziCa Bắn Cá, Võ Lâm Truyền Kỳ', icon: <Feather name="crosshair" size={25} color="#3fc3fe" /> },
  { key: 'life', label: 'Dịch vụ đời sống', desc: 'Nạp điện thoại, Tra hoá đơn...', icon: <Feather name="shopping-cart" size={25} color="#ffd76d" /> },
  { key: 'finance', label: 'Tiện ích tài chính', desc: 'Vay nhanh, Hoàn tiền, VN-Index...', icon: <Feather name="dollar-sign" size={25} color="#8cba51" /> },
  { key: 'insurance', label: 'Bảo hiểm online', desc: '', icon: <Feather name="shield" size={26} color="#9057cd" /> },
  { key: 'ai', label: 'Trợ lý Công Dân Số', desc: 'AI hỏi đáp thủ tục hành chính công', icon: <Feather name="cpu" size={24} color="#fb728a" /> },
  { key: 'miniapp', label: 'Mini App', desc: '', icon: <Feather name="layout" size={24} color="#fd9426" /> },
];

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const filtered = features.filter(f => f.label.toLowerCase().includes(search.toLowerCase()));
  return (
    <View style={styles.container}>
      <Animatable.View animation="bounceInDown" duration={550} style={styles.headerBox}>
        <Text style={styles.headerTitle}>Khám phá</Text>
        <Animatable.View animation="bounceIn" delay={100}>
          <AntDesign name="qrcode" size={26} color="#fff" />
        </Animatable.View>
      </Animatable.View>
      <Animatable.View animation="fadeInDown" duration={400} delay={90} style={styles.searchBox}>
        <Feather name="search" size={19} color="#2994f2" style={{ marginRight: 8 }} />
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Tìm kiếm dịch vụ, tiện ích..." placeholderTextColor="#7b868c" />
      </Animatable.View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.key}
        renderItem={({ item, index }) => (
          <Animatable.View animation="fadeInLeft" delay={index*70+100}>
            <Pressable style={({ pressed }) => [styles.featureBox, pressed && { transform:[{scale:0.97}] }]} android_ripple={{color:'#e0f4fa'}}>
              <Animatable.View animation="bounceIn" delay={index*110+140} style={styles.featureIconBox}>{item.icon}</Animatable.View>
              <View style={{ flex:1 }}>
                <Text style={styles.label}>{item.label}</Text>
                {!!item.desc && <Text style={styles.desc}>{item.desc}</Text>}
              </View>
              <Feather name="chevron-right" size={20} color="#adb5bd" />
            </Pressable>
          </Animatable.View>
        )}
        style={{ marginTop: 7 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafd' },
  headerBox: {
    flexDirection: 'row', alignItems: 'center', height: 60, backgroundColor: '#028fe7',
    paddingHorizontal: 13, elevation: 3, borderBottomLeftRadius: 18, borderBottomRightRadius: 18
  },
  headerTitle: { color: '#fff', fontSize: 19, fontWeight: 'bold', letterSpacing: 0.7, flex:0 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, marginHorizontal: 13, height: 42, marginTop:10,
    marginBottom: 8, paddingHorizontal: 13, shadowColor: '#333', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#222'},
  featureBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 15, paddingVertical: 13, paddingHorizontal: 10,
    marginHorizontal: 13, marginVertical:7, elevation: 2, shadowColor: '#aaa', shadowOpacity: 0.10, shadowRadius:3
  },
  featureIconBox:{width:32,alignItems:'center',marginRight:15},
  label: { fontSize: 16, color: '#153', fontWeight: 'bold', marginBottom: 2 },
  desc: { fontSize: 13, color: '#789', marginTop: -2 },
});
