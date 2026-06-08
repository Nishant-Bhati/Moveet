Phase 1 — Project Setup, Navigation Shell & Redux Store
Step 1.1 — Scaffold the Project
Prompt to IDE:
Create a new React Native project called "moveet" using React Native CLI (not Expo).
Set up this exact folder structure:

src/
  api/           (axios instance + all API call functions)
  assets/        (fonts, images, icons)
  components/    (shared reusable components)
  navigation/    (stack and tab navigators)
  screens/       (one folder per screen)
  store/         (Redux Toolkit slices and store)
  utils/         (helpers, constants, formatters)
  hooks/         (custom hooks)

Install these dependencies:
  @reduxjs/toolkit react-redux
  @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
  react-native-screens react-native-safe-area-context
  axios
  react-native-async-storage/async-storage
  react-native-vector-icons
  react-native-maps
  react-native-permissions
  react-native-image-picker
  @react-native-community/netinfo

Create src/utils/constants.js with:
  BASE_URL: 'http://YOUR_LOCAL_IP:5000' (add a comment to replace with production URL)
  OTP_FIXED_DEV: '123456'

Create src/api/axiosInstance.js:
  Axios instance with baseURL from constants.
  Request interceptor: read token from AsyncStorage and attach as Authorization: Bearer <token>.
  Response interceptor: if 401, clear AsyncStorage token and dispatch logout action (import store for this).

Create src/store/store.js:
  Configure Redux store with these slices (stub them for now): authSlice, userSlice, scooterSlice, rideSlice, paymentSlice, notificationSlice.

Create src/store/authSlice.js:
  State: { token: null, isAuthenticated: false, isLoading: false, error: null }
  Actions: setToken, logout, setLoading, setError

Create src/store/userSlice.js:
  State: { profile: null, isLoading: false }
  Actions: setProfile, clearProfile

Create src/utils/storage.js:
  Helper functions: saveToken(token), getToken(), clearToken() using AsyncStorage.
🛠 Manual step: Run npx react-native run-android (or run-ios). Confirm the default RN screen appears. Replace YOUR_LOCAL_IP in constants.js with your machine's local network IP so the device/emulator can hit your Express backend.

Step 1.2 — Navigation Shell
Prompt to IDE:
Set up the full React Native navigation structure in src/navigation/.

Create src/navigation/AuthNavigator.js:
  Native Stack Navigator with these screens:
    - SplashScreen (initial)
    - LoginScreen
    - OtpScreen
    - KycFormScreen
    - KycPendingScreen

Create src/navigation/AppNavigator.js:
  Bottom Tab Navigator with these tabs:
    - HomeScreen (icon: home)
    - MyScooterScreen (icon: bicycle or scooter)
    - PaymentsScreen (icon: wallet)
    - ProfileScreen (icon: person)

Create src/navigation/RootNavigator.js:
  - On mount, check AsyncStorage for a saved token.
  - If token exists AND user profile is loaded: show AppNavigator.
  - Otherwise: show AuthNavigator.
  - Use Redux state: auth.isAuthenticated to switch between navigators.
  - Wrap everything in NavigationContainer.

Update App.js:
  Wrap with <Provider store={store}> and render <RootNavigator />.

Create stub screen files (just a View + Text with screen name) for every screen listed above so navigation compiles without errors:
  src/screens/auth/SplashScreen.js
  src/screens/auth/LoginScreen.js
  src/screens/auth/OtpScreen.js
  src/screens/auth/KycFormScreen.js
  src/screens/auth/KycPendingScreen.js
  src/screens/home/HomeScreen.js
  src/screens/scooter/MyScooterScreen.js
  src/screens/payments/PaymentsScreen.js
  src/screens/profile/ProfileScreen.js
🛠 Manual step: Run the app. Confirm the bottom tab bar appears with 4 tabs and you can navigate between stubs without crashes.

Phase 2 — Auth Flow (Login → OTP → Token Storage)
Step 2.1 — Auth API and Slice
Prompt to IDE:
Build the full auth flow.

src/api/authApi.js:
  sendOtp(phone): POST /auth/login with { phone }
  verifyOtp(phone, otp): POST /auth/verify with { phone, otp }
    Returns { token, user } on success.

Update src/store/authSlice.js:
  Add async thunks using createAsyncThunk:
    sendOtpThunk(phone): calls authApi.sendOtp. Sets isLoading true during call.
    verifyOtpThunk({ phone, otp }): calls authApi.verifyOtp.
      On success: saves token via storage.saveToken(token), sets state.token and state.isAuthenticated = true.
      On failure: sets state.error.
  Add extraReducers handling pending/fulfilled/rejected for both thunks.
  Add logout action: clears token from AsyncStorage, resets state to initial.

Also create src/store/userSlice.js with:
  Async thunk fetchMeThunk(): calls GET /user/me via axiosInstance.
    On success: sets state.profile with the full user object.
  State shape: { profile: null, isLoading: false, error: null }

Step 2.2 — Splash Screen
Prompt to IDE:
Build src/screens/auth/SplashScreen.js.

On mount:
  1. Check AsyncStorage for token using storage.getToken().
  2. If token found: dispatch fetchMeThunk(). On success navigate to App (RootNavigator handles this via isAuthenticated). On failure (token expired): dispatch logout() then navigate to LoginScreen.
  3. If no token: navigate to LoginScreen after a 1.5s delay.

UI:
  Full screen. Dark background (#0D0D0D).
  Moveet logo text centered (large bold font, green color #00C853).
  Tagline: "Smart Rental Ride" in small gray text below.
  Small activity indicator at bottom center during token check.
  No back button.

Step 2.3 — Login Screen
Prompt to IDE:
Build src/screens/auth/LoginScreen.js.

UI (design: clean dark theme, green accent #00C853, Poppins-style font):
  - Moveet logo at top center.
  - Heading: "Enter your mobile number"
  - Subtext: "We'll send you a verification code"
  - TextInput: phone number, keyboardType="phone-pad", maxLength=10.
    Styled with a bottom border only. Country code "+91" prefix shown.
  - Large rounded green button: "Send OTP"
  - Disabled state when phone.length !== 10.

Logic:
  - On button press: dispatch sendOtpThunk(phone).
  - Show ActivityIndicator inside button while isLoading.
  - On success: navigate to OtpScreen passing phone as route param.
  - On error: show error message below the input.
  - Validate phone is exactly 10 digits before dispatching.

Step 2.4 — OTP Screen
Prompt to IDE:
Build src/screens/auth/OtpScreen.js.

UI:
  - Back button (navigate back to LoginScreen).
  - Heading: "Verify your number"
  - Subtext: "OTP sent to +91 {phone}" (phone from route.params).
  - 6-box OTP input: render 6 individual TextInput boxes side by side.
    Auto-focus next box on input. Auto-focus prev box on backspace.
    Each box: 48x48, bordered, centered text, large font.
  - Large rounded green button: "Verify OTP". Disabled until 6 digits entered.
  - "Resend OTP" text link (active after 30s countdown timer).

Logic:
  - On verify press: dispatch verifyOtpThunk({ phone, otp: otp.join('') }).
  - On success: check user.kycStatus from returned profile.
    If kycStatus === 'NOT_STARTED' → navigate to KycFormScreen.
    If kycStatus === 'PENDING' → navigate to KycPendingScreen.
    If kycStatus === 'APPROVED' → RootNavigator switches to AppNavigator automatically.
  - On error: shake animation on OTP boxes + show error text.
  - On resend: dispatch sendOtpThunk(phone) again, reset 30s timer.
🛠 Manual step: Test the full auth flow end-to-end:

Enter any 10-digit phone → tap Send OTP.
Enter 123456 (dev OTP) → tap Verify.
Confirm Redux DevTools (Flipper) shows isAuthenticated: true and profile is populated.
Confirm navigation moves to KycFormScreen (first-time user).


Phase 3 — KYC Flow
Step 3.1 — KYC Form Screen
Prompt to IDE:
Build src/screens/auth/KycFormScreen.js.

This screen submits Aadhaar and DL numbers (text fields only — no file upload yet).

UI:
  - Header: "Complete KYC" with a subtitle "Required to start riding"
  - ScrollView form with these fields:
      First Name (TextInput) — pre-filled from Redux userSlice.profile if available
      Last Name (TextInput) — pre-filled
      Email (TextInput, keyboardType=email-address)
      Aadhaar Number (TextInput, keyboardType=number-pad, maxLength=12)
      Driving License Number (TextInput, autoCapitalize=characters)
  - Large rounded green button: "Submit & Continue"
  - Show validation errors inline below each field.

Logic:
  Create src/api/kycApi.js:
    submitKyc(data): POST /kyc/submit with { aadhaarNumber, dlNumber }
    getKycStatus(): GET /kyc/status

  Also call POST /user/profile with { firstName, lastName, email } to save profile.

  On submit:
    1. Validate all fields (aadhaar = 12 digits, DL min 5 chars).
    2. Call userApi.updateProfile({ firstName, lastName, email }).
    3. Call kycApi.submitKyc({ aadhaarNumber, dlNumber }).
    4. On success: dispatch fetchMeThunk() to refresh profile, navigate to KycPendingScreen.
    5. Show loading state on button during submission.
    6. Show error toast/alert on failure.

Step 3.2 — KYC Pending Screen
Prompt to IDE:
Build src/screens/auth/KycPendingScreen.js.

UI:
  - Full screen centered layout.
  - Large animated icon: a clock or document icon (use react-native-vector-icons, green).
  - Heading: "KYC Under Review"
  - Subtext: "Our team is verifying your documents. This usually takes a few minutes."
  - Status badge showing current kycStatus from Redux userSlice.profile.kycStatus.
    Color: orange for PENDING, red for REJECTED, green for APPROVED.
  - If REJECTED: show a "Re-submit KYC" button that navigates back to KycFormScreen.
  - If APPROVED: show a "Start Riding →" button that navigates to AppNavigator.
  - "Refresh Status" button at bottom: calls kycApi.getKycStatus(), dispatches fetchMeThunk().
  - On mount: poll kycStatus every 15 seconds (use useEffect + setInterval, clear on unmount).

Note: once kycStatus is APPROVED and user is authenticated, RootNavigator should automatically
show AppNavigator. Handle this in RootNavigator by also checking profile.kycStatus.
🛠 Manual step: Manually update a user's kycStatus to APPROVED in MongoDB Compass. Tap "Refresh Status" on the KycPendingScreen and confirm the app navigates to the HomeScreen.

Phase 4 — Home Screen (Map + Nearby Scooters)
Step 4.1 — Scooter API and Slice
Prompt to IDE:
Create src/api/scooterApi.js:
  getNearbyScooters(lat, lng): GET /scooters/nearby?lat={lat}&lng={lng}
  getScooterById(id): GET /scooters/{id}
  getScooterByQr(qrCode): GET /scooters/qr/{qrCode}
  getFleetSummary(): GET /scooters/fleet-summary

Create src/store/scooterSlice.js:
  State: { nearbyScooters: [], selectedScooter: null, isLoading: false, error: null }
  Async thunks:
    fetchNearbyScooters({ lat, lng }): calls getNearbyScooters
    fetchScooterById(id): calls getScooterById
  Reducers: setSelectedScooter(scooter), clearSelectedScooter

Register scooterSlice in src/store/store.js.

Step 4.2 — Home Screen
Prompt to IDE:
Build src/screens/home/HomeScreen.js.

UI Layout:
  Top bar (absolute, over map):
    - Left: "Hi, {firstName} 👋" (from Redux userSlice.profile)
    - Right: wallet balance chip "₹{walletBalance}" with a wallet icon (green bg).

  Full-screen MapView (react-native-maps):
    - initialRegion: user's current location.
    - Custom marker for each nearby scooter from Redux scooterSlice.nearbyScooters:
        Green marker if status === 'AVAILABLE'.
        Gray marker if status !== 'AVAILABLE'.
    - Show user's current location dot.
    - On marker press: show scooter bottom sheet (see below).

  Bottom Sheet (modal-like, slides up on scooter marker press):
    - Scooter code (e.g. "Z-010"), model name
    - Battery bar + percentage
    - Status badge
    - Pricing: "₹{minutely}/min or ₹{daily}/day"
    - Signal strength, odometer
    - Large green button: "Start Ride" (disabled if status !== 'AVAILABLE')
    - X button to dismiss

  Bottom: QR scan FAB button (floating, bottom-right, green circle, QR icon).
    On press: navigate to QrScanScreen (create stub).

Logic:
  - On mount: request location permission using react-native-permissions.
  - On permission granted: get current position using Geolocation.getCurrentPosition.
  - Dispatch fetchNearbyScooters({ lat, lng }).
  - Refresh scooters every 30 seconds (setInterval, clear on unmount).
  - Pull-to-refresh on the map area: re-fetch scooters.
  - "Start Ride" button → dispatch startRideThunk(scooterId) from rideSlice.

Step 4.3 — QR Scan Screen (stub + logic)
Prompt to IDE:
Create src/screens/home/QrScanScreen.js.

Install: react-native-camera or react-native-vision-camera for QR scanning.
If camera permission is denied, show a message with a Settings deep-link button.

UI:
  - Full-screen camera view.
  - Overlay: a square scanner frame (animated border, green).
  - Text: "Point at scooter QR code"
  - Cancel button (top-left, navigates back).

Logic:
  - On QR code detected (barcode type): extract the code value.
  - Call scooterApi.getScooterByQr(code).
  - On success: dispatch setSelectedScooter(scooter), navigate back to HomeScreen
    and auto-open the scooter bottom sheet by passing scooter as navigation param.
  - On failure: show "Scooter not found" toast and allow re-scan.
  - Debounce scan (only trigger once per 2 seconds to avoid double-calls).
🛠 Manual step: Open the app on a real/virtual device with location enabled. Confirm scooter markers appear on the map around coordinates 28.019, 77.240 (the IoT simulator location). Tap a marker and confirm the bottom sheet slides up with real scooter data.

Phase 5 — Ride Flow
Step 5.1 — Ride API and Slice
Prompt to IDE:
Create src/api/rideApi.js:
  startRide(scooterId): POST /rides/start with { scooterId }
  getActiveRide(): GET /rides/active
  endRide(): POST /rides/end
  getRideHistory(): GET /rides/history

Create src/store/rideSlice.js:
  State: { activeRide: null, rideHistory: [], isLoading: false, error: null, rideEnded: null }
  Async thunks:
    startRideThunk(scooterId): calls startRide. On success sets activeRide.
    fetchActiveRideThunk(): calls getActiveRide. Sets activeRide (or null).
    endRideThunk(): calls endRide. On success: sets rideEnded to the completed ride data, clears activeRide, dispatches fetchMeThunk (to update wallet balance in header).
    fetchRideHistoryThunk(): calls getRideHistory. Sets rideHistory.
  Extra reducer: handle 'You already have an active ride' error — set error message.

Register rideSlice in store.js.

Step 5.2 — Active Ride Screen
Prompt to IDE:
Create src/screens/ride/ActiveRideScreen.js.

This screen appears when a ride is active. Navigate to it from HomeScreen after startRide succeeds.
Use a native stack push so the user can't go back to HomeScreen mid-ride (set gestureEnabled: false).

UI:
  - Dark full-screen layout.
  - Top: Scooter code + model (from activeRide.scooterId).
  - Center card showing:
      Live ride timer: counts up from 0 using setInterval every second.
      Formatted as "mm:ss" or "h:mm:ss".
      Current estimated cost (calculate locally: Math.ceil(elapsedSeconds / 60) * minutely pricing).
      Shows ₹0 if user has an active plan (check userSlice.profile.activePlanId).
  - Battery bar of the scooter.
  - Large RED button at bottom: "End Ride"
  - On "End Ride" press: show confirmation Alert: "End this ride? You'll be charged ₹X."
    If confirmed: dispatch endRideThunk().

On endRide success:
  Navigate to RideSummaryScreen passing the completed ride data.

On mount:
  dispatch fetchActiveRideThunk() to re-sync if screen is re-opened.
  If null is returned (no active ride), navigate back to HomeScreen.

Step 5.3 — Ride Summary Screen
Prompt to IDE:
Create src/screens/ride/RideSummaryScreen.js.

This screen is shown after endRide completes. No back gesture (replace stack).

UI:
  - Large animated green checkmark at top (use Animated API, scale from 0 to 1).
  - Heading: "Ride Complete!"
  - Summary card:
      Duration: formatted (e.g. "12 min 30 sec")
      Distance: distanceKm if available, else "—"
      Cost: "₹{cost}" in large text (or "₹0 — Plan Active" if cost is 0)
      Scooter: scooter code
      Date/time
  - Wallet balance after ride (from userSlice.profile.walletBalance — re-fetch on mount).
  - Large green button: "Done" → navigates to HomeScreen (reset stack).
  - Secondary link: "View History" → navigates to RideHistoryScreen.

Step 5.4 — My Scooter Tab Screen
Prompt to IDE:
Build src/screens/scooter/MyScooterScreen.js (this is one of the bottom tab screens).

On mount: dispatch fetchActiveRideThunk().

State A — No Active Ride:
  - Illustration/icon of a scooter (gray, locked).
  - Text: "No active ride"
  - Subtext: "Go to the map and scan a scooter's QR code to start riding."
  - Button: "Find a Scooter" → navigates to HomeScreen tab.

State B — Active Ride in progress:
  - Show the active scooter's details:
      Code, model, battery bar.
      Ride timer (counts up, same logic as ActiveRideScreen).
      Estimated cost.
      isLocked status badge.
      signalStrength and odometer.
  - "End Ride" button (same flow as ActiveRideScreen).

Both states:
  Pull-to-refresh to re-fetch active ride.
🛠 Manual step: Start a ride via the HomeScreen bottom sheet. Confirm the MyScooter tab shows the active ride with a live timer. End the ride and confirm the RideSummaryScreen shows correct duration and cost. Check Redux DevTools that rideSlice.activeRide becomes null after ending.

Phase 6 — Payments Screen
Step 6.1 — Payment API and Slice
Prompt to IDE:
Create src/api/paymentApi.js:
  getPlans(): GET /payments/plans
  getTopupPresets(): GET /payments/topup-presets
  purchaseTopup(amount): POST /payments/purchase with { amount }
  verifyTopup(data): POST /payments/verify with { razorpayOrderId, razorpayPaymentId, razorpaySignature }
  subscribePlan(planId): POST /payments/subscribe with { planId }
  cancelSubscription(): POST /payments/cancel
  getTransactions(): GET /payments/transactions

Create src/store/paymentSlice.js:
  State: { plans: [], topupPresets: [], transactions: [], isLoading: false, error: null }
  Async thunks:
    fetchPlansThunk(): fetches plans + topup presets in parallel (Promise.all).
    subscribePlanThunk(planId): calls subscribePlan. On success: dispatches fetchMeThunk() to update wallet + planId in profile.
    cancelSubscriptionThunk(): calls cancelSubscription. Dispatches fetchMeThunk().
    fetchTransactionsThunk(): fetches and sets transactions.
    purchaseTopupThunk(amount): calls purchaseTopup. Returns orderId for Razorpay SDK.

Register paymentSlice in store.js.

Step 6.2 — Payments Screen
Prompt to IDE:
Build src/screens/payments/PaymentsScreen.js.

Install: react-native-razorpay for payment gateway integration.

On mount: dispatch fetchPlansThunk() and fetchTransactionsThunk().

UI — ScrollView with sections:

Section 1: Wallet Card
  - Large card: "Wallet Balance" label + "₹{walletBalance}" in big bold green text.
  - "Add Money" button opens TopupBottomSheet.

Section 2: Current Plan
  If activePlanId is set AND planExpiryDate > now:
    - Plan name badge (e.g. "Daily Plan — Active").
    - Expiry: "Valid until {date}".
    - autoRenew toggle (on/off).
    - "Cancel Plan" link (confirmation alert before calling cancelSubscriptionThunk).
  Else:
    - "No active plan" message.
    - Subtext: "Activate a plan to ride without per-minute charges."

Section 3: Plans List
  - Map over plans from Redux. Each plan card:
      Plan name, subtitle (e.g. "7 DAYS • UNLIMITED"), price label.
      Features list (bullet points).
      "Activate — ₹{price}" button.
      Disabled + "Active" badge if this is the current activePlanId.
  - On Activate press: check walletBalance >= plan.price.
    If sufficient: show confirmation Alert → dispatch subscribePlanThunk(planId).
    If insufficient: show Alert "Insufficient balance. Add money first." with "Add Money" CTA.

Section 4: Transaction History
  - Heading: "Recent Transactions"
  - FlatList of transactions: each row shows direction icon (↑ CREDIT green / ↓ DEBIT red),
    description, amount, date.
  - Show last 10; "View All" link loads more.

TopupBottomSheet (modal):
  - Preset buttons: ₹100, ₹500, ₹1000 (from topupPresets).
  - Custom amount TextInput (optional).
  - "Pay with Razorpay" button.
  - On press: dispatch purchaseTopupThunk(amount) → get orderId.
    Then open Razorpay checkout with:
      { key: RAZORPAY_KEY_ID, amount: amount * 100, currency: 'INR', order_id: orderId,
        name: 'Moveet', description: 'Wallet Top-up', prefill: { contact: phone } }
    In Razorpay onSuccess callback: call paymentApi.verifyTopup({ razorpayOrderId, razorpayPaymentId, razorpaySignature }).
    On verify success: dispatch fetchMeThunk() → show success toast "₹X added to wallet!".
    On failure: show error toast.
🛠 Manual step: Activate a plan from the Payments screen using wallet balance. Confirm activePlanId and planExpiryDate are set in Redux. Start and end a ride — confirm cost shows ₹0 on the RideSummaryScreen. Then cancel the plan and ride again to confirm per-minute billing resumes.

Phase 7 — Profile Screen & Notifications
Step 7.1 — Notification API and Slice
Prompt to IDE:
Create src/api/notificationApi.js:
  getNotifications(): GET /notifications
  markAsRead(id): PATCH /notifications/{id}/read
  markAllAsRead(): PATCH /notifications/read-all

Create src/store/notificationSlice.js:
  State: { notifications: [], unreadCount: 0, isLoading: false }
  Async thunks:
    fetchNotificationsThunk(): fetches and sets notifications. Calculates unreadCount.
    markAsReadThunk(id): marks one as read, updates local state.
    markAllAsReadThunk(): marks all read, sets unreadCount = 0.

Register in store.js.

Update src/navigation/AppNavigator.js:
  Show a red badge on the notifications icon (or on a bell icon in the header) when unreadCount > 0.
  Fetch notifications on app focus using useIsFocused or AppState listener.

Step 7.2 — Profile Screen
Prompt to IDE:
Build src/screens/profile/ProfileScreen.js.

On mount: dispatch fetchMeThunk() and fetchNotificationsThunk().

UI — ScrollView:

Section 1: User Card
  - Avatar circle with initials (firstName[0] + lastName[0]), green background.
  - Name, User ID (publicUserId), phone number.
  - KYC status badge (green APPROVED / orange PENDING / red REJECTED).

Section 2: Notifications Bell
  - Row: "Notifications" label + unread count badge.
  - Chevron → navigates to NotificationsScreen.

Section 3: Edit Profile
  - Tappable rows for: Name, Email.
  - On tap: open an inline edit modal (bottom sheet with TextInput + Save button).
  - On save: call userApi.updateProfile(data) + dispatch fetchMeThunk().

Section 4: Preferences
  - Toggle row: "Location Sharing" (locationSharing boolean from profile).
  - Toggle row: "Auto Renew Plan" (autoRenew boolean).
  - On toggle: call POST /user/update-preferences or POST /user/toggle-auto-renew.
  - Dispatch fetchMeThunk() after change.

Section 5: Ride History
  - "My Rides" row → chevron → navigates to RideHistoryScreen.

Section 6: Support
  - "Contact Support" row → navigates to SupportScreen.

Section 7: Account
  - "Logout" button (red text). On press: confirmation Alert → dispatch logout() → AsyncStorage.clearToken() → navigate to AuthNavigator.

Create src/api/userApi.js:
  getMe(): GET /user/me
  updateProfile(data): POST /user/profile with { firstName, lastName, email }
  updatePreferences(data): POST /user/update-preferences
  toggleAutoRenew(): POST /user/toggle-auto-renew

Step 7.3 — Notifications Screen
Prompt to IDE:
Create src/screens/profile/NotificationsScreen.js.

On mount: dispatch fetchNotificationsThunk().

UI:
  - FlatList of notifications.
  - Each notification row:
      Left: colored icon based on type (INFO=blue, SUCCESS=green, WARNING=orange, ERROR=red).
      Center: title (bold if unread), message (gray, 2 lines), date (relative: "2 min ago").
      Unread indicator: green dot on right if isRead === false.
      Background: slightly lighter for unread items.
  - On row press: dispatch markAsReadThunk(id). Row fades to "read" style.
  - "Mark All as Read" button in header (only visible if unreadCount > 0).
  - Empty state: illustration + "No notifications yet".
  - Pull-to-refresh.

Step 7.4 — Ride History Screen
Prompt to IDE:
Create src/screens/profile/RideHistoryScreen.js.

On mount: dispatch fetchRideHistoryThunk().

UI:
  - FlatList of completed rides (from rideSlice.rideHistory).
  - Each ride card:
      Date + time of ride.
      Duration: "{X} min" formatted.
      Cost: "₹{cost}" or "Free (Plan)" if cost === 0.
      Scooter code.
      Left accent bar: green.
  - Empty state: "No rides yet. Start your first ride!"
  - Pull-to-refresh.
  - Skeleton loading placeholders while isLoading is true.

Step 7.5 — Support Screen
Prompt to IDE:
Create src/api/supportApi.js:
  getSupportContact(): GET /support/contact

Create src/screens/profile/SupportScreen.js.

On mount: call getSupportContact() (no auth needed, handle locally with useState).

UI:
  - Header: "Help & Support"
  - Support card:
      Moveet logo/icon.
      Label: "Moveet Support"
      Phone: clickable (Linking.openURL('tel:+91...'))
      Email: clickable (Linking.openURL('mailto:support@moveet.in'))
      Support hours text.
  - FAQ section (hardcoded for now):
      "How do I start a ride?" — short answer text.
      "How is pricing calculated?" — short answer.
      "What if scooter doesn't unlock?" — short answer.
  - Each FAQ: accordion expand/collapse.
🛠 Manual step: Go through all Profile tabs — confirm edit profile saves correctly, notifications show from backend, ride history populates, and Support contact shows backend data.

Phase 8 — Global Polish & Error Handling
Step 8.1 — Global Toast / Snackbar
Prompt to IDE:
Create a global toast notification system.

Install: react-native-toast-message.

Setup:
  Add <Toast /> component at the root of App.js (inside Provider, above NavigationContainer).

Create src/utils/toast.js:
  showSuccess(message): Toast.show({ type: 'success', text1: message })
  showError(message): Toast.show({ type: 'error', text1: message })
  showInfo(message): Toast.show({ type: 'info', text1: message })

Update every thunk's rejected case in all slices to call showError(action.error.message).
Update every thunk's fulfilled case (where relevant) to call showSuccess(message).

Replace all inline error text states in screens with showError() calls.

Step 8.2 — Network Error Handling & Loading States
Prompt to IDE:
Harden the app against network failures.

1. Update src/api/axiosInstance.js response interceptor:
   - If error.response is undefined (no network): show toast "No internet connection."
   - If error.response.status === 401: dispatch logout(), navigate to LoginScreen.
   - If error.response.status === 429: show toast "Too many requests. Please wait."
   - If error.response.status >= 500: show toast "Server error. Please try again."

2. Create src/components/LoadingOverlay.js:
   A full-screen semi-transparent overlay with an ActivityIndicator (green).
   Accept a prop: visible (boolean).
   Use it in: LoginScreen, OtpScreen, KycFormScreen during API calls.

3. Create src/components/EmptyState.js:
   Accept props: icon (string, vector-icons name), title, subtitle, buttonLabel, onButtonPress.
   Used in: RideHistoryScreen, NotificationsScreen, MyScooterScreen.

4. Create src/components/SkeletonLoader.js:
   A simple animated placeholder bar (shimmer effect using Animated API).
   Accept props: width, height, borderRadius.
   Use in: PaymentsScreen transactions list, NotificationsScreen while loading.

5. Add a NetInfo listener in App.js:
   Show a persistent red banner at the top when offline: "You're offline".
   Hide when connection is restored.

Step 8.3 — App-Level Hooks & Final Wiring
Prompt to IDE:
Create src/hooks/useAppInit.js:
  On app launch (called from RootNavigator):
    1. Check token in AsyncStorage.
    2. If exists: dispatch fetchMeThunk(). If that fails (401): dispatch logout().
    3. If token valid and kycStatus === 'APPROVED': set isAuthenticated = true.
    4. Always dispatch fetchNotificationsThunk() after auth.

Create src/hooks/useRideStatus.js:
  Polls fetchActiveRideThunk() every 30 seconds when user is authenticated.
  Clears interval on unmount or logout.
  Used in AppNavigator so any tab always reflects latest ride state.

Update AppNavigator.js:
  Call useRideStatus() hook.
  Show a persistent banner at the top when activeRide is not null:
    "Ride in progress — tap to view" (green pill) → navigates to ActiveRideScreen on press.

Final check — verify these flows work end-to-end:
  Auth: Login → OTP → KYC → Home
  Ride: Map → Marker tap → Start Ride → Active Ride Timer → End Ride → Summary
  Payment: Add Money (Razorpay) → Balance updates → Subscribe Plan → Ride Free → Cancel Plan
  Profile: Edit name → Notifications → Ride History → Logout
🛠 Final Manual Steps:

Run the full app on a real Android device.
Do a complete new-user flow: register → KYC → add ₹500 → subscribe daily plan → start ride → end ride → confirm ₹0 cost.
Do a pay-per-minute flow: cancel plan → start ride → end after 2 min → confirm ₹0.50 deducted from wallet.
Check Notifications tab — confirm ride and payment events created notifications.
Logout and login again — confirm token persistence works and profile is restored.
Kill internet mid-ride — confirm offline banner shows and app doesn't crash.


Quick Reference — Screen → API Endpoint Map
ScreenEndpoints UsedSplashScreenGET /user/meLoginScreenPOST /auth/loginOtpScreenPOST /auth/verifyKycFormScreenPOST /user/profile, POST /kyc/submitKycPendingScreenGET /kyc/status, GET /user/meHomeScreenGET /scooters/nearby, POST /rides/startQrScanScreenGET /scooters/qr/:codeActiveRideScreenGET /rides/active, POST /rides/endRideSummaryScreenGET /user/meMyScooterScreenGET /rides/active, POST /rides/endPaymentsScreenGET /payments/plans, GET /payments/topup-presets, POST /payments/purchase, POST /payments/verify, POST /payments/subscribe, POST /payments/cancel, GET /payments/transactionsProfileScreenGET /user/me, POST /user/profile, POST /user/update-preferences, POST /user/toggle-auto-renewNotificationsScreenGET /notifications, PATCH /notifications/:id/read, PATCH /notifications/read-allRideHistoryScreenGET /rides/historySupportScreenGET /support/contact
Redux Slice → Data Map
SliceOwnsauthSlicetoken, isAuthenticateduserSliceprofile (name, wallet, kycStatus, plan)scooterSlicenearbyScooters, selectedScooterrideSliceactiveRide, rideHistorypaymentSliceplans, topupPresets, transactionsnotificationSlicenotifications, unreadCount