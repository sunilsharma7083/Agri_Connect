# CORS Configuration Instructions

## The Problem
You were getting a CORS error because your backend server wasn't configured to allow requests from your frontend domain (`https://agri-connect-omega.vercel.app`).

## What Was Fixed

### 1. Server CORS Configuration Updated ✅
- Updated `server/server.js` to include your production frontend URL
- Added dynamic environment variable support for additional origins
- Added better error logging to help debug CORS issues
- Added explicit preflight request handling

### 2. Environment Files Created ✅

#### For Server (Production):
- `server/.env.production` - Copy this to `.env` on your Render deployment
- Make sure to set `CLIENT_URL=https://agri-connect-omega.vercel.app`

#### For Client:
- `client/.env.production` - Make sure this is deployed with your Vercel app
- `client/.env.development` - For local development

### 3. Registration Debugging Added ✅
- Added comprehensive logging to track registration attempts
- Improved error handling for email sending failures
- Registration now succeeds even if welcome email fails

## Testing Results ✅

Local testing shows:
- ✅ CORS is working correctly for your domain
- ✅ Registration endpoint is functional
- ✅ Database connection works
- ✅ User creation succeeds
- ⚠️  Email sending fails (expected without valid email config)

## Deployment Checklist

### On Render (Backend):
1. **Environment Variables** - Set these in Render dashboard:
   ```
   NODE_ENV=production
   CLIENT_URL=https://agri-connect-omega.vercel.app
   ALLOWED_ORIGINS=https://agri-connect-omega.vercel.app,http://localhost:3000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
   JWT_EXPIRE=7d
   PORT=5000
   ```

2. **Optional Email Config** (for welcome emails):
   ```
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_specific_password
   EMAIL_FROM=noreply@yourapp.com
   ```

### On Vercel (Frontend):
1. **Environment Variable** - Set in Vercel dashboard:
   ```
   REACT_APP_API_URL=https://agri-connect-srk4.onrender.com/api/v1
   ```

### Testing After Deployment:
1. Check Render logs for CORS origins being logged
2. Test registration from your frontend
3. Look for "📝 Registration attempt" logs to debug issues

## Troubleshooting

### If registration still fails:

1. **Check Render Logs**:
   - Look for MongoDB connection errors
   - Check if CORS origins are being logged correctly
   - Verify environment variables are loaded

2. **Test API Directly**:
   ```bash
   curl -X POST https://agri-connect-srk4.onrender.com/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -H "Origin: https://agri-connect-omega.vercel.app" \
     -d '{"name":"Test","email":"test@test.com","password":"123456","phone":"9876543210","role":"farmer","address":{"street":"Test","city":"Test","state":"Test","pincode":"123456"}}'
   ```

3. **Common Issues**:
   - MongoDB connection string incorrect
   - JWT_SECRET not set
   - Environment variables not properly configured on Render

## Status: Ready for Deployment 🚀

The code is working correctly. The issue is likely with production environment configuration.
