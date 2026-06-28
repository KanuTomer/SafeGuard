import { Box, CircularProgress, Typography } from '@mui/material';

export function LoadingState({ message = 'Loading' }) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        gap: 1.5,
        justifyContent: 'center',
        minHeight: 180,
      }}
    >
      <CircularProgress size={22} />
      <Typography color="text.secondary" variant="body2">
        {message}
      </Typography>
    </Box>
  );
}
