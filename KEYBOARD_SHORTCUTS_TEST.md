# Keyboard Shortcuts Test Guide

## 🧪 How to Test Keyboard Shortcuts

### 1. **Start the Application**
```bash
npm run build
npm start
```

### 2. **Open Developer Console**
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
- Go to the **Console** tab
- You should see console logs when shortcuts are triggered

### 3. **Test Each Shortcut**

#### ✅ **Ctrl+Enter** - Send Request
- **What it does**: Sends the current request
- **Test**: 
  1. Enter a URL (e.g., `https://httpbin.org/get`)
  2. Press `Ctrl+Enter`
  3. Should see: `🚀 Ctrl+Enter: Send Request` in console
  4. Request should be sent

#### ✅ **Ctrl+/** - Command Palette
- **What it does**: Opens the command palette
- **Test**:
  1. Press `Ctrl+/`
  2. Should see: `🔍 Ctrl+/: Open Command Palette` in console
  3. Command palette modal should open

#### ✅ **Ctrl+L** - Focus URL Field
- **What it does**: Focuses the URL input field
- **Test**:
  1. Click somewhere else to lose focus
  2. Press `Ctrl+L`
  3. Should see: `🔗 Ctrl+L: Focus URL` in console
  4. URL input should be focused (cursor in the field)

#### ✅ **Ctrl+P** - Focus Params Tab
- **What it does**: Switches to Query Params tab and focuses the textarea
- **Test**:
  1. Press `Ctrl+P`
  2. Should see: `📝 Ctrl+P: Focus Params` in console
  3. Should switch to "Query Params" tab
  4. Textarea should be focused

#### ✅ **Ctrl+H** - Focus Headers Tab
- **What it does**: Switches to Headers tab
- **Test**:
  1. Press `Ctrl+H`
  2. Should see: `📋 Ctrl+H: Focus Headers` in console
  3. Should switch to "Headers" tab

#### ✅ **Ctrl+B** - Focus Body Tab
- **What it does**: Switches to Body tab
- **Test**:
  1. Press `Ctrl+B`
  2. Should see: `📄 Ctrl+B: Focus Body` in console
  3. Should switch to "Body" tab

#### ✅ **Ctrl+S** - Save Collection
- **What it does**: Shows save collection notification
- **Test**:
  1. Press `Ctrl+S`
  2. Should see: `💾 Ctrl+S: Save Collection` in console
  3. Should show a notification about saving collection

### 4. **Troubleshooting**

#### ❌ **If shortcuts don't work:**

1. **Check Console for Errors**:
   - Look for any JavaScript errors in the console
   - Make sure you see the console log messages when pressing shortcuts

2. **Check Focus**:
   - Make sure the application window is focused
   - Click on the application window before testing shortcuts

3. **Check Input Fields**:
   - Shortcuts are disabled when typing in input fields (except Ctrl+Enter)
   - Click outside input fields before testing other shortcuts

4. **Browser vs Electron**:
   - Make sure you're running in Electron (`npm start`), not in a browser
   - Some shortcuts might be intercepted by the browser

#### ❌ **If you see errors:**

1. **"Cannot find name 'useCallback'"**:
   - The import was missing, should be fixed now

2. **"Shortcuts not working"**:
   - Check if the application is focused
   - Check console for any JavaScript errors
   - Make sure you're not in an input field

### 5. **Expected Behavior**

- **Console Logs**: You should see emoji-prefixed messages in the console
- **Visual Feedback**: Tabs should switch, fields should focus, modals should open
- **No Errors**: No JavaScript errors in the console
- **Smooth Operation**: Shortcuts should work immediately without delay

### 6. **Remove Debug Logs (Optional)**

Once you confirm shortcuts are working, you can remove the console.log statements from `src/hooks/useKeyboardShortcuts.ts` for a cleaner production build.

---

**Quick Test**: Try `Ctrl+/` first - it should open the command palette immediately and show a console log message.
