import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Archive as ArchiveIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { Client, Package, Deployment, clientService, packageService, deploymentService } from '../services/api';

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, packagesData, deploymentsData] = await Promise.all([
          clientService.getClients(),
          packageService.getPackages(),
          deploymentService.getDeployments(),
        ]);
        setClients(clientsData);
        setPackages(packagesData);
        setDeployments(deploymentsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const onlineClients = clients.filter((client) => client.status === 'online');
  const recentDeployments = deployments.slice(0, 5);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'white',
            }}
          >
            <ComputerIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h6">Clients</Typography>
              <Typography variant="h4">
                {onlineClients.length}/{clients.length}
              </Typography>
              <Typography variant="subtitle2">Online/Total</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'secondary.light',
              color: 'white',
            }}
          >
            <ArchiveIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h6">Packages</Typography>
              <Typography variant="h4">{packages.length}</Typography>
              <Typography variant="subtitle2">Available</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'success.light',
              color: 'white',
            }}
          >
            <SendIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h6">Deployments</Typography>
              <Typography variant="h4">{deployments.length}</Typography>
              <Typography variant="subtitle2">Total</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Deployments */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Deployments
              </Typography>
              <List>
                {recentDeployments.map((deployment) => (
                  <ListItem key={deployment.id} divider>
                    <ListItemText
                      primary={deployment.package.name}
                      secondary={`Created at: ${new Date(
                        deployment.created_at
                      ).toLocaleString()}`}
                    />
                    <Box>
                      {deployment.deployment_statuses.map((status) => (
                        <Chip
                          key={status.id}
                          label={status.status}
                          color={
                            status.status === 'completed'
                              ? 'success'
                              : status.status === 'failed'
                              ? 'error'
                              : 'default'
                          }
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      ))}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 