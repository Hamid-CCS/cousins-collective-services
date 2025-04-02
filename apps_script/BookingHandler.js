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
 *    - Set "Execute as" to "ME" (important!)
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
  SHEET_NAME: 'Bookings', // Changed to match your actual sheet name seen in the diagnostic
  
  // Email settings
  SEND_EMAILS: false, // Disable emails for now to focus on other functionality
  FROM_NAME: 'Cousins Collective Services',
  ADMIN_EMAIL: 'hamid@cousinscollectiveservices.com',
  
  // Time zone for calendar events
  TIMEZONE: 'America/Los_Angeles', // Change to your time zone
  
  // Debug mode - set to true for verbose logging
  DEBUG: true
};

// Global log array to capture all logs
const logs = [];

/**
 * Custom logger that captures logs for later retrieval
 */
function log(level, message, data) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data: data !== undefined ? (typeof data === 'object' ? JSON.stringify(data) : data) : undefined
  };
  
  logs.push(logEntry);
  
  // Also log to console
  if (level === 'ERROR') {
    console.error(`[${timestamp}] ${message}`, data);
  } else if (level === 'WARN') {
    console.warn(`[${timestamp}] ${message}`, data);
  } else {
    console.log(`[${timestamp}] ${message}`, data);
  }
}

// Shorthand logging methods
function logInfo(message, data) { if (CONFIG.DEBUG) log('INFO', message, data); }
function logWarn(message, data) { log('WARN', message, data); }
function logError(message, data) { log('ERROR', message, data); }

/**
 * Main entry point - handles all HTTP requests to this web app
 */
function doPost(e) {
  logInfo('==== START doPost ====', e ? { contentLength: e.postData ? e.postData.length : 'no data' } : 'no event');
  logInfo('Request details:', e);
  
  try {
    // Parse the incoming data
    let bookingData;
    try {
      // Handle both form data and direct JSON
      if (e.parameter && e.parameter.data) {
        // Form data approach
        logInfo('Received form data parameter:', e.parameter.data);
        bookingData = JSON.parse(e.parameter.data);
      } else if (e.postData && e.postData.contents) {
        // Direct JSON approach
        logInfo('Received postData contents:', e.postData.contents);
        bookingData = JSON.parse(e.postData.contents);
      } else {
        // Try parameters as a last resort
        logInfo('Trying to parse from parameters:', e.parameters);
        const allParams = e.parameters;
        if (allParams && allParams.data && allParams.data.length > 0) {
          bookingData = JSON.parse(allParams.data[0]);
        } else {
          throw new Error("No valid data found in the request");
        }
      }
      logInfo('Parsed booking data:', bookingData);
    } catch (error) {
      logError('Data parsing error:', { error: error.toString(), event: JSON.stringify(e) });
      return HtmlService.createHtmlOutput(
        "Error: Invalid data format. Please check the console logs."
      );
    }
    
    // Validate the booking data
    if (!validateBooking(bookingData)) {
      logError('Missing required booking data', bookingData);
      return HtmlService.createHtmlOutput(
        "Error: Missing required booking information. Check the logs for details."
      );
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
      logInfo('Adding to sheet', bookingData);
      const rowIndex = addToSheet(bookingData);
      results.sheetSuccess = true;
      results.rowIndex = rowIndex;
      logInfo('Successfully added to sheet at row:', rowIndex);
    } catch (sheetError) {
      results.sheetError = sheetError.toString();
      logError('Failed to add to sheet:', sheetError);
    }
    
    // Then try to add to calendar
    try {
      logInfo('Adding to calendar', bookingData);
      const eventId = addToCalendar(bookingData);
      results.calendarSuccess = true;
      results.eventId = eventId;
      logInfo('Successfully added to calendar with ID:', eventId);
    } catch (calendarError) {
      results.calendarError = calendarError.toString();
      logError('Failed to add to calendar:', calendarError);
    }
    
    // Return a success page for form submissions
    logInfo('==== END doPost ====', { success: results.sheetSuccess || results.calendarSuccess });
    
    if (results.sheetSuccess || results.calendarSuccess) {
      return HtmlService.createHtmlOutput(
        "<h1>Booking Received</h1><p>Your booking has been successfully processed.</p><p>You can close this window now.</p>"
      );
    } else {
      return HtmlService.createHtmlOutput(
        "<h1>Booking Error</h1><p>There was an issue processing your booking.</p><p>Please contact us directly.</p>"
      );
    }
    
  } catch (error) {
    // Log the error and return an error response
    logError('Global error in doPost:', error);
    return HtmlService.createHtmlOutput(
      "<h1>System Error</h1><p>There was a system error processing your booking.</p><p>Please try again later or contact us directly.</p>"
    );
  }
}

/**
 * Handle GET requests (for testing the deployment)
 */
function doGet(e) {
  logInfo('Handling GET request', e ? e.parameters : 'No parameters');
  
  // Test access to services and return diagnostics
  const calendarAccess = testCalendarAccess();
  const sheetAccess = testSheetAccess();
  
  // Get actual user information
  const userInfo = {
    email: Session.getEffectiveUser().getEmail(),
    timezone: Session.getScriptTimeZone()
  };
  logInfo('Script running as user', userInfo);
  
  // Check all OAuth scopes
  const requiredScopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/spreadsheets'
  ];
  const scopeStatus = checkOAuthScopes(requiredScopes);
  
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'online',
      message: 'CCS Booking Handler is running',
      timestamp: new Date().toISOString(),
      calendarAccess: calendarAccess,
      sheetAccess: sheetAccess,
      scriptIdentity: userInfo,
      scopeStatus: scopeStatus,
      config: {
        calendarId: CONFIG.CALENDAR_ID,
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        sheetName: CONFIG.SHEET_NAME,
        timezone: CONFIG.TIMEZONE
      },
      logs: logs
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test if we can access the calendar
 */
function testCalendarAccess() {
  logInfo('Testing calendar access');
  
  try {
    // Try to get the calendar
    let calendar;
    try {
      calendar = CalendarApp.getDefaultCalendar();
      logInfo('Found default calendar', calendar.getName());
      return {
        success: true,
        name: calendar.getName(),
        message: "Successfully accessed default calendar"
      };
    } catch (e) {
      logError('Could not access default calendar', e);
      
      // Try alternative methods
      try {
        const allCalendars = CalendarApp.getAllOwnedCalendars();
        logInfo('Found all calendars', allCalendars.map(c => c.getName()));
        
        if (allCalendars && allCalendars.length > 0) {
          return {
            success: true,
            name: allCalendars[0].getName(),
            message: "Found calendar via getAllOwnedCalendars",
            allCalendars: allCalendars.map(c => c.getName())
          };
        }
      } catch (altError) {
        logError('Could not access any calendars', altError);
      }
      
      return {
        success: false,
        error: e.toString(),
        message: "Could not access default calendar"
      };
    }
  } catch (error) {
    logError('Error testing calendar access', error);
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
  logInfo('Testing spreadsheet access', CONFIG.SPREADSHEET_ID);
  
  try {
    // Try to open the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheets = spreadsheet.getSheets();
    logInfo('Found spreadsheet', { name: spreadsheet.getName(), sheets: sheets.map(s => s.getName()) });
    
    return {
      success: true,
      name: spreadsheet.getName(),
      message: "Successfully accessed spreadsheet",
      sheets: sheets.map(s => s.getName())
    };
  } catch (error) {
    logError('Could not access spreadsheet', error);
    return {
      success: false,
      error: error.toString(),
      message: "Could not access spreadsheet"
    };
  }
}

/**
 * Check if all required OAuth scopes are authorized
 */
function checkOAuthScopes(requiredScopes) {
  logInfo('Checking OAuth scopes');
  
  const results = {};
  
  try {
    // Try calendar scope
    if (requiredScopes.includes('https://www.googleapis.com/auth/calendar')) {
      try {
        const calendar = CalendarApp.getDefaultCalendar();
        results['calendar'] = {
          authorized: true,
          name: calendar.getName()
        };
      } catch (e) {
        results['calendar'] = {
          authorized: false,
          error: e.toString()
        };
      }
    }
    
    // Try spreadsheet scope
    if (requiredScopes.includes('https://www.googleapis.com/auth/spreadsheets')) {
      try {
        const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
        results['spreadsheets'] = {
          authorized: true,
          name: spreadsheet.getName()
        };
      } catch (e) {
        results['spreadsheets'] = {
          authorized: false,
          error: e.toString()
        };
      }
    }
    
    return {
      success: true,
      results: results
    };
  } catch (error) {
    logError('Error checking OAuth scopes', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Add a booking to Google Calendar
 */
function addToCalendar(booking) {
  logInfo('Starting calendar integration');
  
  try {
    // Check which calendars we have access to
    const allCalendars = CalendarApp.getAllOwnedCalendars();
    const calendarNames = allCalendars.map(c => c.getName());
    logInfo('Available calendars', calendarNames);
    
    // Try to use the specified calendar
    let calendar;
    if (CONFIG.CALENDAR_ID === 'primary') {
      calendar = CalendarApp.getDefaultCalendar();
      logInfo('Using default calendar', calendar.getName());
    } else {
      // Try to find by ID first
      try {
        calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
        logInfo('Found calendar by ID', calendar.getName());
      } catch (e) {
        logError('Could not find calendar by ID', e);
        
        // Try to find by name as fallback
        const matchingCalendars = allCalendars.filter(c => c.getName().includes('CCS'));
        if (matchingCalendars.length > 0) {
          calendar = matchingCalendars[0];
          logInfo('Using calendar by name match', calendar.getName());
        } else {
          // Last resort: use default calendar
          calendar = CalendarApp.getDefaultCalendar();
          logInfo('Falling back to default calendar', calendar.getName());
        }
      }
    }
    
    if (!calendar) {
      throw new Error('Could not find any usable calendar');
    }
    
    // Parse date and time
    const dateString = booking.date;
    const timeString = booking.time || '10:00 AM';
    
    logInfo('Creating event for date/time', { date: dateString, time: timeString });
    
    // Create JavaScript Date object
    const eventDate = parseDateTime(dateString, timeString);
    logInfo('Parsed date object', eventDate);
    
    // End time (2 hours after start)
    const endTime = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000));
    
    // Create event description
    const description = `
Phone: ${booking.phone}
Email: ${booking.email || 'Not provided'}
Service: ${booking.service}
Details: ${booking.details || 'No details provided'}
  `;
    
    logInfo('Creating calendar event', { 
      title: `${booking.service} for ${booking.name}`, 
      start: eventDate.toString(), 
      end: endTime.toString() 
    });
    
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
    
    const eventId = event.getId();
    logInfo('Event created successfully with ID', eventId);
    
    return eventId;
  } catch (error) {
    logError('Error in addToCalendar', error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Add a booking to Google Sheets
 */
function addToSheet(booking) {
  logInfo('Starting spreadsheet integration');
  
  try {
    // List all accessible spreadsheets for debugging
    try {
      const allSpreadsheets = SpreadsheetApp.getActiveSpreadsheet() ? 
        [SpreadsheetApp.getActiveSpreadsheet().getName()] : 
        ['No active spreadsheet'];
      logInfo('Accessible spreadsheets', allSpreadsheets);
    } catch (e) {
      logInfo('No active spreadsheet available');
    }
    
    // Open the spreadsheet by ID
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      logInfo('Opened spreadsheet by ID', spreadsheet.getName());
    } catch (idError) {
      logError('Failed to open spreadsheet by ID', idError);
      
      // Try to find by name as fallback
      try {
        const spreadsheets = DriveApp.getFilesByName('CCS');
        if (spreadsheets.hasNext()) {
          const file = spreadsheets.next();
          spreadsheet = SpreadsheetApp.open(file);
          logInfo('Opened spreadsheet by name search', spreadsheet.getName());
        } else {
          throw new Error('Could not find spreadsheet by name');
        }
      } catch (nameError) {
        logError('Failed to open spreadsheet by name', nameError);
        throw new Error('Could not access spreadsheet: ' + idError.toString());
      }
    }
    
    if (!spreadsheet) {
      throw new Error('Could not find any usable spreadsheet');
    }
    
    // Get or create the sheet
    let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
    
    // If specified sheet doesn't exist, list available sheets for debugging
    if (!sheet) {
      const allSheets = spreadsheet.getSheets();
      const sheetNames = allSheets.map(s => s.getName());
      logInfo('Available sheets', sheetNames);
      
      // Try to use the first sheet
      if (allSheets.length > 0) {
        sheet = allSheets[0];
        logInfo('Using first available sheet', sheet.getName());
      } else {
        // Create a new sheet
        logInfo('No sheets found, creating new sheet', CONFIG.SHEET_NAME);
        sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
      }
    } else {
      logInfo('Found existing sheet', CONFIG.SHEET_NAME);
    }
    
    // Check if the sheet has headers
    const firstRow = sheet.getRange(1, 1, 1, 10).getValues()[0];
    const hasHeaders = firstRow.some(cell => cell !== '');
    
    // Add header row if needed
    if (!hasHeaders) {
      const headers = [
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
      ];
      
      logInfo('Adding header row', headers);
      sheet.appendRow(headers);
      
      // Format header row
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    // Format the date
    let formattedDate = booking.date;
    try {
      const date = new Date(booking.date);
      formattedDate = Utilities.formatDate(date, CONFIG.TIMEZONE, 'MM/dd/yyyy');
    } catch (e) {
      logError('Date formatting error', e);
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
    
    logInfo('Appending row data', rowData);
    
    // Append the data
    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    logInfo('Data appended successfully at row', lastRow);
    
    return lastRow;
  } catch (error) {
    logError('Error in addToSheet', error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Helper function to validate booking data
 */
function validateBooking(booking) {
  // Check for required fields
  const requiredFields = ['name', 'phone', 'service', 'date', 'address'];
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!booking || !booking[field]) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    logError('Validation failed - missing fields', missingFields);
    return false;
  }
  
  logInfo('Booking data validated successfully');
  return true;
}

/**
 * Helper function to parse date and time strings
 */
function parseDateTime(dateString, timeString) {
  logInfo('Parsing date and time', { date: dateString, time: timeString });
  
  // Make sure we have a valid date string
  if (!dateString || dateString.trim() === '') {
    const error = new Error("Empty date string");
    logError('Date parsing error', error);
    throw error;
  }
  
  let date;
  try {
    date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      const error = new Error("Invalid date: " + dateString);
      logError('Date parsing error', error);
      throw error;
    }
  } catch (e) {
    logError('Error creating date object', e);
    throw e;
  }
  
  // Default time if no time string is provided
  if (!timeString || timeString.trim() === '') {
    timeString = '10:00 AM';
    logInfo('Using default time', timeString);
  }
  
  // Parse the time
  let hours = 10;
  let minutes = 0;
  
  try {
    // Try to parse the time string (handles both '10:00 AM' and '10:00')
    const timeMatch = timeString.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      
      logInfo('Parsed time components', { hours, minutes, period: timeMatch[3] });
      
      // Handle PM
      if (timeMatch[3] && timeMatch[3].toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
        logInfo('Adjusted hours for PM', hours);
      }
      
      // Handle 12 AM
      if (timeMatch[3] && timeMatch[3].toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
        logInfo('Adjusted hours for 12 AM', hours);
      }
    } else {
      logWarn('Could not parse time format, using default 10:00 AM', timeString);
    }
  } catch (e) {
    logError('Error parsing time string', e);
  }
  
  // Set the time on the date object
  date.setHours(hours, minutes, 0, 0);
  
  logInfo('Final parsed datetime', date.toISOString());
  return date;
} 