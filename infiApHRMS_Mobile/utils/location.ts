import * as Location from 'expo-location';

export type ExactLocation = {
  latitude: number;
  longitude: number;
  coordinateLabel: string;
  addressLabel: string;
  localityLabel: string;
};

const formatCoordinate = (value: number, direction: 'lat' | 'lng') => {
  const precision = value.toFixed(6);
  const suffix = direction === 'lat'
    ? (value >= 0 ? 'N' : 'S')
    : (value >= 0 ? 'E' : 'W');
  return `${precision}° ${suffix}`;
};

export const getExactCurrentLocation = async (): Promise<ExactLocation> => {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Location permission is required');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Highest,
  });

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });

  const addressParts = [place?.street, place?.district, place?.city, place?.region]
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter((part) => part.length > 0 && !part.includes('+'));

  const localityParts = [place?.city, place?.region, place?.country]
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean);

  const coordinateLabel = `${formatCoordinate(latitude, 'lat')}, ${formatCoordinate(longitude, 'lng')}`;
  const addressLabel = addressParts.length > 0 ? addressParts.join(', ') : coordinateLabel;
  const localityLabel = localityParts.length > 0 ? localityParts.join(', ') : 'Current device location';

  return {
    latitude,
    longitude,
    coordinateLabel,
    addressLabel,
    localityLabel,
  };
};

export const formatExactLocationLabel = (location: Pick<ExactLocation, 'coordinateLabel' | 'addressLabel'>) => {
  return location.addressLabel;
};
