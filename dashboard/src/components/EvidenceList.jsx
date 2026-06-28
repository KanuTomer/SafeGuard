import AudioFileIcon from '@mui/icons-material/AudioFile';
import ImageIcon from '@mui/icons-material/Image';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { IconButton, List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';

import { formatDateTime, formatFileSize } from '../utils/formatters';

export function EvidenceList({ evidence }) {
  return (
    <List disablePadding aria-label="Evidence files">
      {evidence.map((item) => (
        <ListItem
          divider
          key={item.id}
          secondaryAction={
            <Tooltip title="Open evidence">
              <IconButton
                aria-label={`Open ${item.originalName}`}
                component="a"
                href={item.secureUrl}
                rel="noreferrer"
                target="_blank"
              >
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
          }
          sx={{ px: 0 }}
        >
          <ListItemIcon>{item.type === 'audio' ? <AudioFileIcon /> : <ImageIcon />}</ListItemIcon>
          <ListItemText
            primary={item.originalName}
            secondary={`${item.type} • ${formatFileSize(item.size)} • ${formatDateTime(item.createdAt)}${
              item.notes ? ` • ${item.notes}` : ''
            }`}
          />
        </ListItem>
      ))}
    </List>
  );
}
