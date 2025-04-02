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
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
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
      
      // Store in localStorage
      let bookings = JSON.parse(localStorage.getItem('ccsBookings') || '[]');
      bookings.push(booking);
      localStorage.setItem('ccsBookings', JSON.stringify(bookings));
      
      console.log('Booking saved:', booking);
      
      // Show confirmation message
      bookingForm.style.display = 'none';
      bookingConfirmation.classList.add('active');
    });
  }
  
  // Reset form for new booking
  if (newBookingBtn) {
    newBookingBtn.addEventListener('click', function() {
      bookingForm.reset();
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
