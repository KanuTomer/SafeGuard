import { Chip } from '@mui/material';

export function StatusChip({ status }) {
  const isActive = status === 'active';

  return (
    <Chip
      color={isActive ? 'error' : 'default'}
      label={isActive ? 'Active' : 'Ended'}
      size="small"
      variant={isActive ? 'filled' : 'outlined'}
    />
  );
}
