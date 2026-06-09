export const colors = {
  background: '#0D0D0D',
  card: '#1A1A1A',
  card2: '#222222',
  primary: '#00E676',
  primaryDim: '#1B4D2E',
  textPrimary: '#FFFFFF',
  textSecondary: '#888888',
  textLabel: '#555555',
  danger: '#FF4444',
  warning: '#FFA500',
  blueAccent: '#3D5AFE',
  tabBar: '#111111',
  active: '#00E676',
  inactive: '#555555',
  border: '#333333',
};

export const fontSizes = {
  heading: 28,
  headingLarge: 32,
  subheading: 20,
  body: 16,
  bodySmall: 14,
  caption: 12,
  label: 11,
  stat: 18,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 50,
  pill: 100,
};

export const typography = {
  brand: {
    fontWeight: 'bold',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  label: {
    color: colors.textLabel,
    letterSpacing: 1.5,
    fontSize: fontSizes.label,
    textTransform: 'uppercase',
  },
  body: {
    color: colors.textSecondary,
    fontSize: fontSizes.body,
  },
  stat: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: fontSizes.stat,
  },
};
