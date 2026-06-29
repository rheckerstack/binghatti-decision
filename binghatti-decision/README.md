# Binghatti Dubai Investment Decision Framework

Complete Next.js application for the OOCEMR Dubai off-plan investment decision framework.

## Features

✓ Investor profiling (goal, risk, timeline, capital)
✓ Full 6-step OOCEMR framework
✓ Automatic recommendation generation
✓ Anonymous form submission (no client email collected)
✓ Email notifications to your inbox (info@atapex.co)
✓ PDF generation and download for clients
✓ Form lock after submission
✓ Branded with Binghatti + Rony Hecker details
✓ 2026 Dubai market context

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Vercel account (you already have this)
- Resend account (free)

## Setup Instructions

### 1. Create Resend Account (5 minutes)

1. Go to resend.com
2. Sign up (free)
3. Click "API Keys" 
4. Copy your API key
5. Keep it handy for step 4

### 2. Prepare Your Vercel Project

1. In your Vercel dashboard, create new project
2. Choose "Next.js" template
3. Name it `binghatti-dubai-decision`
4. Select your GitHub account

### 3. Clone/Setup Locally (Skip if using Vercel directly)

If you're deploying directly from GitHub:

```bash
# Clone this project to GitHub first
git clone [your-repo]
cd binghatti-decision
npm install
```

### 4. Add Environment Variable to Vercel

1. Go to your Vercel project settings
2. Click "Environment Variables"
3. Add:
   - Name: `RESEND_API_KEY`
   - Value: (paste your Resend API key)
   - Select "All environments"
4. Click "Save"

### 5. Deploy to Vercel

**Option A: Git Push (Recommended)**
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```
Vercel auto-deploys. Done.

**Option B: Vercel CLI**
```bash
npm install -g vercel
vercel --prod
```

### 6. Test Locally First (Optional)

```bash
npm install
npm run dev
```
Open http://localhost:3000

## Post-Deployment

### Update Email Domain (Optional but recommended)

In `pages/api/submit.js`, change:
```javascript
from: 'submissions@binghatti-dubai.com',
```

Get a custom domain on Resend:
1. Go to Resend dashboard
2. Add your domain (e.g., binghatti-dubai.com)
3. Follow DNS instructions
4. Update the `from` email

### Custom Domain Setup (Optional)

In Vercel:
1. Project Settings → Domains
2. Add your custom domain
3. Follow DNS setup

Your app will be at: `binghatti-dubai-decision.vercel.app` or your custom domain

## How Clients Use It

1. You send link (during Zoom call or async)
2. They fill 6-step framework (12-15 minutes)
3. System generates recommendation + PDF
4. PDF downloads to their computer
5. Form locks (submission complete)
6. You receive email with their answers
7. You follow up with their recommendation ready

## Email Flow

When client clicks "Generate & Download Summary":

1. Form data sent to Vercel serverless function
2. Email sent to info@atapex.co with:
   - Full investor profile
   - All OOCEMR answers
   - Recommendation + score
   - Reasoning + gaps
3. PDF generated and downloaded to their computer
4. Form becomes disabled
5. Success message shows

## Troubleshooting

**Email not sending?**
- Check Resend API key in Vercel env vars
- Verify email is: info@atapex.co (in submit.js)
- Check Resend dashboard for error logs

**Form not submitting?**
- Check browser console (F12) for errors
- Verify all required fields filled
- Check Vercel function logs: Vercel dashboard → Project → Logs

**PDF not generating?**
- jsPDF library must be installed: `npm install jspdf html2canvas`
- Check browser console for JavaScript errors

## File Structure

```
binghatti-decision/
├── pages/
│   ├── index.jsx          (Main form component)
│   └── api/
│       └── submit.js      (Email handler)
├── package.json           (Dependencies)
├── next.config.js         (Next.js config)
├── .env.local.example     (Environment template)
└── README.md              (This file)
```

## Customization

### Change Email Recipient
Edit `pages/api/submit.js`:
```javascript
to: 'your-email@example.com',
```

### Change Branding
Edit `pages/index.jsx`:
- Change "Binghatti" to your company
- Change "Rony Hecker, Senior Sales Manager"
- Change "+971 589054735" to your number

### Add Project-Specific Data
Edit the "Worst Case Scenarios" dropdown in Step 3 to include specific projects/developers

## Support

Issues? Check:
1. Vercel logs: Project → Logs
2. Resend dashboard for email errors
3. Browser console: F12 → Console
4. Vercel function deployment: Project → Functions

## Next Steps

1. Deploy to Vercel (steps above)
2. Test with test email to info@atapex.co
3. Add to your QR code / link in bio
4. Share with clients in Zoom calls
5. Monitor submissions in your email

Good luck! 🚀
