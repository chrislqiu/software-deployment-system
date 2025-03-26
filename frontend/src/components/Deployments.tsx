import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
} from '@mui/icons-material';
import {
  Deployment,
  Package,
  Client,
  deploymentService,
  packageService,
  clientService,
} from '../services/api';

export default function Deployments() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [newDeployment, setNewDeployment] = useState({
    package_id: '',
    client_ids: [] as string[],
    description: '',
    scheduled_for: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deploymentsData, packagesData, clientsData] = await Promise.all([
        deploymentService.getDeployments(),
        packageService.getPackages(),
        clientService.getClients(),
      ]);
      setDeployments(deploymentsData);
      setPackages(packagesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await deploymentService.createDeployment({
        package: parseInt(newDeployment.package_id),
        clients: newDeployment.client_ids.map((id) => parseInt(id)),
        description: newDeployment.description,
        scheduled_for: newDeployment.scheduled_for || undefined,
      });
      setOpenDialog(false);
      fetchData();
      setNewDeployment({
        package_id: '',
        client_ids: [],
        description: '',
        scheduled_for: '',
      });
    } catch (error) {
      console.error('Error creating deployment:', error);
    }
  };

  const handleCancel = async (deploymentId: number) => {
    try {
      await deploymentService.cancelDeployment(deploymentId);
      fetchData();
    } catch (error) {
      console.error('Error canceling deployment:', error);
    }
  };

  const handleRetry = async (deploymentId: number) => {
    try {
      await deploymentService.retryFailedDeployment(deploymentId);
      fetchData();
    } catch (error) {
      console.error('Error retrying deployment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'in_progress':
        return 'warning';
      case 'cancelled':
        return 'default';
      default:
        return 'info';
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Deployments</Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} disabled={loading} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            New Deployment
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Package</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Scheduled For</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deployments.map((deployment) => (
              <>
                <TableRow key={deployment.id}>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setExpandedRow(
                          expandedRow === deployment.id ? null : deployment.id
                        )
                      }
                    >
                      {expandedRow === deployment.id ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>{deployment.package.name}</TableCell>
                  <TableCell>{deployment.description}</TableCell>
                  <TableCell>
                    {new Date(deployment.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {deployment.scheduled_for
                      ? new Date(deployment.scheduled_for).toLocaleString()
                      : 'Immediate'}
                  </TableCell>
                  <TableCell>
                    {deployment.deployment_statuses.map((status) => (
                      <Chip
                        key={status.id}
                        label={status.status}
                        color={getStatusColor(status.status) as any}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleCancel(deployment.id)}
                      disabled={
                        !deployment.deployment_statuses.some(
                          (s) => s.status === 'pending' || s.status === 'in_progress'
                        )
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleRetry(deployment.id)}
                      disabled={
                        !deployment.deployment_statuses.some(
                          (s) => s.status === 'failed'
                        )
                      }
                    >
                      Retry Failed
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={7}
                  >
                    <Collapse
                      in={expandedRow === deployment.id}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Deployment Details
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Client</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Started At</TableCell>
                              <TableCell>Completed At</TableCell>
                              <TableCell>Error</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {deployment.deployment_statuses.map((status) => (
                              <TableRow key={status.id}>
                                <TableCell>{status.client.hostname}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={status.status}
                                    color={getStatusColor(status.status) as any}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {status.started_at
                                    ? new Date(status.started_at).toLocaleString()
                                    : '-'}
                                </TableCell>
                                <TableCell>
                                  {status.completed_at
                                    ? new Date(
                                        status.completed_at
                                      ).toLocaleString()
                                    : '-'}
                                </TableCell>
                                <TableCell>{status.error_message || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md">
        <form onSubmit={handleSubmit}>
          <DialogTitle>Create New Deployment</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Package</InputLabel>
                  <Select
                    value={newDeployment.package_id}
                    label="Package"
                    onChange={(e) =>
                      setNewDeployment({
                        ...newDeployment,
                        package_id: e.target.value as string,
                      })
                    }
                    required
                  >
                    {packages.map((pkg) => (
                      <MenuItem key={pkg.id} value={pkg.id}>
                        {pkg.name} v{pkg.version}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Target Clients</InputLabel>
                  <Select
                    multiple
                    value={newDeployment.client_ids}
                    label="Target Clients"
                    onChange={(e) =>
                      setNewDeployment({
                        ...newDeployment,
                        client_ids: e.target.value as string[],
                      })
                    }
                    required
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.hostname} ({client.ip_address})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={newDeployment.description}
                  onChange={(e) =>
                    setNewDeployment({
                      ...newDeployment,
                      description: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Schedule For"
                  type="datetime-local"
                  value={newDeployment.scheduled_for}
                  onChange={(e) =>
                    setNewDeployment({
                      ...newDeployment,
                      scheduled_for: e.target.value,
                    })
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!newDeployment.package_id || !newDeployment.client_ids.length}
            >
              Create Deployment
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 