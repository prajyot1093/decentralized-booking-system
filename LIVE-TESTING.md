# 🧪 **LIVE DEPLOYMENT TEST CHECKLIST**

## 📋 **FRONTEND TESTS (Your Netlify URL)**

### **Basic Functionality:**
- [ ] **Homepage loads** without errors
- [ ] **Service cards display** (Movies, Flights, Concerts)
- [ ] **Navigation works** between pages
- [ ] **Responsive design** on mobile/tablet
- [ ] **No console errors** in browser DevTools

### **Interactive Features:**
- [ ] **Service selection** opens detail view
- [ ] **Seat map displays** with interactive seats
- [ ] **Seat selection** highlights correctly
- [ ] **Booking button** triggers confirmation
- [ ] **Loading states** show during actions

### **Performance Checks:**
- [ ] **Page loads** under 2 seconds
- [ ] **Images load** properly
- [ ] **CSS styling** applied correctly
- [ ] **Mobile viewport** renders properly

---

## 🔧 **BACKEND TESTS (Your Railway URL)**

### **API Endpoints:**
Replace `YOUR_RAILWAY_URL` with your actual Railway URL:

```bash
# Health Check
GET YOUR_RAILWAY_URL/api/health
Expected: {"status":"OK","timestamp":"...","uptime":...,"mode":"demo"}

# Services List
GET YOUR_RAILWAY_URL/api/services  
Expected: {"success":true,"data":[...services array...]}

# Individual Service
GET YOUR_RAILWAY_URL/api/services/1
Expected: {"success":true,"data":{...service object...}}

# Booking Endpoint
POST YOUR_RAILWAY_URL/api/services/1/book
Expected: {"success":true,"message":"Booking successful (demo mode)","bookingId":"..."}
```

### **Integration Tests:**
- [ ] **Frontend calls backend** successfully
- [ ] **CORS allows** frontend domain
- [ ] **API responses** load in frontend
- [ ] **Error handling** shows user-friendly messages
- [ ] **Network tab** shows successful requests

---

## 🎯 **QUICK TEST COMMANDS**

Once you have your live URLs, test these:

### **Frontend Quick Test:**
1. Open your Netlify URL
2. Check browser console (F12) for errors
3. Try booking flow: Select service → Choose seats → Book

### **Backend Quick Test:**
```bash
# Replace with your Railway URL
curl https://your-app.railway.app/api/health
curl https://your-app.railway.app/api/services
```

### **Integration Test:**
1. Open frontend in browser
2. Open DevTools → Network tab
3. Try booking - should see API calls to Railway URL
4. Verify responses are successful (200 status)

---

## ⚡ **COMMON FIXES**

### **If Frontend doesn't load:**
- Check Netlify build logs
- Verify build folder was uploaded correctly
- Check for deployment errors

### **If Backend API fails:**
- Check Railway deployment logs
- Verify repository root directory set to `/backend`
- Check environment variables

### **If CORS errors occur:**
- Backend already configured for multiple domains
- May need to add your specific Netlify URL to CORS whitelist

---

## 🎊 **SUCCESS CRITERIA**

Your deployment is successful when:
- ✅ Frontend loads without errors
- ✅ All service cards display
- ✅ Seat selection works
- ✅ Booking flow completes
- ✅ API endpoints respond
- ✅ No CORS errors
- ✅ Mobile responsive

**Expected Performance:**
- Load time: <2 seconds
- Bundle size: ~156KB
- No console errors
- Smooth interactions

---

## 📝 **NOTES SECTION**

**Your Live URLs:**
- Frontend: `https://_____.netlify.app`
- Backend: `https://_____.railway.app`
- API Health: `https://_____.railway.app/api/health`

**Test Results:**
- [ ] All tests pass
- [ ] Performance acceptable
- [ ] Ready to share

---

**🚀 Ready to test your live deployment!**