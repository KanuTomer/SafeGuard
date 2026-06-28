export const formatDateTime = (value) => {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export const formatLocation = (location) => {
  if (!location) {
    return 'No location recorded';
  }

  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
};

export const formatLocationPoint = (location) => {
  const accuracy =
    location.accuracy === null ? 'accuracy unavailable' : `accuracy ${location.accuracy}m`;
  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)} (${accuracy})`;
};

export const formatFileSize = (bytes) => {
  if (!bytes) {
    return '0 B';
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
