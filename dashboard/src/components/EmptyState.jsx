import InboxIcon from '@mui/icons-material/Inbox';
import { Box, Typography } from '@mui/material';

export function EmptyState({ message }) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 1,
        color: 'text.secondary',
        display: 'flex',
        gap: 1,
        justifyContent: 'center',
        minHeight: 112,
        p: 3,
      }}
    >
      <InboxIcon fontSize="small" />
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
}
