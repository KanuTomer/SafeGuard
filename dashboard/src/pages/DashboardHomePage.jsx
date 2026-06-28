import ContactsIcon from '@mui/icons-material/Contacts';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EmergencyIcon from '@mui/icons-material/Emergency';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { EmergencyTable } from '../components/EmergencyTable';
import { EmptyState } from '../components/EmptyState';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingState } from '../components/LoadingState';
import { StatusChip } from '../components/StatusChip';
import { SummaryCard } from '../components/SummaryCard';
import { getApiErrorMessage } from '../services/apiClient';
import { createEmergency, createLocation, endEmergency } from '../services/emergencyService';
import {
  createContact,
  deleteContact,
  updateContact,
  updateUserProfile,
} from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';
import { formatDateTime, formatLocation } from '../utils/formatters';

const defaultIndiaPhonePrefix = '+91';

function ProfileEditor({ isSubmittingAction, onSave, profile }) {
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || defaultIndiaPhonePrefix,
  });

  const handleProfileChange = (field) => (event) => {
    setProfileForm((currentForm) => ({
      ...currentForm,
      [field]: event.target.value,
    }));
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    await onSave(profileForm);
  };

  return (
    <Paper
      component="form"
      onSubmit={handleUpdateProfile}
      sx={{ borderRadius: 1, p: 3 }}
      variant="outlined"
    >
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: 'center' }}>
          <PersonIcon color="primary" />
          <Box sx={{ flexGrow: 1 }}>
            <Typography component="h2" variant="h6">
              Profile
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Update the owner details used by the SafeGuard demo account.
            </Typography>
          </Box>
        </Stack>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Profile name"
              onChange={handleProfileChange('name')}
              required
              value={profileForm.name}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Profile phone"
              onChange={handleProfileChange('phone')}
              value={profileForm.phone}
            />
          </Grid>
        </Grid>
        <Button disabled={isSubmittingAction} type="submit" variant="outlined">
          Save profile
        </Button>
      </Stack>
    </Paper>
  );
}

export function DashboardHomePage() {
  const { user } = useAuth();
  const { activeEmergency, emergencies, error, isLoading, profile, reload } = useDashboardData();
  const [contactForm, setContactForm] = useState({
    email: '',
    name: '',
    phone: defaultIndiaPhonePrefix,
    relationship: '',
  });
  const [editingContactId, setEditingContactId] = useState('');
  const [editingContactForm, setEditingContactForm] = useState({
    email: '',
    name: '',
    phone: defaultIndiaPhonePrefix,
    relationship: '',
  });
  const [locationForm, setLocationForm] = useState({
    accuracy: '25',
    latitude: '28.6139',
    longitude: '77.2090',
  });
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const buildLocationPayload = () => ({
    accuracy: Number(locationForm.accuracy),
    latitude: Number(locationForm.latitude),
    longitude: Number(locationForm.longitude),
    recordedAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  });

  const runDashboardAction = async (successMessage, action) => {
    setActionError('');
    setActionSuccess('');
    setIsSubmittingAction(true);

    try {
      await action();
      await reload();
      setActionSuccess(successMessage);
    } catch (actionFailure) {
      setActionError(getApiErrorMessage(actionFailure, 'Dashboard action failed'));
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleContactChange = (field) => (event) => {
    setContactForm((currentForm) => ({
      ...currentForm,
      [field]: event.target.value,
    }));
  };

  const handleEditingContactChange = (field) => (event) => {
    setEditingContactForm((currentForm) => ({
      ...currentForm,
      [field]: event.target.value,
    }));
  };

  const startEditingContact = (contact) => {
    setEditingContactId(contact.id);
    setEditingContactForm({
      email: contact.email || '',
      name: contact.name || '',
      phone: contact.phone || defaultIndiaPhonePrefix,
      relationship: contact.relationship || '',
    });
  };

  const cancelEditingContact = () => {
    setEditingContactId('');
    setEditingContactForm({
      email: '',
      name: '',
      phone: defaultIndiaPhonePrefix,
      relationship: '',
    });
  };

  const handleLocationChange = (field) => (event) => {
    setLocationForm((currentForm) => ({
      ...currentForm,
      [field]: event.target.value,
    }));
  };

  const handleAddContact = async (event) => {
    event.preventDefault();
    await runDashboardAction('Emergency contact added.', async () => {
      await createContact(contactForm);
      setContactForm({ email: '', name: '', phone: defaultIndiaPhonePrefix, relationship: '' });
    });
  };

  const handleUpdateProfile = (profileForm) =>
    runDashboardAction('Profile updated.', async () => {
      await updateUserProfile(profileForm);
    });

  const handleUpdateContact = async (event) => {
    event.preventDefault();
    await runDashboardAction('Emergency contact updated.', async () => {
      await updateContact(editingContactId, editingContactForm);
      cancelEditingContact();
    });
  };

  const handleDeleteContact = (contactId) =>
    runDashboardAction('Emergency contact deleted.', async () => {
      await deleteContact(contactId);
      if (editingContactId === contactId) {
        cancelEditingContact();
      }
    });

  const handleStartEmergency = () =>
    runDashboardAction('Emergency session started.', async () => {
      const locationPayload = buildLocationPayload();
      await createEmergency({
        accuracy: locationPayload.accuracy,
        latitude: locationPayload.latitude,
        longitude: locationPayload.longitude,
        timestamp: locationPayload.timestamp,
      });
    });

  const handleSendLocation = () =>
    runDashboardAction('Location update sent.', async () => {
      await createLocation(activeEmergency.id, buildLocationPayload());
    });

  const handleEndEmergency = () =>
    runDashboardAction('Emergency session ended.', async () => {
      await endEmergency(activeEmergency.id);
    });

  if (isLoading) {
    return <LoadingState message="Loading dashboard" />;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">
          Dashboard
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Review your emergency activity and supporting evidence.
        </Typography>
      </Box>

      <ErrorAlert message={error} />
      {actionError ? <Alert severity="error">{actionError}</Alert> : null}
      {actionSuccess ? <Alert severity="success">{actionSuccess}</Alert> : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            icon={<EmergencyIcon color={activeEmergency ? 'error' : 'disabled'} />}
            label="Active emergency"
            value={activeEmergency ? 'In progress' : 'None'}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            icon={<HistoryIcon color="primary" />}
            label="Total sessions"
            value={emergencies.length}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            icon={<ContactsIcon color="primary" />}
            label="Emergency contacts"
            value={profile?.contacts?.length ?? 0}
          />
        </Grid>
      </Grid>

      <ProfileEditor
        isSubmittingAction={isSubmittingAction}
        key={profile?.updatedAt || profile?.id || 'profile'}
        onSave={handleUpdateProfile}
        profile={profile}
      />

      <Paper sx={{ borderRadius: 1, p: 3 }} variant="outlined">
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
          >
            <Typography component="h2" sx={{ flexGrow: 1 }} variant="h6">
              Active session
            </Typography>
            {activeEmergency ? <StatusChip status={activeEmergency.status} /> : null}
          </Stack>
          {activeEmergency ? (
            <Typography color="text.secondary" variant="body2">
              {user?.name ? `${user.name}, this session started ` : 'Started '}
              {formatDateTime(activeEmergency.startedAt)}. Last known location:{' '}
              {formatLocation(activeEmergency.lastKnownLocation)}.
            </Typography>
          ) : (
            <EmptyState message="No active emergency session." />
          )}
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            component="form"
            onSubmit={handleAddContact}
            sx={{ borderRadius: 1, p: 3 }}
            variant="outlined"
          >
            <Stack spacing={2}>
              <Typography component="h2" variant="h6">
                Emergency contacts
              </Typography>
              <TextField
                fullWidth
                label="Contact name"
                onChange={handleContactChange('name')}
                required
                value={contactForm.name}
              />
              <TextField
                fullWidth
                label="Contact phone"
                onChange={handleContactChange('phone')}
                value={contactForm.phone}
              />
              <TextField
                fullWidth
                label="Email"
                onChange={handleContactChange('email')}
                type="email"
                value={contactForm.email}
              />
              <TextField
                fullWidth
                label="Relationship"
                onChange={handleContactChange('relationship')}
                value={contactForm.relationship}
              />
              <Button disabled={isSubmittingAction} type="submit" variant="contained">
                Add contact
              </Button>
              {profile?.contacts?.length ? (
                <Stack spacing={1}>
                  {profile.contacts.map((contact) =>
                    editingContactId === contact.id ? (
                      <Stack
                        component="form"
                        key={contact.id}
                        onSubmit={handleUpdateContact}
                        spacing={1}
                        sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}
                      >
                        <TextField
                          fullWidth
                          label="Edit contact name"
                          onChange={handleEditingContactChange('name')}
                          required
                          size="small"
                          value={editingContactForm.name}
                        />
                        <TextField
                          fullWidth
                          label="Edit contact phone"
                          onChange={handleEditingContactChange('phone')}
                          size="small"
                          value={editingContactForm.phone}
                        />
                        <TextField
                          fullWidth
                          label="Edit contact email"
                          onChange={handleEditingContactChange('email')}
                          size="small"
                          type="email"
                          value={editingContactForm.email}
                        />
                        <TextField
                          fullWidth
                          label="Edit contact relationship"
                          onChange={handleEditingContactChange('relationship')}
                          size="small"
                          value={editingContactForm.relationship}
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Button disabled={isSubmittingAction} size="small" type="submit">
                            Save contact
                          </Button>
                          <Button
                            disabled={isSubmittingAction}
                            onClick={cancelEditingContact}
                            size="small"
                            type="button"
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack
                        direction="row"
                        key={contact.id}
                        spacing={1}
                        sx={{ alignItems: 'center' }}
                      >
                        <Typography color="text.secondary" sx={{ flexGrow: 1 }} variant="body2">
                          {contact.name} {contact.relationship ? `(${contact.relationship})` : ''} ·{' '}
                          {[contact.phone, contact.email].filter(Boolean).join(' · ')}
                        </Typography>
                        <IconButton
                          aria-label={`Edit ${contact.name}`}
                          disabled={isSubmittingAction}
                          onClick={() => startEditingContact(contact)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          aria-label={`Delete ${contact.name}`}
                          disabled={isSubmittingAction}
                          onClick={() => handleDeleteContact(contact.id)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    )
                  )}
                </Stack>
              ) : (
                <EmptyState message="No emergency contacts yet." />
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ borderRadius: 1, p: 3 }} variant="outlined">
            <Stack spacing={2}>
              <Typography component="h2" variant="h6">
                Emergency controls
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    onChange={handleLocationChange('latitude')}
                    type="number"
                    value={locationForm.latitude}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    onChange={handleLocationChange('longitude')}
                    type="number"
                    value={locationForm.longitude}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Accuracy"
                    onChange={handleLocationChange('accuracy')}
                    type="number"
                    value={locationForm.accuracy}
                  />
                </Grid>
              </Grid>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  disabled={Boolean(activeEmergency) || isSubmittingAction}
                  onClick={handleStartEmergency}
                  variant="contained"
                >
                  Start emergency
                </Button>
                <Button
                  disabled={!activeEmergency || isSubmittingAction}
                  onClick={handleSendLocation}
                  variant="outlined"
                >
                  Send location
                </Button>
                <Button
                  color="error"
                  disabled={!activeEmergency || isSubmittingAction}
                  onClick={handleEndEmergency}
                  variant="outlined"
                >
                  End emergency
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 1, p: 3 }} variant="outlined">
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            Emergency history
          </Typography>
          {emergencies.length > 0 ? (
            <EmergencyTable emergencies={emergencies} />
          ) : (
            <EmptyState message="No emergency sessions have been created yet." />
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
