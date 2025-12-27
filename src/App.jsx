import { useState, useEffect } from 'react'
import { format, addDays, startOfWeek } from 'date-fns'
import { generateTimesheetImage, downloadImage } from './utils/generateTimesheet'
import { openEmailClient } from './utils/sendEmail'

function App() {
  // Get next Sunday as default week ending date
  const getNextSunday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek
    return format(addDays(today, daysUntilSunday), 'yyyy-MM-dd')
  }

  // Main form state - this stores all your timesheet data
  const [formData, setFormData] = useState({
    companyName: '',
    clientAddress: '',
    weekEnding: getNextSunday(),
    yourName: '',
    role: 'Support Worker',
    shifts: {
      monday: { start: '', end: '', sleep: '', breaks: '', notes: '' },
      tuesday: { start: '', end: '', sleep: '', breaks: '', notes: '' },
      wednesday: { start: '', end: '', sleep: '', breaks: '', notes: '' },
      thursday: { start: '', end: '', sleep: '', breaks: '', notes: '' },
      friday: { start: '', end: '', sleep: '', breaks: '', notes: '' },
      saturday: { start: '', end: '', sleep: '', breaks: '', notes: '' },
      sunday: { start: '', end: '', sleep: '', breaks: '', notes: '' }
    }
  })

  const [message, setMessage] = useState({ type: '', text: '' })
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedDay, setSelectedDay] = useState('monday') // Current day being edited

  // Load saved data from browser storage when app starts
  useEffect(() => {
    const savedName = localStorage.getItem('yourName')
    const savedCompanies = localStorage.getItem('recentCompanies')

    if (savedName) {
      setFormData(prev => ({ ...prev, yourName: savedName }))
    }
  }, [])

  // Save your name for next time
  useEffect(() => {
    if (formData.yourName) {
      localStorage.setItem('yourName', formData.yourName)
    }
  }, [formData.yourName])

  // Calculate hours worked for a day
  const calculateHours = (start, end, sleepHours, breakMinutes) => {
    if (!start || !end) return 0

    try {
      // Convert time strings to minutes since midnight
      const [startHour, startMin] = start.split(':').map(Number)
      const [endHour, endMin] = end.split(':').map(Number)

      let startMinutes = startHour * 60 + startMin
      let endMinutes = endHour * 60 + endMin

      // Handle overnight shifts (e.g., 22:00 to 06:00)
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60
      }

      // Calculate total minutes worked
      let totalMinutes = endMinutes - startMinutes

      // Subtract sleep hours (converted to minutes)
      if (sleepHours) {
        totalMinutes -= parseFloat(sleepHours) * 60
      }

      // Subtract break minutes
      if (breakMinutes) {
        totalMinutes -= parseFloat(breakMinutes)
      }

      // Convert back to hours
      const hours = totalMinutes / 60
      return hours > 0 ? hours.toFixed(2) : 0
    } catch (error) {
      return 0
    }
  }

  // Update form data when user types
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Update shift data for a specific day
  const handleShiftChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      shifts: {
        ...prev.shifts,
        [day]: {
          ...prev.shifts[day],
          [field]: value
        }
      }
    }))
  }

  // Calculate total hours for the week
  const calculateTotalHours = () => {
    let total = 0
    Object.keys(formData.shifts).forEach(day => {
      const shift = formData.shifts[day]
      const hours = calculateHours(shift.start, shift.end, shift.sleep, shift.breaks)
      total += parseFloat(hours) || 0
    })
    return total.toFixed(2)
  }

  // Generate and download the timesheet
  const handleGenerate = async () => {
    // Validation
    if (!formData.companyName || !formData.yourName) {
      setMessage({ type: 'error', text: 'Please fill in Company Name and Your Name' })
      return
    }

    setIsGenerating(true)
    setMessage({ type: '', text: '' })

    try {
      // Generate the timesheet image
      const imageDataUrl = await generateTimesheetImage(formData)

      // Download the image
      const filename = formData.weekEnding
      downloadImage(imageDataUrl, filename)

      setMessage({
        type: 'success',
        text: `✅ Timesheet downloaded! Total hours: ${calculateTotalHours()}`
      })
    } catch (error) {
      console.error('Error generating timesheet:', error)
      setMessage({ type: 'error', text: 'Error generating timesheet. Please try again.' })
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle email sending
  const handleEmail = async () => {
    // Validation
    if (!formData.companyName || !formData.yourName) {
      setMessage({ type: 'error', text: 'Please fill in Company Name and Your Name' })
      return
    }

    setIsGenerating(true)
    setMessage({ type: '', text: '' })

    try {
      // Generate the timesheet image first
      const imageDataUrl = await generateTimesheetImage(formData)

      // Download it
      const filename = formData.weekEnding
      downloadImage(imageDataUrl, filename)

      // Wait a moment for download to start
      await new Promise(resolve => setTimeout(resolve, 500))

      // Open email client
      const result = openEmailClient(formData)

      setMessage({
        type: 'success',
        text: `✅ Email opened! Please attach the downloaded timesheet and send.`
      })
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Error preparing email. Please try again.' })
    } finally {
      setIsGenerating(false)
    }
  }

  // Save current timesheet for next week
  const handleSaveForNextWeek = () => {
    localStorage.setItem('lastWeekShifts', JSON.stringify(formData.shifts))
    localStorage.setItem('lastWeekCompany', formData.companyName)
    localStorage.setItem('lastWeekAddress', formData.clientAddress)
    setMessage({ type: 'success', text: '✅ Saved! Use "Copy Last Week" button next time.' })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  // Load last week's shifts
  const handleCopyLastWeek = () => {
    const lastShifts = localStorage.getItem('lastWeekShifts')
    const lastCompany = localStorage.getItem('lastWeekCompany')
    const lastAddress = localStorage.getItem('lastWeekAddress')

    if (lastShifts) {
      setFormData(prev => ({
        ...prev,
        shifts: JSON.parse(lastShifts),
        companyName: lastCompany || prev.companyName,
        clientAddress: lastAddress || prev.clientAddress
      }))
      setMessage({ type: 'success', text: '✅ Last week\'s shifts copied!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } else {
      setMessage({ type: 'error', text: 'No saved timesheet found. Use "Save for Next Week" first.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  // Clear all shifts
  const handleClearShifts = () => {
    if (confirm('Are you sure you want to clear all shift times?')) {
      setFormData(prev => ({
        ...prev,
        shifts: {
          monday: { start: '', end: '', sleep: '', breaks: '', notes: '' },
          tuesday: { start: '', end: '', sleep: '', breaks: '', notes: '' },
          wednesday: { start: '', end: '', sleep: '', breaks: '', notes: '' },
          thursday: { start: '', end: '', sleep: '', breaks: '', notes: '' },
          friday: { start: '', end: '', sleep: '', breaks: '', notes: '' },
          saturday: { start: '', end: '', sleep: '', breaks: '', notes: '' },
          sunday: { start: '', end: '', sleep: '', breaks: '', notes: '' }
        }
      }))
      setMessage({ type: 'success', text: 'All shifts cleared!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  // Edit a specific day - scroll to shift section and select that day
  const handleEditDay = (day) => {
    setSelectedDay(day)
    // Scroll to the shift input section smoothly
    const shiftSection = document.querySelector('.form-section')
    if (shiftSection) {
      shiftSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Delete a specific day's shift data
  const handleDeleteDay = (day) => {
    if (confirm(`Delete ${dayLabels[day]}'s shift?`)) {
      setFormData(prev => ({
        ...prev,
        shifts: {
          ...prev.shifts,
          [day]: { start: '', end: '', sleep: '', breaks: '', notes: '' }
        }
      }))
      setMessage({ type: 'success', text: `${dayLabels[day]} shift deleted!` })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">⏰ Timesheet Generator</h1>
        <p className="app-subtitle">Pinpoint Health & Social Care</p>
      </header>

      {message.text && (
        <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
          {message.text}
        </div>
      )}

      {/* Basic Information Section */}
      <section className="form-section">
        <h2 className="section-title">📋 Basic Information</h2>

        <div className="form-group">
          <label className="form-label">Your Name *</label>
          <input
            type="text"
            className="form-input"
            value={formData.yourName}
            onChange={(e) => handleChange('yourName', e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Company Name (Client) *</label>
          <input
            type="text"
            className="form-input"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="e.g., XYZ Care Home"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Client Address</label>
          <input
            type="text"
            className="form-input"
            value={formData.clientAddress}
            onChange={(e) => handleChange('clientAddress', e.target.value)}
            placeholder="Enter client address"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Week Ending (Sunday)</label>
          <input
            type="date"
            className="form-input"
            value={formData.weekEnding}
            onChange={(e) => handleChange('weekEnding', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Role</label>
          <select
            className="form-select"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
          >
            <option>Support Worker</option>
            <option>Care Assistant</option>
            <option>Senior Shift</option>
            <option>Nursing Assistant</option>
            <option>RGN</option>
            <option>RNLD</option>
            <option>RMN</option>
            <option>Domestic Assistant</option>
            <option>Kitchen Assistant</option>
            <option>Chef</option>
          </select>
        </div>
      </section>

      {/* Shift Times Section - Dropdown */}
      <section className="form-section">
        <h2 className="section-title">🕐 Weekly Shifts</h2>

        {/* Day Selector Dropdown */}
        <div className="form-group">
          <label className="form-label">Select Day</label>
          <select
            className="form-select"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            {days.map(day => (
              <option key={day} value={day}>
                {dayLabels[day]}
              </option>
            ))}
          </select>
        </div>

        {/* Shift Input Fields for Selected Day */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-input"
                value={formData.shifts[selectedDay].start}
                onChange={(e) => handleShiftChange(selectedDay, 'start', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-input"
                value={formData.shifts[selectedDay].end}
                onChange={(e) => handleShiftChange(selectedDay, 'end', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Sleep (hours)</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={formData.shifts[selectedDay].sleep}
                onChange={(e) => handleShiftChange(selectedDay, 'sleep', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Break (minutes)</label>
              <input
                type="number"
                className="form-input"
                value={formData.shifts[selectedDay].breaks}
                onChange={(e) => handleShiftChange(selectedDay, 'breaks', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              className="form-input"
              value={formData.shifts[selectedDay].notes}
              onChange={(e) => handleShiftChange(selectedDay, 'notes', e.target.value)}
              placeholder="Add any notes for this day..."
              rows="2"
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Hours for Current Day */}
          {(formData.shifts[selectedDay].start || formData.shifts[selectedDay].end) && (
            <div style={{
              background: '#667eea',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              {dayLabels[selectedDay]} Hours: {calculateHours(
                formData.shifts[selectedDay].start,
                formData.shifts[selectedDay].end,
                formData.shifts[selectedDay].sleep,
                formData.shifts[selectedDay].breaks
              )}
            </div>
          )}
        </div>

        {/* Summary of All Entered Shifts */}
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
            Week Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {days.map(day => {
              const shift = formData.shifts[day]
              const hours = calculateHours(shift.start, shift.end, shift.sleep, shift.breaks)
              const hasData = shift.start || shift.end

              return hasData ? (
                <div
                  key={day}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    background: day === selectedDay ? '#f0fdf4' : '#f9fafb',
                    borderRadius: '0.375rem',
                    border: day === selectedDay ? '1px solid #667eea' : '1px solid #e5e7eb',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      {dayLabels[day]}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#667eea' }}>
                      {hours}h {shift.start && shift.end && `(${shift.start} - ${shift.end})`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => handleEditDay(day)}
                      style={{
                        padding: '0.375rem 0.625rem',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteDay(day)}
                      style={{
                        padding: '0.375rem 0.625rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ) : null
            })}
          </div>
        </div>

        {/* Weekly Total */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '0.5rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>
            Weekly Total
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {calculateTotalHours()} hours
          </div>
        </div>
      </section>

      {/* Quick Action Buttons */}
      <section className="form-section" style={{ marginTop: '1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem'
        }}>
          <button
            className="btn btn-secondary"
            onClick={handleCopyLastWeek}
            style={{ padding: '0.75rem', fontSize: '0.875rem' }}
          >
            🔄 Copy Last Week
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleSaveForNextWeek}
            style={{ padding: '0.75rem', fontSize: '0.875rem' }}
          >
            💾 Save for Next Week
          </button>
        </div>
      </section>

      {/* Main Action Buttons */}
      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating && <span className="loading"></span>}
          {isGenerating ? 'Generating...' : '📄 Generate & Download'}
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleEmail}
          disabled={isGenerating}
        >
          {isGenerating && <span className="loading"></span>}
          {isGenerating ? 'Preparing...' : '📧 Generate & Email'}
        </button>
      </div>
    </div>
  )
}

export default App
