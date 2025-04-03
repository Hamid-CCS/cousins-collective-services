# Cousins Collective Services - Website Integration Guide

## Overview

This guide explains how the CCS website works with its booking system. The website is entirely client-side, using localStorage to store and manage booking data without requiring any server-side systems.

## Key Components

1. **Main Website (index.html)**
   - User-facing website with service info, testimonials, and booking form
   - Allows users to submit booking requests
   - Stores bookings in browser localStorage

2. **Admin Panel (bookings.html)**
   - Password-protected admin interface
   - Displays all bookings stored in localStorage
   - Allows sorting, filtering, and exporting of booking data
   - Enables status updates (New, Confirmed, Completed, Cancelled)

## How It Works: Booking Flow

1. **Customer Submits Booking:**
   - User fills out the booking form on the main website
   - Form submission is handled by JavaScript in main.js
   - Data is stored in browser localStorage with a unique ID
   - Confirmation message displayed to user

2. **Admin Views Bookings:**
   - Admin accesses the bookings.html page
   - Enters password (ccs2024admin)
   - All bookings stored in localStorage are displayed
   - Admin can filter, sort, and manage bookings

3. **Booking Management:**
   - Update status (New → Confirmed → Completed/Cancelled)
   - View full booking details
   - Delete unwanted bookings
   - Export to CSV for offline record-keeping

## Data Structure

Each booking is stored as a JSON object with the following structure:

```json
{
  "id": "unique-identifier",
  "name": "Customer Name",
  "phone": "555-123-4567",
  "email": "customer@example.com",
  "service": "House Cleaning",
  "date": "2023-04-15",
  "time": "14:00",
  "address": "123 Main St",
  "details": "Additional booking information",
  "timestamp": "2023-04-10T12:34:56.789Z",
  "status": "new"
}
```

## Important Considerations

1. **Data Persistence:**
   - LocalStorage is browser and device-specific
   - Clearing browser data will delete all stored bookings
   - Regular CSV exports are recommended for data backup

2. **Multiple Users:**
   - Each admin device has its own independent data store
   - Changes made on one device won't affect others
   - Consider implementing a data synchronization strategy for multiple admins

3. **Storage Limits:**
   - LocalStorage has a limit of 5-10MB depending on the browser
   - After many bookings, consider archiving older data

## Customization

### Adding New Services

1. Update the service options in the booking form (index.html)
2. Update the filter options in the admin panel (bookings.html)
3. Update the service cards in the services section (index.html)

### Changing Admin Password

1. Open bookings.html
2. Find the line: `const adminPassword = "ccs2024admin";`
3. Change to your desired password

## Troubleshooting

### No Bookings Showing in Admin Panel

1. Ensure you're using the same browser and device where the bookings were made
2. Check that localStorage is enabled in your browser
3. Verify the admin password is correct

### Form Submission Issues

1. Check browser console for JavaScript errors
2. Ensure all required fields are properly marked
3. Verify that localStorage is not full or disabled

## Future Enhancements

For more sophisticated needs, consider:

1. Cloud-based storage solution integration
2. User account system for multiple admins
3. Automated email notifications
4. Booking reminders and follow-ups

## Need Help?

For assistance with the website, please contact the developer directly. 