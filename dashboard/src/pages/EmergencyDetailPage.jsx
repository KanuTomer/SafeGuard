import { useCallback, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Alert, Button, Grid, Paper, Stack, TextField, Typography } from '@mui/material';

import { EmptyState } from '../components/EmptyState';
import { ErrorAlert } from '../components/ErrorAlert';
import { EvidenceList } from '../components/EvidenceList';
import { LoadingState } from '../components/LoadingState';
import { LocationList } from '../components/LocationList';
import { StatusChip } from '../components/StatusChip';
import { SummaryCard } from '../components/SummaryCard';
import { getApiErrorMessage } from '../services/apiClient';
import { uploadEvidence } from '../services/emergencyService';
import { useEmergencyDetail } from '../hooks/useEmergencyDetail';
import { useEmergencySocket } from '../hooks/useEmergencySocket';
import { formatDateTime, formatLocation } from '../utils/formatters';

export function EmergencyDetailPage() {
  const { emergencyId } = useParams();
  const { addRealtimeLocation, emergency, error, evidence, isLoading, locations, reload } =
    useEmergencyDetail(emergencyId);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const handleLocationCreated = useCallback(
    (location) => {
      addRealtimeLocation(location);
    },
    [addRealtimeLocation]
  );
  const { socketError } = useEmergencySocket(emergencyId, handleLocationCreated);

  const handleEvidenceUpload = async (event) => {
    event.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!evidenceFile) {
      setUploadError('Choose an image or audio file before uploading.');
      return;
    }

    setIsUploading(true);

    try {
      await uploadEvidence(emergencyId, {
        file: evidenceFile,
        notes: evidenceNotes,
      });
      setEvidenceFile(null);
      setEvidenceNotes('');
      await reload();
      setUploadSuccess('Evidence uploaded.');
    } catch (uploadFailure) {
      setUploadError(getApiErrorMessage(uploadFailure, 'Unable to upload evidence'));
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading emergency details" />;
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Button component={RouterLink} startIcon={<ArrowBackIcon />} to="/dashboard">
          Back to dashboard
        </Button>
        <ErrorAlert message={error} />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Button
        component={RouterLink}
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: 'flex-start' }}
        to="/dashboard"
      >
        Back to dashboard
      </Button>

      {socketError ? <Alert severity="warning">{socketError}</Alert> : null}
      {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}
      {uploadSuccess ? <Alert severity="success">{uploadSuccess}</Alert> : null}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
      >
        <Typography component="h1" sx={{ flexGrow: 1 }} variant="h4">
          Emergency details
        </Typography>
        <StatusChip status={emergency.status} />
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard label="Started" value={formatDateTime(emergency.startedAt)} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            label="Ended"
            value={emergency.endedAt ? formatDateTime(emergency.endedAt) : 'Still active'}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            label="Last known location"
            value={formatLocation(emergency.lastKnownLocation)}
          />
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 1, p: 3 }} variant="outlined">
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            Contacts snapshot
          </Typography>
          {emergency.contactsSnapshot.length > 0 ? (
            <Stack spacing={1}>
              {emergency.contactsSnapshot.map((contact, index) => (
                <Typography
                  key={`${contact.email}-${contact.phone}-${index}`}
                  color="text.secondary"
                  variant="body2"
                >
                  {contact.name} {contact.relationship ? `(${contact.relationship})` : ''} ·{' '}
                  {[contact.phone, contact.email].filter(Boolean).join(' · ')}
                </Typography>
              ))}
            </Stack>
          ) : (
            <EmptyState message="No emergency contacts were snapshotted for this session." />
          )}
        </Stack>
      </Paper>

      <Paper sx={{ borderRadius: 1, p: 3 }} variant="outlined">
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            Location history
          </Typography>
          {locations.length > 0 ? (
            <LocationList locations={locations} />
          ) : (
            <EmptyState message="No location points have been recorded for this emergency." />
          )}
        </Stack>
      </Paper>

      <Paper sx={{ borderRadius: 1, p: 3 }} variant="outlined">
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            Evidence
          </Typography>
          {emergency.status === 'active' ? (
            <Stack component="form" onSubmit={handleEvidenceUpload} spacing={2}>
              <Button component="label" variant="outlined">
                {evidenceFile ? evidenceFile.name : 'Choose image or audio'}
                <input
                  aria-label="Choose image or audio"
                  accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/webm"
                  hidden
                  onChange={(event) => setEvidenceFile(event.target.files?.[0] || null)}
                  type="file"
                />
              </Button>
              <TextField
                fullWidth
                label="Evidence notes"
                multiline
                onChange={(event) => setEvidenceNotes(event.target.value)}
                rows={2}
                value={evidenceNotes}
              />
              <Button disabled={isUploading} type="submit" variant="contained">
                {isUploading ? 'Uploading evidence' : 'Upload evidence'}
              </Button>
            </Stack>
          ) : (
            <Alert severity="info">
              Evidence can only be uploaded while an emergency is active.
            </Alert>
          )}
          {evidence.length > 0 ? (
            <EvidenceList evidence={evidence} />
          ) : (
            <EmptyState message="No evidence has been uploaded for this emergency." />
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
