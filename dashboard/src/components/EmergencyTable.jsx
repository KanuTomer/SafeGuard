import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { StatusChip } from './StatusChip';
import { formatDateTime, formatLocation } from '../utils/formatters';

export function EmergencyTable({ emergencies }) {
  return (
    <TableContainer>
      <Table aria-label="Emergency sessions">
        <TableHead>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>Started</TableCell>
            <TableCell>Ended</TableCell>
            <TableCell>Last known location</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {emergencies.map((emergency) => (
            <TableRow key={emergency.id}>
              <TableCell>
                <StatusChip status={emergency.status} />
              </TableCell>
              <TableCell>{formatDateTime(emergency.startedAt)}</TableCell>
              <TableCell>
                {emergency.endedAt ? formatDateTime(emergency.endedAt) : 'Still active'}
              </TableCell>
              <TableCell>{formatLocation(emergency.lastKnownLocation)}</TableCell>
              <TableCell align="right">
                <Button
                  component={RouterLink}
                  size="small"
                  startIcon={<VisibilityIcon />}
                  to={`/emergencies/${emergency.id}`}
                  variant="outlined"
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
