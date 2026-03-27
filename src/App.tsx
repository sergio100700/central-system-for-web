import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Organizations from './pages/organizations'
import ChargePoints from './pages/chargepoints'
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'

function TopBar() {
  const location = useLocation()

  const items = [
    { label: 'Home', to: '/' },
    { label: 'Organizations', to: '/organizations' },
    { label: 'Charge Points', to: '/chargepoints' },
  ]

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <Typography
          component={NavLink}
          to="/"
          variant="h6"
          sx={{
            fontWeight: 700,
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          Central System
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {items.map((item) => (
            <Button
              key={item.to}
              component={NavLink}
              to={item.to}
              color="inherit"
              variant={location.pathname === item.to ? 'contained' : 'text'}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

function App() {
  return (
    <BrowserRouter>
      <TopBar />

      <Routes>
        <Route path="/" element={
          <section id="center">
            <div className="hero">
              <img src={heroImg} className="base" width="170" height="179" alt="" />
              <img src={reactLogo} className="framework" alt="React logo" />
              <img src={viteLogo} className="vite" alt="Vite logo" />
            </div>
            <h1>Central System</h1>
          </section>
        } />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/chargepoints" element={<ChargePoints />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
