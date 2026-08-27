import React from 'react';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const ICONS = {
  call: PhoneIcon,
  mail: EmailIcon,
  chat: WhatsAppIcon,
  language: LanguageIcon,
  location: LocationOnIcon
};

const ContactMethodIcon = ({ type }) => {
  const Icon = ICONS[type] || LocationOnIcon;
  return <Icon aria-hidden="true" sx={{ fontSize: 18 }} />;
};

export default ContactMethodIcon;
