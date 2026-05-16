import { ImageSourcePropType } from 'react-native';

const fallbackAvatar = require('../assets/images/sneha.png');

export const resolveImageSource = (
  source?: string | number | null
): ImageSourcePropType => {
  if (typeof source === 'number') {
    return source;
  }

  if (typeof source === 'string' && source.trim()) {
    return { uri: source };
  }

  return fallbackAvatar;
};
