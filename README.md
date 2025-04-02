# Cousins Collective Services (CCS) Website

A responsive, modern website for Cousins Collective Services, featuring an integrated booking system with Google Calendar and Google Sheets integration.

## Overview

The CCS website is built as a static site hosted on GitHub Pages, with a powerful booking system that integrates with Google services for appointment tracking and management.

### Features

- **Modern, Responsive Design:** Looks great on all devices from mobile to desktop
- **Service Showcase:** Displays all services offered by CCS with attractive cards
- **Online Booking System:** Allows customers to book services directly through the website
- **Google Integration:** 
  - Automatically adds bookings to Google Calendar
  - Stores all booking data in Google Sheets
  - Sends email confirmations to customers and administrators
- **Local Backup:** All bookings are stored locally as a backup in case of connectivity issues
- **Admin Dashboard:** Password-protected booking management interface
  - View all bookings
  - Filter and search bookings
  - Update booking statuses
  - Export bookings to CSV
  - One-click sync with Google services

## Technical Details

- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Hosting:** GitHub Pages
- **Backend Integration:** Google Apps Script
- **Data Storage:** Google Sheets
- **Scheduling:** Google Calendar

## Getting Started

### Viewing the Website

The website is hosted at: [https://hamid-ccs.github.io/cousins-collective-services/](https://hamid-ccs.github.io/cousins-collective-services/)

### Accessing the Admin Panel

1. Navigate to [https://hamid-ccs.github.io/cousins-collective-services/bookings.html](https://hamid-ccs.github.io/cousins-collective-services/bookings.html)
2. Enter the admin password: `ccs2024admin`
3. From here you can view all bookings, filter them, update their status, and export to CSV

### Syncing with Google Services

To set up Google integration:

1. Follow the instructions in `GOOGLE_API_SETUP.md` to set up your Google services
2. Deploy the Apps Script as described in `COMPLETE_INTEGRATION_GUIDE.md`
3. Update the script URL in your website as detailed in the guides
4. Test the integration by submitting a booking form

## Documentation

This repository contains several documentation files to help you understand and maintain the system:

- **README.md**: This overview file
- **GOOGLE_API_SETUP.md**: Instructions for setting up Google Calendar and Sheets
- **COMPLETE_INTEGRATION_GUIDE.md**: Comprehensive guide for the entire integration

## Project Structure

```
/
├── docs/                      # Website files (GitHub Pages root)
│   ├── index.html             # Homepage
│   ├── bookings.html          # Admin booking management panel
│   ├── css/                   # CSS stylesheets
│   ├── js/                    # JavaScript files
│   └── images/                # Image assets
├── apps_script/               # Google Apps Script files
│   └── BookingHandler.js      # Main script for Google integration
├── README.md                  # This file
└── GOOGLE_API_SETUP.md        # Google API setup guide
```

## Google Integration

The booking system integrates with Google services to provide a seamless experience:

1. **Customer Submits Booking**: When a customer submits a booking on the website
2. **Local Storage**: The booking is saved in the browser's localStorage as a backup
3. **Google Apps Script**: The booking data is sent to a Google Apps Script web app
4. **Google Calendar**: A calendar event is created with all booking details
5. **Google Sheets**: The booking information is stored in a spreadsheet for record-keeping
6. **Email Notifications**: Confirmation emails are sent to both the customer and admin

## Maintaining the Website

### Making Changes

1. Clone this repository
2. Make changes to files in the `docs/` directory
3. Commit and push to GitHub
4. GitHub Pages will automatically update the live site

### Handling Bookings

New bookings automatically appear in:
- Your Google Calendar
- Your Google Sheets spreadsheet
- The admin panel at `/bookings.html`

## Future Enhancements

Planned improvements for the system:

1. SMS notifications for new bookings
2. Customer portal for viewing and managing bookings
3. Availability checking against the Google Calendar
4. Integration with payment processing services

## Support

For questions or assistance, contact: cousinscollectiveservices@gmail.com 