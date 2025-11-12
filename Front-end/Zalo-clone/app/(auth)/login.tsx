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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import { useLogin, useRegisterMutation } from '@/hooks/auth/useAuth';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegisterMutation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    // Reset inputs khi chuyển tab
    setUsername('');
    setPassword('');
    setDisplayName('');
    setConfirmPassword('');

    // Hiệu ứng chuyển đổi (fade và slide)
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
    console.log(111);
    
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại và mật khẩu.');
      return;
    }

    if (isLogin) {
      loginMutation.mutate(
        { username, password },
        {
          onError: (err) => {
            Alert.alert('Đăng nhập thất bại', (err as Error)?.message ?? 'Lỗi không xác định');
          },
        }
      );
    } else {
      if (!displayName) {
        Alert.alert('Lỗi', 'Vui lòng nhập họ và tên.');
        return;
      }
      if (!confirmPassword) {
        Alert.alert('Lỗi', 'Vui lòng xác nhận mật khẩu.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu và xác nhận mật khẩu không khớp.');
        return;
      }
      console.log(username, displayName, password);

      registerMutation.mutate(
        { username, displayName, password },
        {
          onError: (err) => {
            Alert.alert('Đăng ký thất bại', (err as Error)?.message ?? 'Lỗi không xác định');
          },
        }
      );
    }
  };

  const isFormValid = isLogin 
    ? (!!username && !!password) 
    : (!!username && !!password && !!displayName && !!confirmPassword);


  // Hàm render Input với style động
  const renderInput = (
    name: string,
    iconName: keyof typeof Feather.glyphMap,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    isSecure: boolean = false,
    keyboardType: 'default' | 'phone-pad' = 'default'
  ) => (
    <Animatable.View 
      animation="fadeInUp" 
      delay={name === 'username' ? 200 : (name === 'name' ? 300 : (name === 'password' ? 400 : 500))} 
      style={[
        styles.inputContainer,
        focusedInput === name && styles.inputContainerFocused, // Viền xanh khi focus
      ]}
    >
      <Feather name={iconName} size={20} color={focusedInput === name ? '#028fe7' : '#999'} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#a0a0a0"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecure && !showPassword}
        keyboardType={keyboardType}
        autoCapitalize={name === 'name' ? 'words' : 'none'}
        onFocus={() => setFocusedInput(name)}
        onBlur={() => setFocusedInput(null)}
      />
      {name.includes('password') && (
        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Feather
            name={showPassword ? 'eye' : 'eye-off'}
            size={20}
            color="#999"
          />
        </Pressable>
      )}
    </Animatable.View>
  );

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
            <Text style={styles.appName}>Kết nối bạn bè</Text> 
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
            {/* Tabs Login/Register (Style gọn gàng hơn) */}
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

            {/* Input Fields */}
            {renderInput('username', 'phone', 'Số điện thoại', username, setUsername, false, 'phone-pad')}
            
            {!isLogin && renderInput('name', 'user', 'Họ và tên', displayName, setDisplayName, false)}

            {renderInput('password', 'lock', 'Mật khẩu', password, setPassword, true)}

            {!isLogin && renderInput('confirmPassword', 'lock', 'Xác nhận mật khẩu', confirmPassword, setConfirmPassword, true)}


            {/* Forgot Password (chỉ khi đăng nhập) */}
            {isLogin && (
              <Animatable.View animation="fadeIn" delay={500}>
                <Pressable style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </Pressable>
              </Animatable.View>
            )}

            {/* Submit Button */}
            <Animatable.View animation="bounceIn" delay={isLogin ? 600 : 700}>
              <Pressable
                style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!isFormValid}
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
            <Animatable.View animation="fadeInUp" delay={800} style={styles.socialContainer}>
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

// =================================================================
// STYLES (Cập nhật để hiện đại hóa)
// =================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Nền trắng tinh khôi
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28, // Tăng padding ngang
    paddingTop: 60, // Tăng khoảng cách trên
    paddingBottom: 40,
  },
  
  // --- Logo Section ---
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 80, // Nhỏ gọn hơn
    height: 80,
    borderRadius: 40,
    backgroundColor: '#028fe7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8, // Giảm khoảng cách
    // Shadow tinh tế hơn
    shadowColor: '#028fe7',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '800', // Đậm hơn
    color: '#fff',
  },
  appName: {
    fontSize: 20, // Kích thước phụ đề nhỏ hơn
    fontWeight: '600',
    color: '#028fe7',
    letterSpacing: 0.5,
  },

  // --- Form & Tabs ---
  formContainer: {
    width: '100%',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f8fb', // Nền tab nhẹ nhàng hơn
    borderRadius: 14,
    padding: 3,
    marginBottom: 35,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#028fe7',
    // Shadow nhẹ cho tab active
    shadowColor: '#028fe7',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#667480', // Màu xám đậm
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // --- Input Fields (Minimalist) ---
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fefefe', // Gần như trắng
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 58,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e0eaf3', // Viền mỏng, xám nhạt
    shadowColor: '#000',
    shadowOpacity: 0.03, // Shadow siêu nhẹ
    shadowRadius: 5,
    elevation: 1,
  },
  inputContainerFocused: {
    borderColor: '#028fe7', // Viền xanh khi focus
    backgroundColor: '#fff',
    shadowOpacity: 0.08, // Tăng shadow nhẹ khi focus
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
  },
  
  // --- Forgot Password ---
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 15,
    color: '#028fe7',
    fontWeight: '600',
  },

  // --- Submit Button ---
  submitButton: {
    backgroundColor: '#028fe7',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    elevation: 6,
    shadowColor: '#028fe7',
    shadowOpacity: 0.4, // Shadow nổi bật hơn cho nút chính
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  submitButtonDisabled: {
    backgroundColor: '#b3d9f2',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '800', // Rất đậm
    color: '#fff',
    letterSpacing: 0.5,
  },

  // --- Divider ---
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#a0a0a0',
  },

  // --- Social Login ---
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e0eaf3',
    gap: 10,
    // Shadow tinh tế
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  socialText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#444',
  },
});