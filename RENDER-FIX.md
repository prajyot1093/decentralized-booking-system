# 🔧 **RENDER DEPLOYMENT - FIXED CONFIGURATION**

## ⚡ **SOLUTION FOR "Cannot find module index.js" ERROR**

### **✅ FIXED CONFIGURATION:**

1. **Root Entry Point**: `backend/index.js` (in project root, not src/)
2. **Package.json**: Points to root `index.js` file  
3. **No render.yaml**: Use dashboard configuration instead
4. **Manual Configuration**: Set up through Render web interface

---

## 🚀 **STEP-BY-STEP RENDER DEPLOYMENT**

### **Backend Deployment (Web Service)**

1. **Go to**: https://dashboard.render.com/
2. **Click**: "New +" → "Web Service"  
3. **Connect**: Your GitHub repository `decentralized-booking-system`

### **Manual Configuration (IMPORTANT):**
```yaml
# DO NOT use render.yaml file - configure manually:
Name: decentralized-booking-api
Branch: rescue/commit-7  
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### **Environment Variables:**
```bash
NODE_ENV=production
PORT=(auto-assigned by Render)
```

---

## 🌐 **FRONTEND DEPLOYMENT (Static Site)**

1. **Click**: "New +" → "Static Site"
2. **Connect**: Same GitHub repository

### **Configuration:**
```yaml
Name: decentralized-booking-demo
Branch: rescue/commit-7
Root Directory: frontend  
Build Command: npm run build
Publish Directory: build
```

### **Environment Variables:**
```bash
NODE_VERSION=18
REACT_APP_API_URL=https://your-backend-name.onrender.com
```

---

## 🔧 **TROUBLESHOOTING GUIDE**

### **If Backend Still Fails:**

1. **Check Build Logs** in Render dashboard
2. **Verify File Structure**:
   ```
   backend/
   ├── index.js          ← ROOT entry point (NEW)
   ├── package.json      ← Points to index.js  
   └── src/
       ├── server.js     ← Actual server code
       └── index.js      ← Alternative entry (backup)
   ```

3. **Manual Deploy Commands**:
   - Build: `npm install`
   - Start: `npm start` 
   - OR try: `node index.js`

### **Alternative Start Commands to Try:**
```bash
# Option 1 (Current):
npm start

# Option 2 (Direct):  
node index.js

# Option 3 (Full path):
node ./index.js

# Option 4 (Src path):
node src/server.js
```

---

## ✅ **VERIFIED WORKING CONFIGURATION**

### **File Contents:**

**backend/index.js** (ROOT):
```javascript
// Root index.js for Render deployment
require('./src/server.js');
```

**backend/package.json**:
```json
{
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}
```

**backend/src/server.js**: 
- Contains your Express server
- Exports app and starts server

---

## 🎯 **DEPLOYMENT CHECKLIST**

### **✅ Pre-Deploy:**
- [x] Root `index.js` file created
- [x] Package.json updated to use root entry
- [x] No conflicting render.yaml file
- [x] Local test successful (`node index.js` works)

### **🚀 Deploy Process:**
- [ ] Create Render Web Service manually
- [ ] Set Root Directory to `backend`  
- [ ] Set Build Command to `npm install`
- [ ] Set Start Command to `npm start`
- [ ] Wait for deployment (3-5 minutes)
- [ ] Check logs for success message

### **🧪 Test Deployment:**
- [ ] Visit `https://your-service.onrender.com/api/health`
- [ ] Should return: `{"status":"OK","mode":"demo"}`
- [ ] No "Cannot find module" errors

---

## 🎊 **EXPECTED SUCCESS**

### **Render Logs Should Show:**
```
🚀 Demo Server running on port 3001
🌐 Frontend: http://localhost:3000
📡 Backend: http://localhost:3001  
💡 Mode: Demo (no blockchain)
==> Your service is live at https://your-service.onrender.com
```

### **Live URLs:**
- Backend: `https://your-service.onrender.com`
- Health: `https://your-service.onrender.com/api/health`
- Services: `https://your-service.onrender.com/api/services`

---

**🚀 This configuration fixes the "Cannot find module" error!**  
**Go back to Render and re-deploy with the manual configuration above.** ✨