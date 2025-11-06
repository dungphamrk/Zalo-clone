import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const wallPosts = [
  {
    id: '1',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    name: 'Bạn A',
    content: 'Hôm nay thật tuyệt vời!',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    time: '1 giờ trước'
  },
  {
    id: '2',
    avatar: 'https://randomuser.me/api/portraits/women/31.jpg',
    name: 'Bạn B',
    content: 'Cũng lâu lắm mình mới đăng ảnh!',
    image: '',
    time: '3 giờ trước'
  }
];

export default function WallScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
      {/* Header xanh và chuông vector, anim bounceIn */}
      <Animatable.View animation="bounceInDown" duration={650} style={styles.headerBox}>
        <Text style={styles.headerTitle}>Tường nhà</Text>
        <Animatable.View animation="bounceIn" delay={150} style={{marginLeft:'auto',position:'relative'}}>
          <Pressable style={{minWidth:36, alignItems:'center', justifyContent:'center'}}>
            <Ionicons name="notifications-outline" size={25} color="#fff" />
            <View style={styles.redDot}/>
          </Pressable>
        </Animatable.View>
      </Animatable.View>
      {/* Khoảnh khắc mới & status */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animatable.View animation="bounceIn" duration={640} delay={110} style={styles.statusContainer}>
          <Pressable style={styles.avatarBox} android_ripple={{color:'#cde7fb'}}>
            <Animatable.View animation="pulse" iterationCount="infinite" duration={2300} style={styles.statusAvatarWrap}>
              <Image source={require('../../assets/images/icon.png')} style={styles.statusAvatar}/>
              <View style={styles.statusAdd}>
                <Feather name="plus" size={15} color="#fff" />
              </View>
            </Animatable.View>
            <Text style={styles.statusText}>Tạo mới</Text>
          </Pressable>
        </Animatable.View>
        {wallPosts.map((post, idx) => (
          <Animatable.View
            key={post.id}
            animation="fadeInUp"
            delay={idx*110+80}
            style={styles.post}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center'}}>
              <Image source={{ uri: post.avatar }} style={styles.avatar} />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.name}>{post.name}</Text>
                <Text style={styles.time}>{post.time}</Text>
              </View>
            </View>
            <Text style={styles.content}>{post.content}</Text>
            {post.image ? (
              <Animatable.Image animation="zoomIn" delay={idx*130+130} source={{ uri: post.image }} style={styles.postImage} />
            ) : null}
          </Animatable.View>
        ))}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#028fe7' },
  container: { flex: 1, backgroundColor: '#f8fafd' },
  headerBox: {
    flexDirection: 'row', alignItems: 'center', height: 60, backgroundColor: '#028fe7',
    paddingHorizontal: 13, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, elevation: 3,
  },
  headerTitle: { color: '#fff', fontSize: 19, fontWeight: 'bold', letterSpacing:0.6 },
  redDot:{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'red', position: 'absolute', top: 4, right: 1, borderColor:'#fff', borderWidth:1 },
  statusContainer: {flexDirection:'row',alignItems:'center',marginTop:14,marginBottom:7,marginLeft:15},
  avatarBox:{alignItems:'center',marginRight:20},
  statusAvatarWrap:{position:'relative'},
  statusAvatar:{width:51,height:51,borderRadius:19,borderWidth:2,borderColor:'#1fc9ae',backgroundColor:'#eee'},
  statusAdd:{position:'absolute',bottom:-2,right:-2,backgroundColor:'#028fe7',width:22,height:22,borderRadius:15,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#fff'},
  statusText:{fontSize:13,marginTop:7,color:'#272',fontWeight:'600'},
  post: {
    backgroundColor: '#fff', borderRadius: 12, padding: 13, marginBottom: 10, marginHorizontal: 12,
    shadowColor: '#aaa', shadowRadius: 4, elevation: 1,
  },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor:'#eee' },
  name: { fontWeight: 'bold', fontSize: 16 },
  time: { color: '#aaaaaa', fontSize: 12 },
  content: { fontSize: 15, marginVertical: 4 },
  postImage: { width: '100%', height: 155, marginTop: 8, borderRadius: 8 },
});

