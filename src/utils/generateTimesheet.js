/**
 * TIMESHEET IMAGE GENERATOR
 *
 * This file creates a professional-looking timesheet image by:
 * 1. Drawing a blank template on a Canvas
 * 2. Overlaying your form data as text
 * 3. Converting the canvas to a downloadable PNG image
 *
 * Think of Canvas like a digital piece of paper where we can:
 * - Draw shapes (rectangles, lines)
 * - Write text at specific X,Y coordinates
 * - Convert it all to an image
 */

export async function generateTimesheetImage(formData) {
  // Create a canvas element (invisible, just for generating the image)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // Set canvas size (A4 proportions at 300 DPI for print quality)
  const width = 2480  // pixels
  const height = 3508 // pixels
  canvas.width = width
  canvas.height = height

  // Fill background with white
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  // ===== HEADER SECTION =====
  // Draw header background (purple gradient like Pinpoint branding)
  const gradient = ctx.createLinearGradient(0, 0, width, 200)
  gradient.addColorStop(0, '#667eea')
  gradient.addColorStop(1, '#764ba2')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, 200)

  // Company logo/name
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 80px Arial'
  ctx.fillText('Pinpoint Health & Social Care', 100, 120)

  ctx.font = '40px Arial'
  ctx.fillText('Weekly Timesheet', 100, 170)

  // ===== BASIC INFORMATION SECTION =====
  let yPos = 280 // Starting Y position

  ctx.fillStyle = '#000000'
  ctx.font = 'bold 45px Arial'
  ctx.fillText('EMPLOYEE INFORMATION', 100, yPos)

  // Draw a line under the section title
  ctx.strokeStyle = '#667eea'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(100, yPos + 10)
  ctx.lineTo(2380, yPos + 10)
  ctx.stroke()

  yPos += 80

  // Helper function to draw a labeled field
  const drawField = (label, value, x, y) => {
    ctx.fillStyle = '#666666'
    ctx.font = '35px Arial'
    ctx.fillText(label + ':', x, y)

    ctx.fillStyle = '#000000'
    ctx.font = 'bold 38px Arial'
    ctx.fillText(value || 'N/A', x + 350, y)
  }

  // Draw employee info
  drawField('Name', formData.yourName, 100, yPos)
  yPos += 70
  drawField('Company', formData.companyName, 100, yPos)
  yPos += 70
  drawField('Address', formData.clientAddress, 100, yPos)
  yPos += 70
  drawField('Week Ending', formatDate(formData.weekEnding), 100, yPos)
  yPos += 70
  drawField('Role', formData.role, 100, yPos)

  yPos += 100

  // ===== WEEKLY HOURS TABLE =====
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 45px Arial'
  ctx.fillText('WEEKLY HOURS', 100, yPos)

  ctx.strokeStyle = '#667eea'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(100, yPos + 10)
  ctx.lineTo(2380, yPos + 10)
  ctx.stroke()

  yPos += 80

  // Table header
  const tableStartY = yPos
  const rowHeight = 110
  const colWidths = [350, 280, 280, 200, 200, 200] // Day, Start, End, Sleep, Break, Hours

  // Draw table header background
  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(100, yPos - 60, 2280, 70)

  // Table header text
  ctx.fillStyle = '#374151'
  ctx.font = 'bold 36px Arial'

  const headers = ['Day', 'Start', 'End', 'Sleep', 'Break', 'Hours']
  let xPos = 120
  headers.forEach((header, i) => {
    ctx.fillText(header, xPos, yPos - 20)
    xPos += colWidths[i]
  })

  // Draw table rows for each day
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

  days.forEach((day, index) => {
    const shift = formData.shifts[day.key]
    const hours = calculateHours(shift.start, shift.end, shift.sleep, shift.breaks)

    const rowY = yPos + (index * rowHeight) + 50

    // Alternate row background
    if (index % 2 === 0) {
      ctx.fillStyle = '#f9fafb'
      ctx.fillRect(100, rowY - 50, 2280, rowHeight)
    }

    // Draw cell borders
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 2
    ctx.strokeRect(100, rowY - 50, 2280, rowHeight)

    // Row data
    ctx.fillStyle = '#000000'
    ctx.font = '36px Arial'

    xPos = 120
    const values = [
      day.label,
      shift.start || '--:--',
      shift.end || '--:--',
      shift.sleep ? shift.sleep + 'h' : '0h',
      shift.breaks ? shift.breaks + 'm' : '0m',
      hours + 'h'
    ]

    values.forEach((value, i) => {
      // Highlight hours column
      if (i === 5) {
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 38px Arial'
      }
      ctx.fillText(value, xPos, rowY + 10)

      // Reset style
      ctx.fillStyle = '#000000'
      ctx.font = '36px Arial'

      xPos += colWidths[i]
    })
  })

  // Total hours row
  const totalY = yPos + (7 * rowHeight) + 50
  ctx.fillStyle = '#667eea'
  ctx.fillRect(100, totalY - 50, 2280, rowHeight)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 42px Arial'
  ctx.fillText('TOTAL HOURS', 120, totalY + 10)

  const totalHours = calculateTotalHours(formData)
  ctx.font = 'bold 50px Arial'
  ctx.fillText(totalHours + ' hours', 1800, totalY + 10)

  // ===== FOOTER =====
  const footerY = totalY + 150
  ctx.fillStyle = '#6b7280'
  ctx.font = '32px Arial'
  ctx.fillText('Submitted to: middlesbrough@pin-point.co.uk', 100, footerY)
  ctx.fillText('Generated: ' + new Date().toLocaleDateString('en-GB'), 100, footerY + 50)

  // ===== SIGNATURE SECTION =====
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  const sigY = footerY + 150
  ctx.beginPath()
  ctx.moveTo(100, sigY)
  ctx.lineTo(600, sigY)
  ctx.stroke()

  ctx.fillStyle = '#666666'
  ctx.font = '30px Arial'
  ctx.fillText('Employee Signature', 100, sigY + 40)

  ctx.beginPath()
  ctx.moveTo(1400, sigY)
  ctx.lineTo(1900, sigY)
  ctx.stroke()

  ctx.fillText('Date', 1400, sigY + 40)

  // Convert canvas to image data URL (base64 PNG)
  return canvas.toDataURL('image/png', 1.0)
}

// ===== HELPER FUNCTIONS =====

/**
 * Calculate hours worked for a shift
 * Same logic as in App.jsx - calculates time between start/end minus sleep and breaks
 */
function calculateHours(start, end, sleepHours, breakMinutes) {
  if (!start || !end) return 0

  try {
    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)

    let startMinutes = startHour * 60 + startMin
    let endMinutes = endHour * 60 + endMin

    // Handle overnight shifts
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

/**
 * Calculate total hours for the week
 */
function calculateTotalHours(formData) {
  let total = 0
  Object.keys(formData.shifts).forEach(day => {
    const shift = formData.shifts[day]
    const hours = calculateHours(shift.start, shift.end, shift.sleep, shift.breaks)
    total += parseFloat(hours) || 0
  })
  return total.toFixed(2)
}

/**
 * Format date in DD/MM/YYYY format
 */
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Download the generated image
 */
export function downloadImage(dataUrl, filename) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `timesheet-${filename}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
