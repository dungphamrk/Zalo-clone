import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';

export default function LoginScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isLogin]);

  const handleSubmit = () => {
    // Logic đăng nhập/đăng ký
    if (isLogin) {
      // Đăng nhập
      router.replace('/(tabs)');
    } else {
      // Đăng ký
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Zalo */}
          <Animatable.View animation="bounceInDown" duration={800} style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>Z</Text>
            </View>
            <Text style={styles.appName}>Zalo</Text>
          </Animatable.View>

          {/* Form */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Tabs Login/Register */}
            <View style={styles.tabContainer}>
              <Pressable
                style={[styles.tab, isLogin && styles.tabActive]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Đăng nhập</Text>
              </Pressable>
              <Pressable
                style={[styles.tab, !isLogin && styles.tabActive]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Đăng ký</Text>
              </Pressable>
            </View>

            {/* Input Phone */}
            <Animatable.View animation="fadeInLeft" delay={200} style={styles.inputContainer}>
              <Feather name="phone" size={20} color="#2994f2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </Animatable.View>

            {/* Input Name (chỉ khi đăng ký) */}
            {!isLogin && (
              <Animatable.View animation="fadeInLeft" delay={300} style={styles.inputContainer}>
                <Feather name="user" size={20} color="#2994f2" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Họ và tên"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </Animatable.View>
            )}

            {/* Input Password */}
            <Animatable.View animation="fadeInLeft" delay={isLogin ? 300 : 400} style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#2994f2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#999"
                />
              </Pressable>
            </Animatable.View>

            {/* Input Confirm Password (chỉ khi đăng ký) */}
            {!isLogin && (
              <Animatable.View animation="fadeInLeft" delay={500} style={styles.inputContainer}>
                <Feather name="lock" size={20} color="#2994f2" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Xác nhận mật khẩu"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </Animatable.View>
            )}

            {/* Forgot Password (chỉ khi đăng nhập) */}
            {isLogin && (
              <Animatable.View animation="fadeIn" delay={400}>
                <Pressable style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </Pressable>
              </Animatable.View>
            )}

            {/* Submit Button */}
            <Animatable.View animation="bounceIn" delay={isLogin ? 500 : 600}>
              <Pressable
                style={[styles.submitButton, (!phone || !password || (!isLogin && (!name || !confirmPassword))) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!phone || !password || (!isLogin && (!name || !confirmPassword))}
              >
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                </Text>
              </Pressable>
            </Animatable.View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <Animatable.View animation="fadeInUp" delay={600} style={styles.socialContainer}>
              <Pressable style={styles.socialButton}>
                <MaterialCommunityIcons name="facebook" size={24} color="#1877f2" />
                <Text style={styles.socialText}>Facebook</Text>
              </Pressable>
              <Pressable style={styles.socialButton}>
                <MaterialCommunityIcons name="google" size={24} color="#ea4335" />
                <Text style={styles.socialText}>Google</Text>
              </Pressable>
            </Animatable.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafd',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#028fe7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#028fe7',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#028fe7',
    letterSpacing: 1,
  },
  formContainer: {
    width: '100%',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#028fe7',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#028fe7',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#028fe7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#028fe7',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  submitButtonDisabled: {
    backgroundColor: '#b3d9f2',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  socialText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

