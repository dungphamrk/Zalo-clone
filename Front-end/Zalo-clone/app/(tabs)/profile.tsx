import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const menuData = [
  { icon: <Feather name="cloud" size={21} color="#3fc3fe" />, label: "zCloud", subLabel: "Không gian lưu trữ dữ liệu trên đám mây" },
  { icon: <Feather name="star" size={21} color="#f79338" />, label: "zStyle – Nổi bật trên Zalo", subLabel: "Hình nền & nhạc cho cuộc gọi Zalo" },
  { icon: <Feather name="cloud" size={21} color="#5a9cff" />, label: "Cloud của tôi", subLabel: "Lưu trữ các tin nhắn quan trọng" },
  { icon: <Feather name="folder" size={21} color="#fb728a" />, label: "Dữ liệu trên máy", subLabel: "Quản lý dữ liệu Zalo của bạn" },
  { icon: <AntDesign name="qrcode" size={21} color="#8cba51" />, label: "Ví QR", subLabel: "Lưu trữ & xuất trình các mã QR quan trọng" },
  { icon: <Ionicons name="shield-checkmark-outline" size={21} color="#3fc3fe" />, label: "Tài khoản và bảo mật" },
  { icon: <SimpleLineIcons name="lock" size={21} color="#9057cd" />, label: "Quyền riêng tư" },
];

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafd' }}>
      {/* Header màu xanh với icon vector, bounce */}
      <Animatable.View animation="bounceInDown" duration={650} style={styles.headerBox}>
        <Text style={styles.headerTitle}>Cá nhân</Text>
        <Animatable.View animation="bounceIn" delay={190} style={styles.headerIconBox}>
          <Feather name="settings" size={26} color="#fff" />
          <View style={styles.redDot} />
        </Animatable.View>
      </Animatable.View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Box thông tin user */}
        <Animatable.View animation="fadeInDown" duration={450} delay={90} style={styles.infoBox}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>Dũng Phạm</Text>
            <Text style={styles.status}>Xem trang cá nhân</Text>
          </View>
          <Animatable.View animation="bounceIn" delay={200} style={styles.qrBtn}>
            <AntDesign name="qrcode" size={25} color="#2994f2" />
          </Animatable.View>
        </Animatable.View>
        {/* Danh sách menu động fadeIn stagger */}
        {menuData.map((item, idx) => (
          <Animatable.View key={item.label} animation="fadeInLeft" delay={150+idx*80}>
            <Pressable style={({ pressed }) => [styles.menuItem, pressed && { transform: [{ scale: 0.97 }] }]} android_ripple={{color:'#def6fd'}}>
              <View style={{ width: 27, alignItems: 'center', marginRight: 13 }}>{item.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.subLabel ? <Text style={styles.menuSublabel}>{item.subLabel}</Text> : null}
              </View>
              <Feather name="chevron-right" size={21} color="#bcc5ce" />
            </Pressable>
          </Animatable.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBox:{
    flexDirection:'row', alignItems:'center', height:60, backgroundColor:'#028fe7',
    paddingHorizontal:12, borderBottomLeftRadius:15, borderBottomRightRadius:15,
    elevation:5, shadowColor:'#009', shadowOpacity:0.12, shadowRadius:6,
  },
  headerTitle:{ color:'#fff', fontSize:19, fontWeight:'bold', letterSpacing:0.7, flex:1},
  headerIconBox:{ marginLeft:10, position:'relative'},
  redDot:{ width:8, height:8, borderRadius:4, backgroundColor:'red', position:'absolute', top:4, right:2, borderWidth:1, borderColor:'#fff' },

  infoBox: {
    flexDirection:'row', alignItems:'center', backgroundColor:'#fff',
    borderRadius:14, marginTop:13, marginHorizontal:13, padding:14, shadowColor:'#111',
    shadowOpacity:0.06, shadowRadius:4, elevation:1,
  },
  avatar: { width:54, height:54, borderRadius:27, marginRight:13, backgroundColor:'#eee' },
  userName: { fontWeight:'bold', fontSize:17, color:'#181c2b', marginBottom:2 },
  status: { color:'#028fe7', fontSize:14 },
  qrBtn: { backgroundColor:'#f3f9ff', borderRadius:19, padding:7, marginLeft:7 },

  menuItem:{
    flexDirection:'row', alignItems:'flex-start', backgroundColor:'#fff',
    marginHorizontal:13, marginTop:11, borderRadius:13, paddingVertical:13, paddingHorizontal:10,
    elevation:1, shadowColor:'#666', shadowOpacity:0.06, shadowRadius:3,
  },
  menuLabel:{ fontSize:16, color:'#153', fontWeight:'bold', marginBottom:2},
  menuSublabel:{ fontSize:13, color:'#8895ac', lineHeight:17 },
});
