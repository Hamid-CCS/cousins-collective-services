# Google API Integration - Currently Not Implemented

## Important Note

The Cousins Collective Services website **currently does not use Google APIs**. Instead, all booking data is stored locally in the browser's localStorage. This approach was chosen for simplicity and reliability.

## Why We Switched to LocalStorage

- **Simplicity**: No need to manage API credentials or worry about quota limits
- **Reliability**: Works offline and doesn't depend on external services
- **Privacy**: All data stays on the user's device
- **Zero Cost**: No billing or subscription required

## If You Need Google Integration in the Future

If you decide to implement Google integration in the future, you would need to:

1. Enable the Google Calendar API and Google Sheets API in the Google Cloud Console
2. Create OAuth credentials for web applications
3. Implement a Google Apps Script to handle the integration between your website and Google services
4. Update the website code to send booking data to the Google Apps Script instead of storing it in localStorage

## Data Export Options

Even without Google integration, you can still:

1. Export bookings to CSV from the admin panel
2. Manually import the CSV into Google Sheets
3. Create calendar events manually from the exported data

## Contact for Assistance

If you decide to implement Google API integration in the future, please contact the developer for assistance with setting up the necessary components. 