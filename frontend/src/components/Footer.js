import React from 'react';
import { Box, Container, Grid, IconButton, Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: 'red', // Changed to red for visibility
        p: 6,
        minHeight: '200px', // Added minimum height
      }}
      component="footer"
    >
      <Container maxWidth="lg">
        <Typography variant="h6" align="center" gutterBottom>
          Contact Us
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <IconButton
              aria-label="facebook"
              color="inherit"
              component="a"
              href="https://www.facebook.com/your-page"
              target="_blank"
            >
              <FacebookIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton
              aria-label="whatsapp"
              color="inherit"
              component="a"
              href="https://wa.me/+9779840054416"
              target="_blank"
            >
              <WhatsAppIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton aria-label="phone" color="inherit">
              <PhoneIcon />
              <Typography variant="body2" sx={{ ml: 1 }}>
                +1234567890
              </Typography>
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton
              aria-label="email"
              color="inherit"
              component="a"
              href="mailto:your-email@example.com"
            >
              <EmailIcon />
              <Typography variant="body2" sx={{ ml: 1 }}>
                your-email@example.com
              </Typography>
            </IconButton>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
