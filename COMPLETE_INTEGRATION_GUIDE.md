# Complete Integration Guide for CCS Website

This guide walks you through the complete process of connecting your booking form to Google Calendar and Google Sheets, ensuring all booking data is stored and organized automatically.

## Overview of the Solution

Here's what we've set up:

1. **GitHub Pages Website**
   - Beautiful, responsive website hosted for free
   - Booking form for customers to request services
   - Local backup of bookings in browser localStorage
   - Password-protected bookings management page

2. **Google Apps Script Integration**
   - Google Apps Script web app to process booking data
   - Google Calendar integration to create events
   - Google Sheets integration to store booking data
   - Email notifications for new bookings
   - Fallback mechanism if cloud integration fails

This approach gives you:
- **Reliability**: Bookings are stored locally even if cloud integration fails
- **Organization**: All bookings are added to your Google Calendar automatically
- **Record Keeping**: Complete history of bookings in Google Sheets
- **Communication**: Email notifications for you and your customers
- **Zero Cost**: Uses free tiers of GitHub Pages and Google Apps Script

## Step-by-Step Implementation

### Step 1: Set up Google APIs

Follow the instructions in `GOOGLE_API_SETUP.md` to:
1. Enable Google Calendar and Google Sheets APIs
2. Create a Google Sheet for booking data (name the sheet "Bookings")

### Step 2: Deploy the Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/) and create a new project
2. Delete any code in the editor and copy-paste the entire contents of the `apps_script/BookingHandler.js` file
3. Update the CONFIG variables at the top of the script:
   - Set `CALENDAR_ID` to your Google Calendar ID (or use 'primary' for your main calendar)
   - Set `SPREADSHEET_ID` to the ID of your Google Sheet (found in the URL)
   - Set `ADMIN_EMAIL` to the email where you want to receive booking notifications
   - Update the timezone if needed
4. Save the project with a name like "CCS Booking Handler"
5. Deploy the script as a web app:
   - Click "Deploy" > "New deployment"
   - Select "Web app" as the deployment type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
   - Copy the Web App URL that is generated

### Step 3: Update Your Website

After getting the Google Apps Script Web App URL from Step 2:

1. Open `docs/js/main.js` and locate this line:
   ```javascript
   const response = await fetch('https://script.google.com/macros/s/YOUR_APPS_SCRIPT_DEPLOYMENT_ID/exec', {
   ```
2. Replace `YOUR_APPS_SCRIPT_DEPLOYMENT_ID` with the deployment ID from your Apps Script web app URL
   - The deployment ID is the long string of letters and numbers in the URL
   - The URL format is: `https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec`
3. Commit and push these changes to GitHub
4. Wait a few minutes for GitHub Pages to update

### Step 4: Test the Integration

1. Submit a test booking through your website
2. Verify it appears in:
   - Your Google Calendar
   - Your Google Sheet
   - Your email inbox (if you provided an email in the booking)
   - The bookings management page at `/bookings.html`

## Troubleshooting

### Booking Not Sent to Google

If the form submits but data doesn't appear in your Google services:

1. Open browser DevTools (F12) and check the Console for errors
2. Verify that the Apps Script deployment URL is correct in main.js
3. Check that you've given the correct permissions in the Apps Script deployment
4. Try submitting a booking again

### Emails Not Being Sent

If booking data is saved but emails aren't being received:

1. Check the `SEND_EMAILS` config is set to `true`
2. Verify the `ADMIN_EMAIL` is correct
3. In Google Apps Script editor, check the Execution logs for errors

### CORS Errors

If you see CORS (Cross-Origin Resource Sharing) errors:

1. Make sure your Apps Script deployment is set to "Anyone, even anonymous" can access
2. Try a different browser to rule out extension issues

## Managing Bookings

### In Google Calendar

- Bookings appear as events in your calendar with all the customer details
- You can reschedule by moving the events in your calendar
- Use calendar reminders for upcoming bookings

### In Google Sheets

- All booking data is stored in your Google Sheet
- You can add a "Status" column to track booking state (Confirmed, Completed, etc.)
- Sort and filter bookings as needed

### In the Website Admin Panel

- Access the admin panel at `/bookings.html` with password: `ccs2024admin`
- View all bookings stored locally in the browser
- Export bookings to CSV if needed

## Future Enhancements

Once this basic integration is working, consider these future enhancements:

1. **SMS Notifications**: Add text message alerts for new bookings
2. **Customer Portal**: Allow customers to view and manage their bookings
3. **Advanced Calendar Integration**: Enable calendar availability checking
4. **Online Payments**: Add payment processing capabilities 