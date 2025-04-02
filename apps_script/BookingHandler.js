/**
 * CCS Booking Handler - Google Apps Script
 * 
 * This script handles booking data from the CCS website and:
 * 1. Adds events to Google Calendar
 * 2. Stores booking data in Google Sheets
 * 3. Sends confirmation emails
 * 
 * To deploy:
 * 1. Create a new Google Apps Script project at https://script.google.com/
 * 2. Copy this code into the project
 * 3. Deploy as a web app (Publish > Deploy as web app)
 *    - Set "Who has access" to "Anyone"
 *    - Copy the web app URL for use in your website
 */

// Configuration - Update these values
const CONFIG = {
  // The ID of your Google Calendar (found in calendar settings)
  CALENDAR_ID: 'primary', // Using primary calendar for simplest setup
  
  // The ID of your Google Sheet (from the URL)
  SPREADSHEET_ID: '1OW55nUXA8PwC57mpkkmdQ5wfs6TmyFgEiRYJ1UL9W28',
  
  // The name of the sheet to store bookings (default is 'Sheet1')
  SHEET_NAME: 'Sheet1',
  
  // Email settings
  SEND_EMAILS: false, // Disable emails for now to focus on other functionality
  FROM_NAME: 'Cousins Collective Services',
  ADMIN_EMAIL: 'hamid@cousinscollectiveservices.com',
  
  // Time zone for calendar events
  TIMEZONE: 'America/Los_Angeles' // Change to your time zone
};

/**
 * Main entry point - handles all HTTP requests to this web app
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    let bookingData;
    try {
      bookingData = JSON.parse(e.postData.contents);
      console.log("Received booking data:", JSON.stringify(bookingData));
    } catch (error) {
      console.error("JSON parsing error:", error);
      return outputError('Invalid JSON data: ' + error);
    }
    
    // Validate the booking data
    if (!validateBooking(bookingData)) {
      console.error("Missing required booking data");
      return outputError('Missing required booking information');
    }
    
    // Results object to track what succeeded
    const results = {
      sheetSuccess: false,
      calendarSuccess: false,
      sheetError: null,
      calendarError: null
    };
    
    // First try to add to spreadsheet
    try {
      const rowIndex = addToSheet(bookingData);
      results.sheetSuccess = true;
      results.rowIndex = rowIndex;
      console.log("Successfully added to sheet at row:", rowIndex);
    } catch (sheetError) {
      results.sheetError = sheetError.toString();
      console.error("Failed to add to sheet:", sheetError);
    }
    
    // Then try to add to calendar
    try {
      const eventId = addToCalendar(bookingData);
      results.calendarSuccess = true;
      results.eventId = eventId;
      console.log("Successfully added to calendar with ID:", eventId);
    } catch (calendarError) {
      results.calendarError = calendarError.toString();
      console.error("Failed to add to calendar:", calendarError);
    }
    
    // Return results with detailed status
    return ContentService
      .createTextOutput(JSON.stringify({
        success: results.sheetSuccess || results.calendarSuccess,
        message: 'Booking processing complete',
        details: results
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log the error and return an error response
    console.error('Error processing booking:', error);
    return outputError('Global error: ' + error.toString());
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  return ContentService
    .createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Handle GET requests (for testing the deployment)
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'online',
      message: 'CCS Booking Handler is running',
      timestamp: new Date().toISOString(),
      calendarAccess: testCalendarAccess(),
      sheetAccess: testSheetAccess()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test if we can access the calendar
 */
function testCalendarAccess() {
  try {
    // Try to get the calendar
    let calendar;
    try {
      calendar = CalendarApp.getDefaultCalendar();
      return {
        success: true,
        name: calendar.getName(),
        message: "Successfully accessed default calendar"
      };
    } catch (e) {
      return {
        success: false,
        error: e.toString(),
        message: "Could not access default calendar"
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      message: "Error testing calendar access"
    };
  }
}

/**
 * Test if we can access the spreadsheet
 */
function testSheetAccess() {
  try {
    // Try to open the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    return {
      success: true,
      name: spreadsheet.getName(),
      message: "Successfully accessed spreadsheet",
      sheets: spreadsheet.getSheets().map(s => s.getName())
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      message: "Could not access spreadsheet"
    };
  }
}

/**
 * Add a booking to Google Calendar
 */
function addToCalendar(booking) {
  console.log("Starting calendar integration...");
  
  // Get the default calendar (primary)
  const calendar = CalendarApp.getDefaultCalendar();
  console.log("Using default calendar:", calendar.getName());
  
  // Parse date and time
  const dateString = booking.date;
  const timeString = booking.time || '10:00 AM';
  
  console.log("Creating event for date:", dateString, "time:", timeString);
  
  // Create JavaScript Date object
  const eventDate = parseDateTime(dateString, timeString);
  console.log("Parsed date object:", eventDate);
  
  // End time (2 hours after start)
  const endTime = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000));
  
  // Create event description
  const description = `
Phone: ${booking.phone}
Email: ${booking.email || 'Not provided'}
Service: ${booking.service}
Details: ${booking.details || 'No details provided'}
  `;
  
  console.log("Creating calendar event");
  
  // Create event
  const event = calendar.createEvent(
    `${booking.service} for ${booking.name}`,
    eventDate,
    endTime,
    {
      description: description,
      location: booking.address
    }
  );
  
  console.log("Event created successfully with ID:", event.getId());
  
  return event.getId();
}

/**
 * Add a booking to Google Sheets
 */
function addToSheet(booking) {
  console.log("Starting spreadsheet integration...");
  console.log("Opening spreadsheet with ID:", CONFIG.SPREADSHEET_ID);
  
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  console.log("Spreadsheet opened successfully:", spreadsheet.getName());
  
  // Get the sheet, create it if it doesn't exist
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    console.log("Sheet not found. Creating new sheet:", CONFIG.SHEET_NAME);
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  } else {
    console.log("Found existing sheet:", CONFIG.SHEET_NAME);
  }
  
  // If this is a new sheet, add the header row
  if (sheet.getLastRow() === 0) {
    console.log("Adding header row to new sheet");
    sheet.appendRow([
      'Name', 
      'Phone', 
      'Email', 
      'Service', 
      'Date', 
      'Time', 
      'Address', 
      'Details', 
      'Timestamp',
      'Status'
    ]);
    
    // Format header row
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  // Format the date nicely for the spreadsheet
  let formattedDate = booking.date;
  try {
    const date = new Date(booking.date);
    formattedDate = Utilities.formatDate(date, CONFIG.TIMEZONE, 'MM/dd/yyyy');
  } catch (e) {
    console.error('Date formatting error:', e);
  }
  
  // Prepare row data
  const rowData = [
    booking.name,
    booking.phone,
    booking.email || 'Not provided',
    booking.service,
    formattedDate,
    booking.time || '10:00 AM',
    booking.address,
    booking.details || 'No details provided',
    new Date().toISOString(),
    'New' // Status column for tracking (New, Confirmed, Completed, Cancelled)
  ];
  
  console.log("Appending row data");
  
  // Append the row
  sheet.appendRow(rowData);
  const lastRow = sheet.getLastRow();
  console.log("Data appended successfully at row:", lastRow);
  
  return lastRow;
}

/**
 * Helper function to validate booking data
 */
function validateBooking(booking) {
  // Required fields
  const result = booking && 
         booking.name && 
         booking.phone && 
         booking.service && 
         booking.date && 
         booking.address;
         
  if (!result) {
    console.log("Validation failed for booking:", JSON.stringify(booking || {}));
  }
  
  return result;
}

/**
 * Helper function to parse date and time strings
 */
function parseDateTime(dateString, timeString) {
  console.log("Parsing date:", dateString, "and time:", timeString);
  
  // Make sure we have a valid date string
  if (!dateString || dateString.trim() === '') {
    throw new Error("Empty date string");
  }
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date: " + dateString);
  }
  
  // Default time if no time string is provided
  if (!timeString || timeString.trim() === '') {
    timeString = '10:00 AM';
  }
  
  // Parse the time
  let hours = 10;
  let minutes = 0;
  
  // Try to parse the time string (handles both '10:00 AM' and '10:00')
  const timeMatch = timeString.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
    
    // Handle PM
    if (timeMatch[3] && timeMatch[3].toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    }
    
    // Handle 12 AM
    if (timeMatch[3] && timeMatch[3].toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
  }
  
  // Set the time
  date.setHours(hours, minutes, 0, 0);
  
  console.log("Parsed datetime:", date.toISOString());
  return date;
}

/**
 * Helper function to create an error response
 */
function outputError(message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      message: message
    }))
    .setMimeType(ContentService.MimeType.JSON);
} 