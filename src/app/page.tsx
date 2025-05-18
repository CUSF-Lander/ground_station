'use client';

import React from 'react';
import { TelemetryProvider } from '../lib/contexts/TelemetryContext';
import TelemetryDisplay from '../components/TelemetryDisplay';
import TelemetryCharts from '../components/TelemetryCharts';
import Trajectory3D from '../components/Trajectory3D';
import ControlPanel from '../components/ControlPanel';

// MUI components
import { 
  Box, 
  Container, 
  Grid, 
  AppBar, 
  Toolbar, 
  Typography, 
  Paper
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

export default function Home() {
  return (
    <TelemetryProvider>
      <Box sx={{ height: '100%', overflowY: 'scroll'}}>
        {/* <AppBar position="static" color="primary" elevation={0} sx={{ height: '50px' }}>
          <Toolbar variant="dense">
            <RocketLaunchIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Rocket Ground Station
            </Typography>
          </Toolbar>
        </AppBar> */}
        

        {/* Container */}
        <Box sx={{ 
          height: 'calc(100% -  0px)', // Adjust for AppBar height
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Control Panel - Top Row - More compact */}
           <Box sx={{}}>
            <Paper 
              sx={{ 
                p: 1,
                m: 1,
                mb: 0,
              }}
            >
              <ControlPanel />
            </Paper>
          </Box>

          {/* Main Content Area */}
          <Box sx = {{flex: 1, flexDirection: 'row', display: 'flex'}}>
            <Box 
              sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',

              }}
            >
              <Paper sx={{ 
                p: 1,
                m: 1,
                mb: 0.5,
                mr: 0.5,
                flex: 1,
              }}>
                <TelemetryDisplay />
              </Paper>
              <Paper sx={{ 
                p: 1,
                m: 1,
                mt: 0.5,
                mr: 0.5,
                flex: 4,
              }}>
                <Trajectory3D />
              </Paper>
            </Box>
            <Paper 
              sx={{ 
                p: 1,
                m: 1,
                ml: 0.5,
                flex: 1,
              }}
            >
              <TelemetryCharts />
            </Paper>
          </Box>
          
          {/* Main Content Area - New Layout */}
          {/* 
          
           */}
          
        </Box>
      </Box>
    </TelemetryProvider>
  );
}