# Cousins Collective Services (CCS) Website

A simple yet effective website for Cousins Collective Services that uses browser localStorage for booking management.

## Key Features

- Modern, responsive website design
- Clean, user-friendly booking form
- Service catalog showcasing available services
- Secure admin panel to manage bookings
- Data stored in browser localStorage
- CSV export capability for record keeping
- No server-side dependencies required

## How It Works

The CCS website uses client-side storage (localStorage) to handle all booking data. This approach:

- Eliminates the need for backend servers
- Works perfectly with GitHub Pages hosting
- Provides a fast, responsive user experience
- Keeps data private to each device

## Accessing the Website

The website is deployed on GitHub Pages and can be accessed here:
[https://hamid-ccs.github.io/cousins-collective-services/](https://hamid-ccs.github.io/cousins-collective-services/)

### Using the Admin Panel

1. Go to the bookings management page: [https://hamid-ccs.github.io/cousins-collective-services/bookings.html](https://hamid-ccs.github.io/cousins-collective-services/bookings.html)
2. Enter the password: `ccs2024admin`
3. View, filter, and manage all bookings
4. Export bookings to CSV for offline record keeping

## Available Services

CCS currently offers the following services:

- House Cleaning
- Moving Services
- Yard Work
- House Sitting

## Technical Details

- **Front-end:** HTML5, CSS3, vanilla JavaScript
- **Hosting:** GitHub Pages
- **Data Storage:** Browser localStorage
- **Booking Status Tracking:** New, Confirmed, Completed, Cancelled

## Browser Compatibility

The website is compatible with all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Local Development

To work on this project locally:

1. Clone this repository
2. Open the project in your code editor
3. Make changes to files in the `docs/` directory
4. Test locally by opening the HTML files in your browser
5. Commit and push to GitHub to update the live site

## Data Considerations

Since data is stored in localStorage:
- Each user/device has its own independent data store
- Clearing browser data will remove stored bookings
- Regular exports are recommended for data backup

## Future Enhancements

Potential improvements for future versions:

- Filter and search bookings by multiple criteria
- User-customizable service categories
- Admin email notifications for new bookings
- Encrypted data storage with a passkey
- Implement secure cloud storage when feasible

## License

See the LICENSE file for details. 