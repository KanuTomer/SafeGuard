import { List, ListItem, ListItemText } from '@mui/material';

import { formatDateTime, formatLocationPoint } from '../utils/formatters';

export function LocationList({ locations }) {
  return (
    <List disablePadding aria-label="Location history">
      {locations.map((location) => (
        <ListItem divider key={location.id} sx={{ px: 0 }}>
          <ListItemText
            primary={formatLocationPoint(location)}
            secondary={`Recorded ${formatDateTime(location.recordedAt)}`}
          />
        </ListItem>
      ))}
    </List>
  );
}
