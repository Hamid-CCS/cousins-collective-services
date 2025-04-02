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
 *    - Set "Who has access" to "Anyone, even anonymous"
 *    - Copy the web app URL for use in your website
 */

// Configuration - Update these values
const CONFIG = {
  // The ID of your Google Calendar (found in calendar settings)
  CALENDAR_ID: 'hamid@cousinscollectiveservices.com', // e.g. 'primary' or specific calendar ID
  
  // The ID of your Google Sheet (from the URL)
  SPREADSHEET_ID: '1OW55nUXA8PwC57mpkkmdQ5wfs6TmyFgEiRYJ1UL9W28',
  
  // The name of the sheet to store bookings (default is 'Sheet1')
  SHEET_NAME: 'Bookings',
  
  // Email settings
  SEND_EMAILS: true,
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
      return outputError('Invalid JSON data');
    }
    
    // Validate the booking data
    if (!validateBooking(bookingData)) {
      console.error("Missing required booking data");
      return outputError('Missing required booking information');
    }
    
    // Process the booking
    console.log("Processing booking...");
    const result = processBooking(bookingData);
    console.log("Booking processed with result:", JSON.stringify(result));
    
    // Return success response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Booking processed successfully',
        calendarEventId: result.eventId,
        sheetRow: result.rowIndex
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log the error and return an error response
    console.error('Error processing booking:', error);
    return outputError(error.toString());
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
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Process a booking by adding it to Calendar and Sheets
 */
function processBooking(booking) {
  try {
    // Add to calendar
    console.log("Adding to calendar...");
    const eventId = addToCalendar(booking);
    console.log("Event created with ID:", eventId);
    
    // Add to spreadsheet
    console.log("Adding to spreadsheet...");
    const rowIndex = addToSheet(booking);
    console.log("Added to row:", rowIndex);
    
    // Send confirmation emails
    if (CONFIG.SEND_EMAILS) {
      try {
        console.log("Sending emails...");
        sendConfirmationEmails(booking);
        console.log("Emails sent successfully");
      } catch (error) {
        console.error('Error sending emails:', error);
        // Continue processing even if emails fail
      }
    }
    
    return {
      eventId: eventId,
      rowIndex: rowIndex
    };
  } catch (error) {
    console.error("Error in processBooking:", error);
    throw error;
  }
}

/**
 * Add a booking to Google Calendar
 */
function addToCalendar(booking) {
  try {
    // Try using primary calendar if the configured ID doesn't work
    let calendar;
    try {
      calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
    } catch (e) {
      console.log("Couldn't find calendar with ID, trying primary calendar");
      calendar = CalendarApp.getDefaultCalendar();
    }
    
    if (!calendar) {
      console.log("Still no calendar found, trying primary calendar again");
      calendar = CalendarApp.getDefaultCalendar();
      
      if (!calendar) {
        throw new Error("Could not find any calendar to add events to");
      }
    }
    
    // Parse date and time
    const dateString = booking.date;
    const timeString = booking.time || '10:00 AM';
    
    console.log("Creating event for date:", dateString, "time:", timeString);
    
    // Create JavaScript Date object
    const eventDate = parseDateTime(dateString, timeString);
    console.log("Parsed date object:", eventDate);
    
    // End time (2 hours after start)
    const endTime = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000));
    
    // Create event 
    const event = calendar.createEvent(
      `${booking.service} for ${booking.name}`,
      eventDate,
      endTime,
      {
        description: `
Phone: ${booking.phone}
Email: ${booking.email || 'Not provided'}
Service: ${booking.service}
Details: ${booking.details || 'No details provided'}
      `,
        location: booking.address,
        sendInvites: false
      }
    );
    
    // Add reminders (1 day and 1 hour before)
    event.addEmailReminder(24 * 60);
    event.addPopupReminder(60);
    
    return event.getId();
  } catch (error) {
    console.error("Error in addToCalendar:", error);
    throw error;
  }
}

/**
 * Add a booking to Google Sheets
 */
function addToSheet(booking) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    console.log("Opened spreadsheet with ID:", CONFIG.SPREADSHEET_ID);
    
    // Get the sheet, create it if it doesn't exist
    let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      console.log("Creating new sheet:", CONFIG.SHEET_NAME);
      sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
      // Add header row
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
    
    // Append booking data
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
    
    console.log("Appending row data:", rowData);
    sheet.appendRow(rowData);
    
    // Return the row index
    return sheet.getLastRow();
  } catch (error) {
    console.error("Error in addToSheet:", error);
    throw error;
  }
}

/**
 * Send confirmation emails for a new booking
 */
function sendConfirmationEmails(booking) {
  // Only send email if an email was provided
  if (!booking.email || booking.email === 'Not provided') {
    console.log("No email provided, skipping email notifications");
    return;
  }
  
  // Format date for email
  let formattedDate = booking.date;
  try {
    const date = new Date(booking.date);
    formattedDate = Utilities.formatDate(date, CONFIG.TIMEZONE, 'EEEE, MMMM d, yyyy');
  } catch (e) {
    console.error('Date formatting error:', e);
  }
  
  // Send confirmation to customer
  const customerSubject = `Booking Confirmation - ${booking.service} - Cousins Collective Services`;
  const customerBody = `
Dear ${booking.name},

Thank you for booking with Cousins Collective Services! 

We have received your booking for the following service:

Service: ${booking.service}
Date: ${formattedDate}
Time: ${booking.time || '10:00 AM'}
Location: ${booking.address}

We will contact you shortly to confirm your appointment. If you need to make any changes, please call or text us.

Thank you for choosing Cousins Collective Services!

Best regards,
The CCS Team
  `;
  
  // Send confirmation to admin
  const adminSubject = `New Booking: ${booking.service} for ${booking.name}`;
  const adminBody = `
A new booking has been received:

Name: ${booking.name}
Phone: ${booking.phone}
Email: ${booking.email || 'Not provided'}
Service: ${booking.service}
Date: ${formattedDate}
Time: ${booking.time || '10:00 AM'}
Address: ${booking.address}
Details: ${booking.details || 'No details provided'}
Timestamp: ${new Date().toLocaleString()}

This booking has been added to your calendar and the booking spreadsheet.
  `;
  
  try {
    // Send emails
    console.log("Sending email to customer:", booking.email);
    GmailApp.sendEmail(booking.email, customerSubject, customerBody, {
      name: CONFIG.FROM_NAME
    });
    
    console.log("Sending email to admin:", CONFIG.ADMIN_EMAIL);
    GmailApp.sendEmail(CONFIG.ADMIN_EMAIL, adminSubject, adminBody, {
      name: 'CCS Booking System'
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    throw error;
  }
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
  try {
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
  } catch (error) {
    console.error("Error parsing datetime:", error);
    // Return a default date/time if parsing fails
    const defaultDate = new Date();
    defaultDate.setHours(10, 0, 0, 0);
    return defaultDate;
  }
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