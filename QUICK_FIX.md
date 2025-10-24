# 🚨 Quick Fix for "App is Damaged" Error

## Immediate Solutions (No Code Signing Required)

### For macOS Users:
1. **Right-click the app** → **"Open"** (instead of double-clicking)
2. Or run this command in Terminal:
   ```bash
   xattr -cr /path/to/your/app.app
   ```
3. Or go to **System Preferences** → **Security & Privacy** → **General** → **"Open Anyway"**

### For Windows Users:
1. When SmartScreen appears, click **"More info"**
2. Click **"Run anyway"**
3. Or add the app to Windows Defender exclusions

## 🔧 Developer Solutions

### Option 1: Quick Local Fix (Unsigned)
```bash
# Build locally (will be unsigned but functional)
npm run dist:mac    # For macOS
npm run dist:win    # For Windows
```

### Option 2: Proper Code Signing (Recommended)
Follow the `SETUP_SIGNING.md` guide to set up proper code signing.

## 🎯 Why This Happens

- **macOS**: Gatekeeper blocks unsigned apps for security
- **Windows**: SmartScreen flags unsigned apps as potentially unsafe
- **Solution**: Code signing makes apps "trusted" by the OS

## 📋 Next Steps

1. **Immediate**: Use the workarounds above for current users
2. **Long-term**: Set up code signing following `SETUP_SIGNING.md`
3. **Future releases**: Use signed builds from GitHub Actions

## 🆘 Still Having Issues?

If the app still won't open:
1. Check if it's a 32-bit vs 64-bit compatibility issue
2. Verify the app was built for the correct architecture
3. Check the console logs for specific error messages
