/**
 * PINPOINT HEALTH & SOCIAL CARE TIMESHEET GENERATOR
 *
 * This recreates the exact physical timesheet template used by Pinpoint
 */

export async function generateTimesheetImage(formData) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // A4 size at 300 DPI for print quality
  const width = 2480
  const height = 3508
  canvas.width = width
  canvas.height = height

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  // Main border (outer black rectangle)
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 4
  ctx.strokeRect(100, 100, 2280, 3200)

  // ===== HEADER: PINPOINT LOGO & TEXT =====
  let y = 200

  ctx.fillStyle = '#000000'
  ctx.font = 'bold 50px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('pinpoint', width / 2, y)

  ctx.font = '40px Arial'
  y += 50
  ctx.fillText('health&socialcare', width / 2, y)

  // Reset text alignment
  ctx.textAlign = 'left'

  // ===== TOP INFO BOXES =====
  y += 80
  const leftMargin = 120
  const boxWidth = 2240

  // COMPANY NAME box
  drawBox(ctx, leftMargin, y, boxWidth, 70)
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 32px Arial'
  ctx.fillText('COMPANY NAME:', leftMargin + 20, y + 45)

  // Fill in company name
  ctx.font = '32px Arial'
  ctx.fillText(formData.companyName || '', leftMargin + 400, y + 45)

  // ADDRESS box
  y += 70
  drawBox(ctx, leftMargin, y, boxWidth, 70)
  ctx.font = 'bold 32px Arial'
  ctx.fillText('ADDRESS:', leftMargin + 20, y + 45)

  ctx.font = '32px Arial'
  ctx.fillText(formData.clientAddress || '', leftMargin + 400, y + 45)

  // WEEK ENDING DATE box (split into two columns)
  y += 70
  const splitX = leftMargin + boxWidth / 2
  drawBox(ctx, leftMargin, y, boxWidth / 2, 70)
  drawBox(ctx, splitX, y, boxWidth / 2, 70)

  ctx.font = 'bold 32px Arial'
  ctx.fillText('WEEK ENDING DATE (Sunday)', leftMargin + 20, y + 45)

  ctx.font = '32px Arial'
  ctx.fillText(formatDate(formData.weekEnding), splitX + 20, y + 45)

  // YOUR NAME field
  y += 100
  ctx.font = '30px Arial'
  ctx.fillText('Your Name:', leftMargin + 20, y)

  // Draw line under name
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(leftMargin + 280, y)
  ctx.lineTo(leftMargin + 1200, y)
  ctx.stroke()

  // Fill in name
  ctx.font = '32px Arial'
  ctx.fillText(formData.yourName || '', leftMargin + 290, y - 5)

  // ===== MAIN TIMESHEET TABLE =====
  y += 80
  const tableStartY = y
  const colWidth = 285
  const rowHeight = 100

  // Table header row with days
  const days = ['', 'MON', 'TUES', 'WED', 'THUR', 'FRI', 'SAT', 'SUN', 'Total']

  for (let i = 0; i < days.length; i++) {
    const x = leftMargin + (i * colWidth)
    drawBox(ctx, x, y, colWidth, rowHeight)

    if (days[i]) {
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(days[i], x + colWidth / 2, y + 60)
      ctx.textAlign = 'left'
    }
  }

  // Row 1: Shift Pattern
  y += rowHeight
  const rowLabels = [
    'Shift Pattern\n(24-hour clock\nor AM/PM)',
    'Sleep',
    '',
    'Breaks Taken',
    '',
    'Hours'
  ]

  // Shift Pattern row
  drawBox(ctx, leftMargin, y, colWidth, rowHeight)
  ctx.font = '22px Arial'
  drawMultilineText(ctx, rowLabels[0], leftMargin + 10, y + 30, 24)

  // Fill shift times for each day
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  for (let i = 0; i < 7; i++) {
    const x = leftMargin + ((i + 1) * colWidth)
    drawBox(ctx, x, y, colWidth, rowHeight)

    const shift = formData.shifts[dayKeys[i]]
    if (shift.start || shift.end) {
      ctx.font = '28px Arial'
      ctx.textAlign = 'center'
      const timeText = `${shift.start || ''} - ${shift.end || ''}`
      ctx.fillText(timeText, x + colWidth / 2, y + 60)
      ctx.textAlign = 'left'
    }
  }
  // Total column for shift pattern
  drawBox(ctx, leftMargin + (8 * colWidth), y, colWidth, rowHeight)

  // Row 2: Sleep
  y += rowHeight
  drawBox(ctx, leftMargin, y, colWidth, rowHeight)
  ctx.font = 'bold 26px Arial'
  ctx.fillText('Sleep', leftMargin + 10, y + 60)

  for (let i = 0; i < 7; i++) {
    const x = leftMargin + ((i + 1) * colWidth)
    drawBox(ctx, x, y, colWidth, rowHeight)

    const shift = formData.shifts[dayKeys[i]]
    if (shift.sleep) {
      ctx.font = '28px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(shift.sleep, x + colWidth / 2, y + 60)
      ctx.textAlign = 'left'
    }
  }
  drawBox(ctx, leftMargin + (8 * colWidth), y, colWidth, rowHeight)

  // Row 3: Empty row
  y += rowHeight
  for (let i = 0; i < 9; i++) {
    const x = leftMargin + (i * colWidth)
    drawBox(ctx, x, y, colWidth, rowHeight)
  }

  // Row 4: Breaks Taken
  y += rowHeight
  drawBox(ctx, leftMargin, y, colWidth, rowHeight)
  ctx.font = 'bold 26px Arial'
  ctx.fillText('Breaks Taken', leftMargin + 10, y + 60)

  for (let i = 0; i < 7; i++) {
    const x = leftMargin + ((i + 1) * colWidth)
    drawBox(ctx, x, y, colWidth, rowHeight)

    const shift = formData.shifts[dayKeys[i]]
    if (shift.breaks) {
      ctx.font = '28px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(shift.breaks, x + colWidth / 2, y + 60)
      ctx.textAlign = 'left'
    }
  }
  drawBox(ctx, leftMargin + (8 * colWidth), y, colWidth, rowHeight)

  // Row 5: Empty row
  y += rowHeight
  for (let i = 0; i < 9; i++) {
    const x = leftMargin + (i * colWidth)
    drawBox(ctx, x, y, colWidth, rowHeight)
  }

  // Row 6: Hours
  y += rowHeight
  drawBox(ctx, leftMargin, y, colWidth, rowHeight)
  ctx.font = 'bold 26px Arial'
  ctx.fillText('Hours', leftMargin + 10, y + 60)

  let totalWeekHours = 0
  for (let i = 0; i < 7; i++) {
    const x = leftMargin + ((i + 1) * colWidth)
    drawBox(ctx, x, y, colWidth, rowHeight)

    const shift = formData.shifts[dayKeys[i]]
    const hours = calculateHours(shift.start, shift.end, shift.sleep, shift.breaks)

    if (hours > 0) {
      totalWeekHours += parseFloat(hours)
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(hours.toString(), x + colWidth / 2, y + 60)
      ctx.textAlign = 'left'
    }
  }

  // Total hours
  drawBox(ctx, leftMargin + (8 * colWidth), y, colWidth, rowHeight)
  ctx.font = 'bold 32px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(totalWeekHours.toFixed(1), leftMargin + (8 * colWidth) + colWidth / 2, y + 60)
  ctx.textAlign = 'left'

  // Row 7: Client Signature
  y += rowHeight
  drawBox(ctx, leftMargin, y, colWidth, rowHeight)
  ctx.font = 'bold 24px Arial'
  drawMultilineText(ctx, 'Client\nSignature:', leftMargin + 10, y + 35, 28)

  for (let i = 1; i < 9; i++) {
    const x = leftMargin + (i * colWidth)
    drawBox(ctx, x, y, colWidth, rowHeight)
  }

  // Row 8: Holiday Request
  y += rowHeight
  drawBox(ctx, leftMargin, y, colWidth, rowHeight)
  ctx.font = 'bold 24px Arial'
  drawMultilineText(ctx, 'Holiday\nRequest:', leftMargin + 10, y + 35, 28)

  for (let i = 1; i < 9; i++) {
    const x = leftMargin + (i * colWidth)
    drawBox(ctx, x, y, colWidth, rowHeight)
  }

  // ===== ROLE CHECKBOXES =====
  y += 120
  ctx.font = '24px Arial'
  ctx.fillText('Please tick appropriate box', leftMargin, y)

  y += 40
  const checkboxSize = 35
  const checkboxSpacing = 450

  // First row of checkboxes
  const roles1 = [
    { label: 'RGN', checked: formData.role === 'RGN' },
    { label: 'RNLD', checked: formData.role === 'RNLD' },
    { label: 'RMN', checked: formData.role === 'RMN' },
    { label: 'Nursing\nAssistant', checked: formData.role === 'Nursing Assistant' },
    { label: 'Senior\nShift', checked: formData.role === 'Senior Shift' }
  ]

  for (let i = 0; i < roles1.length; i++) {
    const x = leftMargin + (i * checkboxSpacing)
    drawCheckbox(ctx, x, y, checkboxSize, roles1[i].label, roles1[i].checked)
  }

  // Second row of checkboxes
  y += 80
  const roles2 = [
    { label: 'Care\nAssistant', checked: formData.role === 'Care Assistant' },
    { label: 'Support\nWorker', checked: formData.role === 'Support Worker' },
    { label: 'Domestic\nAssistant', checked: formData.role === 'Domestic Assistant' },
    { label: 'Kitchen\nAssistant', checked: formData.role === 'Kitchen Assistant' },
    { label: 'Chef', checked: formData.role === 'Chef' }
  ]

  for (let i = 0; i < roles2.length; i++) {
    const x = leftMargin + (i * checkboxSpacing)
    drawCheckbox(ctx, x, y, checkboxSize, roles2[i].label, roles2[i].checked)
  }

  // ===== CLIENT AUTHORISATION SECTION =====
  y += 100

  // Section header
  ctx.font = 'bold 28px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('CLIENT AUTHORISATION FOR EXTRA TIME', width / 2, y)
  ctx.textAlign = 'left'

  // Draw line above and below
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(leftMargin, y - 10)
  ctx.lineTo(leftMargin + boxWidth, y - 10)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(leftMargin, y + 5)
  ctx.lineTo(leftMargin + boxWidth, y + 5)
  ctx.stroke()

  y += 40
  ctx.font = '22px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('*Reason for Additional Hours Owed / No Break Taken (To be completed and signed/dated by client)', width / 2, y)
  ctx.textAlign = 'left'

  // Table for authorization
  y += 30
  const authTableHeight = 200
  const col1Width = 400
  const col2Width = 900
  const col3Width = 940

  // Headers
  drawBox(ctx, leftMargin, y, col1Width, 60)
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('SHIFT', leftMargin + col1Width / 2, y + 40)
  ctx.fillText('DATE:', leftMargin + col1Width / 2, y + 60)

  drawBox(ctx, leftMargin + col1Width, y, col2Width, 60)
  ctx.fillText('REASON:', leftMargin + col1Width + col2Width / 2, y + 40)

  drawBox(ctx, leftMargin + col1Width + col2Width, y, col3Width, 60)
  drawMultilineText(ctx, 'CLIENT\nSIGNATURE:', leftMargin + col1Width + col2Width + 20, y + 25, 26)

  ctx.textAlign = 'left'

  // Big empty box for details
  y += 60
  drawBox(ctx, leftMargin, y, col1Width, authTableHeight)
  drawBox(ctx, leftMargin + col1Width, y, col2Width, authTableHeight)
  drawBox(ctx, leftMargin + col1Width + col2Width, y, col3Width, authTableHeight)

  // ===== FOOTER TEXT =====
  y += authTableHeight + 40

  ctx.font = '20px Arial'
  const footerText = 'I hereby confirm that the hours detailed on this timesheet have been completed by the Temporary Worker, all breaks have been deducted and that I am satisfied with the standard of work carried out. If additional hours have been authorised (i.e. no break taken) then this will be disclosed in the box above and overrides our general break policy. By signing below I also agree to the Hourly Charge Rates and Terms and Conditions of Business.'

  drawWrappedText(ctx, footerText, leftMargin, y, 2240, 24)

  // ===== SIGNATURE LINES =====
  y += 140

  // Signature line
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(leftMargin + 300, y)
  ctx.lineTo(leftMargin + 1000, y)
  ctx.stroke()

  ctx.font = 'bold 26px Arial'
  ctx.fillText('SIGNATURE:', leftMargin, y)

  // Position line
  ctx.beginPath()
  ctx.moveTo(leftMargin + 1400, y)
  ctx.lineTo(leftMargin + 2000, y)
  ctx.stroke()

  ctx.fillText('POSITION:', leftMargin + 1200, y)

  y += 60

  // Print name line
  ctx.beginPath()
  ctx.moveTo(leftMargin + 300, y)
  ctx.lineTo(leftMargin + 1000, y)
  ctx.stroke()

  ctx.fillText('PRINT NAME:', leftMargin, y)

  // Date line
  ctx.beginPath()
  ctx.moveTo(leftMargin + 1400, y)
  ctx.lineTo(leftMargin + 2000, y)
  ctx.stroke()

  ctx.fillText('DATE:', leftMargin + 1200, y)

  // ===== BOTTOM WARNING TEXT =====
  y += 60

  ctx.font = 'bold 22px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('Any unauthorised timesheets will not be processed by payroll and you will not be paid for these', width / 2, y)
  y += 30
  ctx.fillText('hours until a client signature is provided, or email confirmation sought via consultant.', width / 2, y)

  y += 40
  ctx.font = 'bold 26px Arial'
  ctx.fillText('TIMESHEET MUST BE RETURNED TO OUR OFFICE BEFORE MONDAY AT 9am', width / 2, y)

  // ===== CONTACT INFO =====
  y += 50
  ctx.font = 'bold 28px Arial'
  ctx.fillText('E-mail: middlesbrough@pin-point.co.uk', width / 2, y)

  y += 35
  ctx.font = '22px Arial'
  ctx.fillText('Pin Point Recruitment Ltd, Suite 1, Boho Six, Linthorpe Rd, Middlesbrough, TS1 1RE', width / 2, y)

  y += 35
  ctx.font = 'bold 26px Arial'
  ctx.fillText('TEL: (01642) 772 134', width / 2, y)

  ctx.textAlign = 'left'

  return canvas.toDataURL('image/png', 1.0)
}

// ===== HELPER FUNCTIONS =====

function drawBox(ctx, x, y, width, height) {
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, width, height)
}

function drawCheckbox(ctx, x, y, size, label, checked) {
  // Draw checkbox square
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, size, size)

  // Draw checkmark if checked
  if (checked) {
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 30px Arial'
    ctx.fillText('✓', x + 6, y + 28)
  }

  // Draw label
  ctx.fillStyle = '#000000'
  ctx.font = '22px Arial'

  if (label.includes('\n')) {
    const lines = label.split('\n')
    ctx.fillText(lines[0], x + size + 10, y + 18)
    ctx.fillText(lines[1], x + size + 10, y + 38)
  } else {
    ctx.fillText(label, x + size + 10, y + 25)
  }
}

function drawMultilineText(ctx, text, x, y, lineHeight) {
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + (i * lineHeight))
  })
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let yPos = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, yPos)
      line = words[i] + ' '
      yPos += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, yPos)
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
    return hours > 0 ? hours.toFixed(1) : 0
  } catch (error) {
    return 0
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function downloadImage(dataUrl, filename) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `timesheet-${filename}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
