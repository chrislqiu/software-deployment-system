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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Package, packageService } from '../services/api';

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: '',
    version: '',
    description: '',
    os_compatibility: 'all',
    file: null as File | null,
  });

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await packageService.getPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newPackage.file) return;

    try {
      const formData = new FormData();
      formData.append('name', newPackage.name);
      formData.append('version', newPackage.version);
      formData.append('description', newPackage.description);
      formData.append('os_compatibility', newPackage.os_compatibility);
      formData.append('file', newPackage.file);

      await packageService.createPackage(formData);
      setOpenDialog(false);
      fetchPackages();
      setNewPackage({
        name: '',
        version: '',
        description: '',
        os_compatibility: 'all',
        file: null,
      });
    } catch (error) {
      console.error('Error creating package:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewPackage({ ...newPackage, file: event.target.files[0] });
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
        <Typography variant="h4">Software Packages</Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchPackages} disabled={loading} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Package
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>OS Compatibility</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell>{pkg.name}</TableCell>
                <TableCell>{pkg.version}</TableCell>
                <TableCell>{pkg.description}</TableCell>
                <TableCell>{pkg.os_compatibility}</TableCell>
                <TableCell>{(pkg.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                <TableCell>
                  {new Date(pkg.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={pkg.is_active ? 'Active' : 'Inactive'}
                    color={pkg.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Package</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Package Name"
              fullWidth
              required
              value={newPackage.name}
              onChange={(e) =>
                setNewPackage({ ...newPackage, name: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Version"
              fullWidth
              required
              value={newPackage.version}
              onChange={(e) =>
                setNewPackage({ ...newPackage, version: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newPackage.description}
              onChange={(e) =>
                setNewPackage({ ...newPackage, description: e.target.value })
              }
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>OS Compatibility</InputLabel>
              <Select
                value={newPackage.os_compatibility}
                label="OS Compatibility"
                onChange={(e) =>
                  setNewPackage({
                    ...newPackage,
                    os_compatibility: e.target.value,
                  })
                }
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="windows">Windows</MenuItem>
                <MenuItem value="linux">Linux</MenuItem>
                <MenuItem value="macos">macOS</MenuItem>
              </Select>
            </FormControl>
            <Button
              component="label"
              variant="outlined"
              sx={{ mt: 2 }}
              fullWidth
            >
              Upload Package File
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".zip,.exe,.msi,.deb,.rpm,.dmg"
              />
            </Button>
            {newPackage.file && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Selected file: {newPackage.file.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!newPackage.file}>
              Add Package
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 