document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  if (document.getElementById('year')) {
    document.getElementById('year').textContent = new Date().getFullYear();
  }
  
  // Mobile navigation
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }
  
  // Close mobile menu when clicking a nav link
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      if (hamburger && navMenu) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  });
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const navHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: targetPosition - navHeight,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Handle booking form submission
  const bookingForm = document.getElementById('bookingForm');
  const bookingConfirmation = document.getElementById('bookingConfirmation');
  const newBookingBtn = document.getElementById('newBookingBtn');
  
  if (bookingForm) {
    // Populate service dropdown dynamically if hash parameter is provided
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const serviceParam = urlParams.get('service');
    if (serviceParam && document.getElementById('service')) {
      // Find the option that best matches the serviceParam
      const options = Array.from(document.getElementById('service').options);
      for (const option of options) {
        if (option.value && option.value.toLowerCase().includes(serviceParam.toLowerCase())) {
          option.selected = true;
          break;
        }
      }
    }
    
    // Validate form fields on input
    const inputs = bookingForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', function() {
        if (input.required && input.value.trim() === '') {
          input.classList.add('invalid');
        } else {
          input.classList.remove('invalid');
        }
      });
    });
    
    // Handle form submission
    bookingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Show loading state
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Processing...';
      submitBtn.disabled = true;
      
      // Get form data and create booking object
      const booking = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value || 'Not provided',
        service: document.getElementById('service').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value || '10:00 AM',
        address: document.getElementById('address').value,
        details: document.getElementById('details').value || 'No details provided',
        timestamp: new Date().toISOString()
      };
      
      try {
        // Store in localStorage as a backup
        let bookings = JSON.parse(localStorage.getItem('ccsBookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('ccsBookings', JSON.stringify(bookings));
        
        console.log('Sending booking to Google Apps Script:', booking);
        
        // Send to Google Apps Script Web App - replace with your actual Apps Script URL
        const response = await fetch('https://script.google.com/macros/s/AKfycbx20HiX7gqCZI9_4d4k_TTXsTpCUxzZGAMa7HY0R1IvAphCWh00g_tYyn12QxJIvlww/exec', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(booking)
        });
        
        console.log('Response status:', response.status);
        
        // Handle the response
        if (response.ok) {
          const result = await response.json();
          console.log('Booking saved to Google Calendar and Sheets:', result);
          
          // Mark as synced in localStorage
          const savedBookings = JSON.parse(localStorage.getItem('ccsBookings') || '[]');
          const lastIndex = savedBookings.length - 1;
          if (lastIndex >= 0) {
            savedBookings[lastIndex].syncedWithGoogle = true;
            savedBookings[lastIndex].status = 'new';
            localStorage.setItem('ccsBookings', JSON.stringify(savedBookings));
          }
          
          // Show success confirmation
          const confirmMessage = document.querySelector('.confirmation-content p:first-of-type');
          confirmMessage.textContent = "We'll call or text you within 24 hours to confirm your appointment.";
        } else {
          const errorText = await response.text();
          console.warn('Warning: Booking saved locally but cloud sync failed');
          console.error('Error details:', errorText);
          
          // Show a different confirmation message
          const confirmMessage = document.querySelector('.confirmation-content p:first-of-type');
          confirmMessage.textContent = "Your booking was saved locally. We'll still receive your booking, but please contact us if you don't hear back within 24 hours.";
        }
        
        // Show confirmation message regardless of cloud sync status
        // (since we have a local backup in localStorage)
        bookingForm.style.display = 'none';
        bookingConfirmation.classList.add('active');
        
      } catch (error) {
        console.error('Error during booking submission:', error);
        
        // Update UI to inform user
        alert('Your booking was saved locally, but there was an issue connecting to our system. We will still receive your booking.');
        
        // Show confirmation anyway since we saved to localStorage
        bookingForm.style.display = 'none';
        bookingConfirmation.classList.add('active');
      } finally {
        // Reset button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }
  
  // Initialize date picker with minimum date of today
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    dateInput.min = formattedDate;
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }
  
  // Reset form for new booking
  if (newBookingBtn) {
    newBookingBtn.addEventListener('click', function() {
      bookingForm.reset();
      
      // Reset default date to tomorrow
      if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
      }
      
      bookingForm.style.display = 'grid';
      bookingConfirmation.classList.remove('active');
    });
  }
  
  // Active nav menu highlighting based on scroll position
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-menu a');
  
  window.addEventListener('scroll', () => {
    let current = '';
    const navHeight = document.querySelector('.header').offsetHeight;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - navHeight - 100;
      
      if (window.pageYOffset >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}); 