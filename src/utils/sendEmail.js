/**
 * EMAIL SENDING UTILITY
 *
 * This file handles sending the timesheet via email.
 * We'll use the browser's mailto: protocol as the simplest solution.
 * No backend needed, no API keys required!
 *
 * How it works:
 * 1. User generates timesheet (gets PNG image)
 * 2. Image is saved to their device
 * 3. Opens email app with pre-filled recipient and subject
 * 4. User attaches the downloaded image and hits send
 *
 * Alternative (requires setup): EmailJS service
 * - Can send emails directly from browser
 * - Requires free EmailJS account
 * - Instructions provided below
 */

/**
 * METHOD 1: Simple Email Helper (No setup required)
 * Opens the user's email app with pre-filled information
 */
export function openEmailClient(formData) {
  const recipient = 'middlesbrough@pin-point.co.uk'
  const subject = `Timesheet - ${formData.yourName} - Week Ending ${formatDate(formData.weekEnding)}`
  const body = `Dear Payroll Team,

Please find attached my timesheet for the week ending ${formatDate(formData.weekEnding)}.

Employee Details:
- Name: ${formData.yourName}
- Company: ${formData.companyName}
- Role: ${formData.role}
- Total Hours: ${calculateTotalHours(formData)} hours

The timesheet image has been downloaded to my device.

Kind regards,
${formData.yourName}`

  // Create mailto link
  const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  // Open email client
  window.location.href = mailtoLink

  return {
    success: true,
    message: 'Email app opened. Please attach the downloaded timesheet image and send.'
  }
}

/**
 * METHOD 2: Direct Email with EmailJS (Requires setup)
 * This can send emails directly without opening email app
 *
 * Setup instructions:
 * 1. Create free account at emailjs.com
 * 2. Create email service (Gmail, Outlook, etc.)
 * 3. Create email template
 * 4. Get your Public Key, Service ID, and Template ID
 * 5. Install: npm install @emailjs/browser
 * 6. Uncomment the code below and fill in your credentials
 */

/*
import emailjs from '@emailjs/browser'

export async function sendEmailDirectly(imageDataUrl, formData) {
  try {
    // Your EmailJS credentials (get from emailjs.com)
    const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'

    // Prepare email parameters
    const templateParams = {
      to_email: 'middlesbrough@pin-point.co.uk',
      to_name: 'Payroll Team',
      from_name: formData.yourName,
      subject: `Timesheet - Week Ending ${formatDate(formData.weekEnding)}`,
      message: `Please find attached timesheet for ${formData.yourName}.

Company: ${formData.companyName}
Role: ${formData.role}
Total Hours: ${calculateTotalHours(formData)}`,

      // Attach the image
      attachment: imageDataUrl
    }

    // Send email
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    )

    return {
      success: true,
      message: 'Email sent successfully!'
    }
  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      message: 'Failed to send email. Please use manual method.'
    }
  }
}
*/

// ===== HELPER FUNCTIONS =====

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function calculateTotalHours(formData) {
  let total = 0
  Object.keys(formData.shifts).forEach(day => {
    const shift = formData.shifts[day]
    const hours = calculateHours(shift.start, shift.end, shift.sleep, shift.breaks)
    total += parseFloat(hours) || 0
  })
  return total.toFixed(2)
}

function calculateHours(start, end, sleepHours, breakMinutes) {
  if (!start || !end) return 0

  try {
    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)

    let startMinutes = startHour * 60 + startMin
    let endMinutes = endHour * 60 + endMin

    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60
    }

    let totalMinutes = endMinutes - startMinutes

    if (sleepHours) {
      totalMinutes -= parseFloat(sleepHours) * 60
    }

    if (breakMinutes) {
      totalMinutes -= parseFloat(breakMinutes)
    }

    const hours = totalMinutes / 60
    return hours > 0 ? hours.toFixed(2) : 0
  } catch (error) {
    return 0
  }
}
