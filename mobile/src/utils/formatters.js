export const formatDateTime = value => {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export const formatLocation = location => {
  if (!location) {
    return 'No location recorded';
  }

  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
};
