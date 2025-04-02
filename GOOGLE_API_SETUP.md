# Google API Setup for Cousins Collective Services

This guide will walk you through setting up Google Calendar and Google Sheets integration for your booking system using Google Apps Script.

## Step 1: Create/Configure Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Select your existing project "enduring-branch-455605-j6" or create a new project

3. Enable the required APIs:
   - Navigate to "APIs & Services" > "Library"
   - Search for and enable these APIs:
     - Google Calendar API
     - Google Sheets API
     - Apps Script API

## Step 2: Create a Google Sheet for Bookings

1. Go to [Google Sheets](https://sheets.google.com/)

2. Create a new spreadsheet named "CCS Bookings"

3. Set up the following columns in the first row:
   - Name
   - Phone
   - Email
   - Service
   - Date
   - Time
   - Address
   - Details
   - Timestamp
   - Status

4. Note the Spreadsheet ID (found in the URL):
   - Example: `https://docs.google.com/spreadsheets/d/`**`1ABC123_spreadsheet_id_here`**`/edit`
   - Save this ID for later use in the Apps Script configuration

## Step 3: Set Up Google Calendar

1. Go to [Google Calendar](https://calendar.google.com/)

2. Create a new calendar specifically for CCS bookings (optional but recommended):
   - Click the "+" next to "Other calendars"
   - Select "Create new calendar"
   - Name it "CCS Bookings"
   - Add a description and set the timezone
   - Click "Create calendar"

3. Get your Calendar ID:
   - In the left sidebar, hover over your new calendar
   - Click the three dots (...) that appear
   - Select "Settings and sharing"
   - Scroll down to the "Integrate calendar" section
   - Copy the "Calendar ID" (it looks like an email address)
   - Save this ID for later use in the Apps Script configuration

## Step 4: Create the Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)

2. Click "+ New project" to create a new Apps Script project

3. Delete any code that appears by default

4. Name your project "CCS Booking Handler" (click on "Untitled project" at the top)

5. Copy and paste the contents of `apps_script/BookingHandler.js` into the editor

6. Update the CONFIG object at the top of the script with:
   - Your Calendar ID
   - Your Spreadsheet ID
   - Your email address for admin notifications
   - Your timezone if needed

7. Save the project (File > Save or Ctrl+S)

## Step 5: Deploy as Web App

1. In your Apps Script project, click on "Deploy" > "New deployment"

2. Select "Web app" as the deployment type

3. Configure the following:
   - Description: "CCS Booking Handler v1"
   - Execute as: "Me" (your Google account)
   - Who has access: "Anyone"

4. Click "Deploy"

5. You'll be prompted to authorize the script to access your Google account:
   - Click "Authorize access"
   - Choose your Google account
   - If warned about "unverified app", click "Advanced" and "Go to CCS Booking Handler (unsafe)"
   - Click "Allow" to grant the permissions

6. Copy the "Web app URL" that is displayed after deployment
   - It should look like: `https://script.google.com/macros/s/[LONG_ID]/exec`
   - This is the URL your website will use to send booking data

## Step 6: Update Your Website with the App URL

1. Open `docs/js/main.js` in your code editor

2. Find this line:
   ```javascript
   const response = await fetch('https://script.google.com/macros/s/YOUR_APPS_SCRIPT_DEPLOYMENT_ID/exec', {
   ```

3. Replace `YOUR_APPS_SCRIPT_DEPLOYMENT_ID` with the deployment ID from your Web app URL
   - The deployment ID is the long string between `/s/` and `/exec`

4. Save the file and commit your changes to GitHub

## Testing the Integration

1. Submit a test booking through your website

2. Check your Google Calendar to see if the appointment was created

3. Check your Google Sheet to see if the booking was recorded

4. Check your email for booking notifications

If any step fails, check the troubleshooting section in the `COMPLETE_INTEGRATION_GUIDE.md` file. 