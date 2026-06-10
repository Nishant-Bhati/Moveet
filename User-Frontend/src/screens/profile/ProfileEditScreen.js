import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../utils/theme';
import { fetchMeThunk } from '../../store/userSlice';
import * as userApi from '../../api/userApi';

export default function ProfileEditScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux profile selectors
  const profile = useSelector((state) => state.user.profile);
  const profileData = profile?.data || profile;

  // Local state fields
  const [firstName, setFirstName] = useState(profileData?.firstName || '');
  const [lastName, setLastName] = useState(profileData?.lastName || '');
  const [email, setEmail] = useState(profileData?.email || '');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [emergencyContact, setEmergencyContact] = useState(null);

  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit Modals visibility
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);
  const [isDobModalVisible, setIsDobModalVisible] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);

  // Modal input field bindings
  const [inputFirstName, setInputFirstName] = useState('');
  const [inputLastName, setInputLastName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputDobDay, setInputDobDay] = useState('');
  const [inputDobMonth, setInputDobMonth] = useState('');
  const [inputDobYear, setInputDobYear] = useState('');
  const [inputContactName, setInputContactName] = useState('');
  const [inputContactPhone, setInputContactPhone] = useState('');
  const [inputContactRelation, setInputContactRelation] = useState('');

  // Initial Sync from Redux
  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.firstName || '');
      setLastName(profileData.lastName || '');
      setEmail(profileData.email || '');
    }
  }, [profileData]);

  // Format Signup Date
  const getMemberSinceDate = () => {
    if (!profileData?.createdAt) return 'December 2022';
    return new Date(profileData.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  // Name Modal save trigger
  const saveName = () => {
    if (!inputFirstName.trim()) {
      Alert.alert('Validation Error', 'First Name cannot be empty.');
      return;
    }
    setFirstName(inputFirstName);
    setLastName(inputLastName);
    setIsNameModalVisible(false);
  };

  // Email Modal save trigger
  const saveEmail = () => {
    if (inputEmail.trim() && !inputEmail.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    setEmail(inputEmail);
    setIsEmailModalVisible(false);
  };

  // Custom DOB validation and save
  const saveDob = () => {
    const day = Number(inputDobDay);
    const month = Number(inputDobMonth);
    const year = Number(inputDobYear);

    if (!inputDobDay || !inputDobMonth || !inputDobYear || isNaN(day) || isNaN(month) || isNaN(year)) {
      Alert.alert('Validation Error', 'Please enter a valid date of birth.');
      return;
    }

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1920 || year > new Date().getFullYear()) {
      Alert.alert('Validation Error', 'Please verify your date parameters.');
      return;
    }

    setDob(`${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`);
    setIsDobModalVisible(false);
  };

  // Emergency contact save trigger
  const saveContact = async () => {
    if (!inputContactName.trim() || !inputContactPhone.trim()) {
      Alert.alert('Validation Error', 'Emergency contact name and phone are required.');
      return;
    }

    const newContact = {
      name: inputContactName.trim(),
      phone: inputContactPhone.trim(),
      relation: inputContactRelation.trim() || 'Emergency Contact',
    };

    setEmergencyContact(newContact);
    setIsContactModalVisible(false);

    // Persist emergency contact on backend
    try {
      await userApi.updateContacts({ contacts: [newContact] });
    } catch (err) {
      console.log('Failed to save contact on backend:', err);
    }
  };

  // Submit profile updates to backend
  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await userApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
      // Synchronize redux store
      await dispatch(fetchMeThunk()).unwrap();
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.message || err || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Profile</Text>

        <TouchableOpacity 
          style={styles.helpPill} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Support')}
        >
          <Text style={styles.helpText}>❓ Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* FIELDS CARD */}
        <View style={styles.card}>
          {/* Name Row */}
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => {
              setInputFirstName(firstName);
              setInputLastName(lastName);
              setIsNameModalVisible(true);
            }}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="person-outline" size={16} color="#555555" />
            </View>
            <View style={styles.rowCenter}>
              <Text style={styles.rowLabel}>Name</Text>
              <Text style={styles.rowValue}>
                {firstName ? `${firstName} ${lastName || ''}` : 'Required'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#555555" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Phone Row (Read-Only) */}
          <View style={[styles.row, styles.readOnlyRow]}>
            <View style={styles.iconCircle}>
              <Ionicons name="call-outline" size={16} color="#555555" />
            </View>
            <View style={styles.rowCenter}>
              <Text style={styles.rowLabel}>Phone Number</Text>
              <Text style={styles.rowValueReadOnly}>{profileData?.phone || 'No phone number'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Email Row */}
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => {
              setInputEmail(email);
              setIsEmailModalVisible(true);
            }}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={16} color="#555555" />
            </View>
            <View style={styles.rowCenter}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>{email || 'Required'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#555555" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Gender Row */}
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => setIsGenderModalVisible(true)}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="transgender-outline" size={16} color="#555555" />
            </View>
            <View style={styles.rowCenter}>
              <Text style={styles.rowLabel}>Gender</Text>
              <Text style={styles.rowValue}>{gender || 'Select Gender'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#555555" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* DOB Row */}
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => {
              setInputDobDay('');
              setInputDobMonth('');
              setInputDobYear('');
              setIsDobModalVisible(true);
            }}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="calendar-outline" size={16} color="#555555" />
            </View>
            <View style={styles.rowCenter}>
              <Text style={styles.rowLabel}>Date of Birth</Text>
              <Text style={[styles.rowValue, !dob && styles.requiredLabel]}>
                {dob || 'Required'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#555555" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Member Since Row (Read-Only) */}
          <View style={[styles.row, styles.readOnlyRow]}>
            <View style={styles.iconCircle}>
              <Ionicons name="trophy-outline" size={16} color="#555555" />
            </View>
            <View style={styles.rowCenter}>
              <Text style={styles.rowLabel}>Member Since</Text>
              <Text style={styles.rowValueReadOnly}>{getMemberSinceDate()}</Text>
            </View>
          </View>
        </View>

        {/* EMERGENCY CONTACT CARD */}
        <View style={styles.emergencyCard}>
          <View style={styles.rowEmergency}>
            <View style={styles.iconCircle}>
              <Ionicons name="alert-circle-outline" size={16} color="#FF4444" />
            </View>
            
            <View style={styles.rowCenter}>
              <Text style={styles.rowLabel}>Emergency contact</Text>
              <Text style={[styles.rowValue, !emergencyContact && styles.requiredLabel]}>
                {emergencyContact
                  ? `${emergencyContact.name} (${emergencyContact.relation}) \n${emergencyContact.phone}`
                  : 'Required'}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setInputContactName(emergencyContact?.name || '');
                setInputContactPhone(emergencyContact?.phone || '');
                setInputContactRelation(emergencyContact?.relation || '');
                setIsContactModalVisible(true);
              }}
            >
              <Text style={styles.addLinkText}>
                {emergencyContact ? 'Edit' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* UPDATE PROFILE BUTTON */}
        <TouchableOpacity
          style={styles.updateBtn}
          activeOpacity={0.8}
          onPress={handleUpdateProfile}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator color="#000000" size="small" />
          ) : (
            <Text style={styles.updateBtnText}>UPDATE PROFILE</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* NAME EDIT MODAL */}
      <Modal
        visible={isNameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="First Name"
              placeholderTextColor="#555555"
              value={inputFirstName}
              onChangeText={setInputFirstName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Last Name"
              placeholderTextColor="#555555"
              value={inputLastName}
              onChangeText={setInputLastName}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setIsNameModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveName}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EMAIL EDIT MODAL */}
      <Modal
        visible={isEmailModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEmailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Email</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Email Address"
              placeholderTextColor="#555555"
              keyboardType="email-address"
              value={inputEmail}
              onChangeText={setInputEmail}
              autoCapitalize="none"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setIsEmailModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveEmail}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* GENDER SELECT MODAL */}
      <Modal
        visible={isGenderModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsGenderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            {['Male', 'Female', 'Other'].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.selectRow}
                onPress={() => {
                  setGender(item);
                  setIsGenderModalVisible(false);
                }}
              >
                <Text style={styles.selectRowText}>{item}</Text>
                {gender === item && <Ionicons name="checkmark" size={18} color="#00E676" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCancelInline} onPress={() => setIsGenderModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DOB SELECT MODAL */}
      <Modal
        visible={isDobModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDobModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Date of Birth</Text>
            
            <View style={styles.dobInputsRow}>
              <TextInput
                style={[styles.modalInput, styles.dobField]}
                placeholder="DD"
                placeholderTextColor="#555555"
                keyboardType="numeric"
                maxLength={2}
                value={inputDobDay}
                onChangeText={setInputDobDay}
              />
              <TextInput
                style={[styles.modalInput, styles.dobField]}
                placeholder="MM"
                placeholderTextColor="#555555"
                keyboardType="numeric"
                maxLength={2}
                value={inputDobMonth}
                onChangeText={setInputDobMonth}
              />
              <TextInput
                style={[styles.modalInput, styles.dobField]}
                placeholder="YYYY"
                placeholderTextColor="#555555"
                keyboardType="numeric"
                maxLength={4}
                value={inputDobYear}
                onChangeText={setInputDobYear}
              />
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setIsDobModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveDob}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EMERGENCY CONTACT MODAL */}
      <Modal
        visible={isContactModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsContactModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Emergency Contact</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Contact Name"
              placeholderTextColor="#555555"
              value={inputContactName}
              onChangeText={setInputContactName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Phone Number"
              placeholderTextColor="#555555"
              keyboardType="phone-pad"
              value={inputContactPhone}
              onChangeText={setInputContactPhone}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Relation (e.g. Spouse, Father)"
              placeholderTextColor="#555555"
              value={inputContactRelation}
              onChangeText={setInputContactRelation}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setIsContactModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveContact}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpPill: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  helpText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  readOnlyRow: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowCenter: {
    flex: 1,
  },
  rowLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  rowValue: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
  },
  rowValueReadOnly: {
    color: '#555555',
    fontSize: 12,
    marginTop: 4,
  },
  requiredLabel: {
    color: '#FFA500',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#222222',
    marginLeft: 60,
  },
  emergencyCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 16,
    marginBottom: spacing.xl,
  },
  rowEmergency: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addLinkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  updateBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 12,
  },
  dobInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dobField: {
    flex: 1,
    textAlign: 'center',
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalSave: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  modalSaveText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  selectRowText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  modalCancelInline: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
});
