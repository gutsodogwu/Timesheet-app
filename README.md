# ⏰ Timesheet Generator App

A mobile-first web application for healthcare support workers to quickly generate professional timesheets.

Built for **Pinpoint Health & Social Care** support workers in Middlesbrough, UK.

---

## 🎯 **What Problem Does This Solve?**

**Before:**
- ❌ Handwrite timesheets every week
- ❌ Take photos with poor lighting/quality
- ❌ Risk of calculation errors
- ❌ 5-10 minutes of tedious work
- ❌ Unprofessional appearance

**After:**
- ✅ Type in your shifts (2 minutes max)
- ✅ Automatic hour calculations
- ✅ Professional PDF-quality output
- ✅ One-tap download or email
- ✅ Save last week's shifts for quick reuse

---

## 🚀 **Quick Start**

### **Running the App Locally**

1. **Install Node.js** (if you haven't already)
   - Download from: https://nodejs.org/
   - Install the LTS (Long Term Support) version

2. **Navigate to this folder** in Terminal/Command Prompt:
   ```bash
   cd Timesheet-app
   ```

3. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open in your browser**:
   - On your computer: http://localhost:3000/
   - On your iPhone (same WiFi): http://[your-computer-ip]:3000/

---

## 📱 **Using on iPhone**

### **Method 1: Add to Home Screen (Recommended)**

1. Open the app URL in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. Now you have an app icon that works like a native app!

### **Method 2: Deploy to the Web (Access Anywhere)**

Deploy for free on Vercel:

```bash
npm run build
npm install -g vercel
vercel
```

Follow the prompts, and you'll get a URL like `https://timesheet-app.vercel.app` that works anywhere!

---

## 🎓 **How to Use the App**

### **1. Fill in Basic Information**
- **Your Name**: Saved automatically for next time
- **Company Name**: The client you worked for
- **Client Address**: Optional
- **Week Ending**: Auto-defaults to next Sunday
- **Role**: Select from dropdown (default: Support Worker)

### **2. Enter Your Shifts**
For each day of the week:
- **Start Time**: e.g., 08:00
- **End Time**: e.g., 16:00
- **Sleep Hours**: If overnight shift with sleep (e.g., 8)
- **Break Minutes**: e.g., 30

**Hours are calculated automatically!** Including overnight shifts (e.g., 22:00 → 06:00)

### **3. Quick Actions**
- **🔄 Copy Last Week**: Loads your previous week's shifts
- **💾 Save for Next Week**: Saves current shifts for easy reuse

### **4. Generate Timesheet**
- **📄 Generate & Download**: Downloads PNG image to your device
- **📧 Generate & Email**: Downloads image + opens email app with pre-filled details

---

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18**: UI framework
- **Vite**: Build tool (super fast!)
- **Canvas API**: Image generation
- **date-fns**: Date handling

### **Architecture**
```
src/
├── App.jsx                     # Main application component
├── main.jsx                    # React entry point
├── index.css                   # Styles
└── utils/
    ├── generateTimesheet.js    # Image generation logic
    └── sendEmail.js            # Email helper
```

### **Key Files Explained**

#### **App.jsx** (Main Application)
- **State Management**: Stores all form data using React's `useState`
- **Event Handlers**: Functions that run when you click buttons
- **Form Rendering**: All the input fields you see on screen

#### **generateTimesheet.js** (Image Generator)
- **Canvas Drawing**: Creates a blank timesheet template
- **Text Overlay**: Writes your data onto the template
- **Hour Calculations**: Converts start/end times to hours worked
- **Image Export**: Converts canvas to downloadable PNG

#### **sendEmail.js** (Email Helper)
- **mailto: Protocol**: Opens your email app
- **Pre-filled Content**: Subject line and body ready to go
- *Future*: Direct email sending with EmailJS

---

## 🧠 **How It Works (For Learning)**

### **React Basics**

React is like Excel with formulas that auto-update:

```javascript
// This stores data (like an Excel cell)
const [formData, setFormData] = useState({ yourName: '' })

// When user types, update the data
const handleChange = (value) => {
  setFormData({ yourName: value })  // Updates the "cell"
}

// React automatically re-renders when data changes
```

### **Canvas Image Generation**

Think of Canvas like a digital piece of paper:

```javascript
// 1. Create canvas
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

// 2. Set size
canvas.width = 2480  // pixels
canvas.height = 3508 // A4 size

// 3. Draw background
ctx.fillStyle = '#ffffff'
ctx.fillRect(0, 0, width, height)

// 4. Write text at X,Y coordinates
ctx.fillText('Your Name', 100, 200)  // X=100, Y=200

// 5. Convert to image
const imageDataUrl = canvas.toDataURL('image/png')
```

### **Hour Calculation Logic**

```javascript
function calculateHours(start, end, sleep, breaks) {
  // Convert "08:00" to minutes: 8*60 + 0 = 480 minutes
  const startMinutes = 8 * 60 + 0  // 480
  const endMinutes = 16 * 60 + 0   // 960

  // Total minutes worked
  let total = endMinutes - startMinutes  // 480 minutes = 8 hours

  // Subtract sleep and breaks
  total = total - (sleep * 60) - breaks

  // Convert back to hours
  return total / 60
}
```

### **LocalStorage (Saving Data)**

LocalStorage is like a mini database in your browser:

```javascript
// Save data
localStorage.setItem('yourName', 'John Doe')

// Load data later
const name = localStorage.getItem('yourName')  // 'John Doe'

// Save complex data (objects)
localStorage.setItem('shifts', JSON.stringify({ monday: {...} }))
const shifts = JSON.parse(localStorage.getItem('shifts'))
```

---

## 🎨 **Customization Guide**

### **Change Company Name/Logo**

Edit `src/utils/generateTimesheet.js` line 40:

```javascript
ctx.fillText('Pinpoint Health & Social Care', 100, 120)
// Change to:
ctx.fillText('Your Company Name', 100, 120)
```

### **Change Email Recipient**

Edit `src/utils/sendEmail.js` line 19:

```javascript
const recipient = 'middlesbrough@pin-point.co.uk'
// Change to:
const recipient = 'your-email@example.com'
```

### **Adjust Colors**

Edit `src/index.css`:

```css
/* Line 12: Background gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Line 44: Primary button color */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### **Add More Role Types**

Edit `src/App.jsx` line 285:

```javascript
<select className="form-select" value={formData.role}>
  <option>Support Worker</option>
  <option>Your New Role</option>  {/* Add here */}
</select>
```

---

## 📊 **Future Enhancements (Roadmap)**

### **Phase 1: Current Features** ✅
- [x] Mobile-responsive form
- [x] Automatic hour calculations
- [x] Image generation
- [x] Download functionality
- [x] Email helper
- [x] Save/load last week

### **Phase 2: Planned (Next 2-4 Weeks)**
- [ ] Direct email sending (EmailJS integration)
- [ ] WhatsApp sharing
- [ ] Upload your own PDF template
- [ ] Multiple templates (different agencies)
- [ ] Dark mode

### **Phase 3: Multi-User Product (2-3 Months)**
- [ ] User accounts
- [ ] Cloud storage
- [ ] Timesheet history
- [ ] Admin dashboard for agencies
- [ ] Hourly rate calculator
- [ ] Expense tracking

---

## 💡 **Learning Resources**

If you want to understand the code better:

### **React**
- Official Tutorial: https://react.dev/learn
- Video: "React in 100 Seconds" (YouTube)

### **JavaScript**
- Interactive Tutorial: https://javascript.info
- Practice: https://www.freecodecamp.org/

### **Canvas API**
- MDN Guide: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- Tutorial: https://www.w3schools.com/graphics/canvas_intro.asp

### **CSS/Styling**
- Flexbox Guide: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- Grid Guide: https://css-tricks.com/snippets/css/complete-guide-grid/

---

## 🐛 **Troubleshooting**

### **Problem: App won't start**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

### **Problem: Image downloads but looks wrong**
- Check browser console for errors (F12)
- Try a different browser (Chrome, Safari)
- Check `generateTimesheet.js` coordinate positions

### **Problem: Hours not calculating correctly**
- Check that times are in 24-hour format (e.g., 16:00 not 4:00pm)
- Ensure sleep hours and breaks are numbers
- Look at browser console for errors

### **Problem: Can't access on iPhone**
- Ensure iPhone is on same WiFi as computer
- Try http://[computer-ip]:3000/ instead of localhost
- Check firewall isn't blocking port 3000

---

## 🚢 **Deployment Options**

### **Option 1: Vercel (Recommended)**
```bash
npm run build
npm install -g vercel
vercel
```

### **Option 2: Netlify**
1. Create account at netlify.com
2. Drag and drop the `dist` folder after running `npm run build`
3. Get URL like `https://timesheet-app.netlify.app`

### **Option 3: GitHub Pages**
```bash
npm install gh-pages --save-dev
npm run build
npx gh-pages -d dist
```

---

## 📄 **License**

Personal use only. Built for Pinpoint Health & Social Care support workers.

If you want to use this for your own agency or expand it into a product, feel free to modify it!

---

## 🙋 **Need Help?**

If you get stuck:
1. Check browser console (F12) for errors
2. Google the error message
3. Ask on Stack Overflow
4. Ask ChatGPT/Claude for debugging help

---

## 🎉 **You Built This!**

Congratulations! You now have a working timesheet generator that:
- Saves you 5-10 minutes every week
- Looks professional
- Auto-calculates hours
- Works on your iPhone
- You can customize and expand

**Next Steps:**
1. Try it out with this week's timesheet
2. Share with colleagues if they want it too
3. Deploy to Vercel for access anywhere
4. Consider expanding it into a side project/product!

---

Built with ❤️ by you (with Claude's help!)
