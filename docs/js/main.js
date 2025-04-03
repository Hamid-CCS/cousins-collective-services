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
    
    // Enhanced form validation feedback
    const inputs = bookingForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      // Add validation styles
      const formGroup = input.closest('.form-group');
      if (formGroup) {
        const label = formGroup.querySelector('label');
        if (label && input.required) {
          label.innerHTML = label.innerHTML + ' <span class="required-star">*</span>';
        }
      }
      
      // Real-time validation feedback
      input.addEventListener('input', function() {
        if (input.required) {
          if (input.value.trim() === '') {
            input.classList.add('invalid');
            input.classList.remove('valid');
          } else {
            input.classList.remove('invalid');
            input.classList.add('valid');
          }
        }
        
        // Special validation for phone
        if (input.id === 'phone' && input.value.trim() !== '') {
          const phonePattern = /^[\d\s\-\(\)]+$/;
          if (!phonePattern.test(input.value)) {
            input.classList.add('invalid');
            input.classList.remove('valid');
          } else {
            input.classList.remove('invalid');
            input.classList.add('valid');
          }
        }
        
        // Special validation for email
        if (input.id === 'email' && input.value.trim() !== '') {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(input.value)) {
            input.classList.add('invalid');
            input.classList.remove('valid');
          } else {
            input.classList.remove('invalid');
            input.classList.add('valid');
          }
        }
      });
      
      // Check on focus out as well
      input.addEventListener('blur', function() {
        if (input.required && input.value.trim() === '') {
          input.classList.add('invalid');
        }
      });
    });
    
    // Handle form submission
    bookingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Validate all required fields first
      let isValid = true;
      bookingForm.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
        if (field.value.trim() === '') {
          field.classList.add('invalid');
          isValid = false;
        }
      });
      
      if (!isValid) {
        // Scroll to the first invalid field
        const firstInvalid = bookingForm.querySelector('.invalid');
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      
      // Show loading state
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      submitBtn.disabled = true;
      
      // Get form data and create booking object
      const booking = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value || 'Not provided',
        service: document.getElementById('service').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value || '10:00 AM',
        address: document.getElementById('address').value,
        details: document.getElementById('details').value || 'No details provided',
        timestamp: new Date().toISOString(),
        status: 'new'
      };
      
      try {
        // Store in localStorage
        let bookings = JSON.parse(localStorage.getItem('ccsBookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('ccsBookings', JSON.stringify(bookings));
        
        console.log('Booking saved to localStorage:', booking);
        
        // Smooth transition to confirmation
        bookingForm.style.opacity = '0';
        setTimeout(() => {
          bookingForm.style.display = 'none';
          bookingConfirmation.style.display = 'block';
          setTimeout(() => {
            bookingConfirmation.classList.add('active');
            // Scroll to confirmation message
            bookingConfirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 50);
        }, 300);
        
      } catch (error) {
        console.error('Error during booking submission:', error);
        alert('There was an error saving your booking. Please try again.');
      } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }
  
  // Allow creating a new booking after confirmation
  if (newBookingBtn) {
    newBookingBtn.addEventListener('click', function() {
      // Smooth transition back to form
      bookingConfirmation.classList.remove('active');
      setTimeout(() => {
        bookingConfirmation.style.display = 'none';
        bookingForm.style.display = 'block';
        bookingForm.style.opacity = '0';
        setTimeout(() => {
          bookingForm.style.opacity = '1';
          bookingForm.reset();
          
          // Reset validation states
          bookingForm.querySelectorAll('.valid, .invalid').forEach(field => {
            field.classList.remove('valid');
            field.classList.remove('invalid');
          });
          
          // Set tomorrow's date
          const dateInput = document.getElementById('date');
          if (dateInput) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const yyyy = tomorrow.getFullYear();
            let mm = tomorrow.getMonth() + 1;
            let dd = tomorrow.getDate();
            
            if (dd < 10) dd = '0' + dd;
            if (mm < 10) mm = '0' + mm;
            
            dateInput.value = `${yyyy}-${mm}-${dd}`;
          }
        }, 50);
      }, 300);
    });
  }
  
  // Initialize date picker with minimum date of today
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    
    const formattedToday = yyyy + '-' + mm + '-' + dd;
    dateInput.setAttribute('min', formattedToday);
    
    // Set default date to tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yyyy2 = tomorrow.getFullYear();
    let mm2 = tomorrow.getMonth() + 1;
    let dd2 = tomorrow.getDate();
    
    if (dd2 < 10) dd2 = '0' + dd2;
    if (mm2 < 10) mm2 = '0' + mm2;
    
    const formattedTomorrow = yyyy2 + '-' + mm2 + '-' + dd2;
    dateInput.value = formattedTomorrow;
  }
  
  // Enhance service cards interaction
  const serviceCards = document.querySelectorAll('.service-card');
  if (serviceCards.length > 0) {
    serviceCards.forEach(card => {
      card.addEventListener('click', function() {
        // Remove active class from all cards
        serviceCards.forEach(c => c.classList.remove('active'));
        // Add active class to clicked card
        this.classList.add('active');
        
        // Auto-scroll to booking section after a slight delay
        setTimeout(() => {
          const serviceType = this.querySelector('h3').textContent;
          const serviceSelect = document.getElementById('service');
          
          if (serviceSelect) {
            // Find the option that matches this service
            Array.from(serviceSelect.options).forEach(option => {
              if (option.text.includes(serviceType)) {
                option.selected = true;
              }
            });
            
            // Scroll to booking form
            document.querySelector('#booking').scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
            
            // Focus on the name field after scrolling completes
            setTimeout(() => {
              document.getElementById('name').focus();
            }, 1000);
          }
        }, 300);
      });
    });
  }
}); 