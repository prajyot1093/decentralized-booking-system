import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
} from '@mui/material';
import {
  Security,
  Speed,
  AccountBalance,
  TrendingUp,
  Hotel,
  BookOnline,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const Home = () => {
  const { isConnected, connectWallet } = useWeb3();

  const features = [
    {
      icon: <Security color="primary" sx={{ fontSize: 40 }} />,
      title: 'Secure & Trustless',
      description: 'All transactions are secured by blockchain technology with smart contracts handling payments automatically.'
    },
    {
      icon: <Speed color="primary" sx={{ fontSize: 40 }} />,
      title: 'Fast Transactions',
      description: 'Instant booking confirmations and quick payment processing with cryptocurrency.'
    },
    {
      icon: <AccountBalance color="primary" sx={{ fontSize: 40 }} />,
      title: 'Decentralized',
      description: 'No intermediaries - direct peer-to-peer booking between property owners and guests.'
    },
    {
      icon: <TrendingUp color="primary" sx={{ fontSize: 40 }} />,
      title: 'Lower Fees',
      description: 'Reduced booking fees compared to traditional platforms thanks to smart contract automation.'
    }
  ];

  const stats = [
    { label: 'Properties Listed', value: '50+', color: 'primary' },
    { label: 'Successful Bookings', value: '200+', color: 'secondary' },
    { label: 'Happy Users', value: '150+', color: 'success' },
    { label: 'Countries', value: '12+', color: 'warning' }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box className="hero-gradient" sx={{ py: 8, color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                sx={{ fontWeight: 'bold', mb: 3 }}
              >
                Book Properties on the 
                <Typography 
                  component="span" 
                  variant="h2" 
                  sx={{ color: '#64b5f6', fontWeight: 'bold' }}
                >
                  {' '}Blockchain
                </Typography>
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}
              >
                Experience the future of property rentals with our decentralized booking system. 
                Secure, transparent, and fee-efficient bookings powered by smart contracts.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {!isConnected ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={connectWallet}
                    sx={{ 
                      borderRadius: '25px',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      bgcolor: 'secondary.main',
                      '&:hover': { bgcolor: 'secondary.dark' }
                    }}
                  >
                    Connect Wallet & Start
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/properties"
                    sx={{ 
                      borderRadius: '25px',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      bgcolor: 'secondary.main',
                      '&:hover': { bgcolor: 'secondary.dark' }
                    }}
                  >
                    Explore Properties
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ 
                    borderRadius: '25px',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': { 
                      borderColor: 'secondary.main',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 4,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Hotel sx={{ fontSize: 120, opacity: 0.7 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
              >
                <Typography variant="h3" color={stat.color} sx={{ fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Why Choose BookChain?
          </Typography>
          
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            Revolutionary features that make property booking seamless and secure
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  className="hover-card"
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box className="gradient-bg" sx={{ py: 8, color: 'white' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join the decentralized booking revolution today
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/properties"
                startIcon={<BookOnline />}
                sx={{ 
                  borderRadius: '25px',
                  px: 4,
                  py: 1.5,
                  bgcolor: 'secondary.main',
                  '&:hover': { bgcolor: 'secondary.dark' }
                }}
              >
                Book Now
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  borderRadius: '25px',
                  px: 4,
                  py: 1.5,
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': { 
                    borderColor: 'secondary.main',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                List Property
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;