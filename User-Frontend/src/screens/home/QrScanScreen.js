import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  TextInput,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../utils/theme';
import * as scooterApi from '../../api/scooterApi';
import { setSelectedScooter } from '../../store/scooterSlice';

export default function QrScanScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Camera & Permissions State
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [scooterCode, setScooterCode] = useState(''); // manual input fallback for simulator
  const [isScanning, setIsScanning] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Vision Camera Hook
  const device = useCameraDevice('back');

  // Debounce scanning mechanism
  const lastScanTime = useRef(0);

  // Animated Scan Line Setup
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Request Camera Permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const status = await Camera.getCameraPermissionStatus();
        if (status === 'granted') {
          setHasPermission(true);
        } else {
          const newStatus = await Camera.requestCameraPermission();
          setHasPermission(newStatus === 'granted');
        }
      } catch (err) {
        console.warn('Camera permission check failed, falling back to simulator:', err);
        setHasPermission(false);
      }
    };

    checkPermission();
  }, []);

  // Frame scanner animation loop
  useEffect(() => {
    const startAnimation = () => {
      scanLineAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 240, // Height of the scan frame
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimation();
  }, [scanLineAnim]);

  // QR Code detected callback
  const handleQrCodeDetected = async (code) => {
    if (!code || isScanning) return;

    const now = Date.now();
    if (now - lastScanTime.current < 2000) {
      return; // 2s Debounce
    }
    lastScanTime.current = now;

    setIsScanning(true);
    setErrorText('');

    try {
      // Fetch scooter details matching the code
      const response = await scooterApi.getScooterByQr(code.trim());
      const scooter = response.data?.data || response.data;

      if (scooter) {
        // Stop camera
        setCameraActive(false);
        // Select scooter in store
        dispatch(setSelectedScooter(scooter));
        // Return to Home with params to auto-open Selected view
        navigation.navigate('MainTabs', {
          screen: 'Home',
          params: { scannedScooterId: scooter._id || scooter.id }
        });
      } else {
        showError('Scooter not found');
      }
    } catch (err) {
      console.error('QR Verification error:', err);
      showError(err.response?.data?.message || 'Scooter not found');
    } finally {
      setIsScanning(false);
    }
  };

  const showError = (msg) => {
    setErrorText(msg);
    setTimeout(() => {
      setErrorText('');
    }, 3000);
  };

  // Configure camera code scanner
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value) {
        handleQrCodeDetected(codes[0].value);
      }
    }
  });

  const renderCameraView = () => {
    if (device && hasPermission) {
      return (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={cameraActive}
          codeScanner={codeScanner}
        />
      );
    }

    // Fallback simulator mock input view
    return (
      <View style={styles.fallbackContainer}>
        <Ionicons name="videocam-off-outline" size={48} color="#555555" />
        <Text style={styles.fallbackText}>Camera not available in simulator</Text>
        
        <View style={styles.mockInputCard}>
          <Text style={styles.mockInputLabel}>ENTER SCOOTER CODE</Text>
          <TextInput
            style={styles.mockInput}
            placeholder="e.g. S-102, Z-010"
            placeholderTextColor="#555555"
            value={scooterCode}
            onChangeText={setScooterCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.mockButton, !scooterCode.trim() && styles.mockButtonDisabled]}
            activeOpacity={0.8}
            onPress={() => handleQrCodeDetected(scooterCode)}
            disabled={!scooterCode.trim() || isScanning}
          >
            {isScanning ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <Text style={styles.mockButtonText}>SIMULATE QR SCAN</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.previewContainer}>
        {renderCameraView()}

        {/* Scan Frame and Dark Overlay Layout */}
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.overlayTop}>
            <Text style={styles.topTitle}>SCAN SCOOTER QR</Text>
          </View>
          
          <View style={styles.overlayRow}>
            <View style={styles.overlaySide} />
            <View style={styles.scanFrame}>
              {/* Green Corner Accents Only */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {/* Animated Scan Line */}
              <Animated.View style={[
                styles.scanLine,
                { transform: [{ translateY: scanLineAnim }] }
              ]} />
            </View>
            <View style={styles.overlaySide} />
          </View>

          <View style={styles.overlayBottom}>
            <Text style={styles.bottomInstruction}>Align QR code within the frame to unlock</Text>
          </View>

          {/* Top-Left Cancel Back Button */}
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Custom Toast Alert */}
          {errorText ? (
            <View style={styles.toastContainer}>
              <Text style={styles.toastText}>⚠️ {errorText}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  topTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  overlayRow: {
    flexDirection: 'row',
    height: 240,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scanFrame: {
    width: 240,
    height: 240,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  overlayBottom: {
    flex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    paddingTop: 30,
  },
  bottomInstruction: {
    color: '#888888',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#00E676',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: '#00E676',
    opacity: 0.8,
  },
  cancelBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 40,
    right: 40,
    backgroundColor: '#2A1010',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  toastText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: 'bold',
  },
  fallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  fallbackText: {
    color: '#888888',
    fontSize: 14,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  mockInputCard: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#222222',
  },
  mockInputLabel: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  mockInput: {
    backgroundColor: '#222222',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#333333',
  },
  mockButton: {
    height: 52,
    backgroundColor: '#00E676',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockButtonDisabled: {
    opacity: 0.5,
  },
  mockButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
