# Code Signing Setup Guide

This guide will help you set up code signing for your Electron app to resolve the "damaged app" error on macOS and ensure Windows compatibility.

## 🔐 Prerequisites

### For macOS Code Signing & Notarization:
1. **Apple Developer Account** ($99/year)
2. **Developer ID Application Certificate**
3. **App Store Connect API Key** (for notarization)

### For Windows Code Signing:
1. **Code Signing Certificate** (from DigiCert, Sectigo, etc.)
2. **Certificate in .p12 format**

## 📋 Step-by-Step Setup

### 1. macOS Setup

#### A. Get Apple Developer Account
1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Sign up for a developer account ($99/year)
3. Complete the enrollment process

#### B. Create Certificates
1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/certificates/list)
2. Create a **Developer ID Application** certificate
3. Download and install the certificate in Keychain Access

#### C. Create App Store Connect API Key
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **Users and Access** → **Keys** → **App Store Connect API**
3. Create a new key with **Developer** role
4. Download the `.p8` file and note the Key ID

#### D. Configure GitHub Secrets
Add these secrets to your GitHub repository:

```bash
# macOS Certificate (export from Keychain as .p12)
CERTIFICATE_P12_BASE64=<base64-encoded-p12-file>
CERTIFICATE_PASSWORD=<your-certificate-password>

# Apple ID for notarization
APPLE_ID=<your-apple-id@example.com>
APPLE_ID_PASSWORD=<app-specific-password>
APPLE_TEAM_ID=<your-team-id>

# App Store Connect API Key
APPSTORE_ISSUER_ID=<your-issuer-id>
APPSTORE_API_KEY_ID=<your-key-id>
APPSTORE_API_PRIVATE_KEY=<your-private-key-content>
```

### 2. Windows Setup

#### A. Get Code Signing Certificate
1. Purchase a code signing certificate from:
   - [DigiCert](https://www.digicert.com/code-signing/)
   - [Sectigo](https://sectigo.com/ssl-certificates-tls/code-signing)
   - [GlobalSign](https://www.globalsign.com/en/code-signing-certificate)

#### B. Configure GitHub Secrets
Add these secrets to your GitHub repository:

```bash
# Windows Certificate
WINDOWS_CERTIFICATE_P12_BASE64=<base64-encoded-p12-file>
WINDOWS_CERTIFICATE_PASSWORD=<your-certificate-password>
```

### 3. Update Configuration

#### A. Update package.json
Replace `YOUR_APPLE_TEAM_ID` in `package.json` with your actual Apple Team ID:

```json
"notarize": {
  "teamId": "YOUR_ACTUAL_APPLE_TEAM_ID"
}
```

#### B. Update build/entitlements.mac.plist
The entitlements file is already configured for your app's needs.

## 🚀 Building Signed Apps

### Local Development (Unsigned)
```bash
npm run dist:mac    # macOS (unsigned)
npm run dist:win    # Windows (unsigned)
npm run dist:linux   # Linux
```

### Production (Signed)
The GitHub Actions workflow will automatically:
1. Build the app
2. Sign with your certificates
3. Notarize for macOS
4. Create a release with signed binaries

## 🔧 Troubleshooting

### macOS "App is Damaged" Error
- **Cause**: App not code-signed or notarized
- **Solution**: Use the signed build from GitHub Actions

### Windows SmartScreen Warning
- **Cause**: App not code-signed
- **Solution**: Use the signed build from GitHub Actions

### Certificate Issues
- Ensure certificates are valid and not expired
- Check that certificates match your app's bundle ID
- Verify GitHub secrets are correctly base64-encoded

## 📝 Notes

1. **Development vs Production**: Local builds are unsigned for development. Only GitHub Actions builds are signed.

2. **Certificate Expiry**: Code signing certificates expire. Set up renewal reminders.

3. **Notarization**: macOS requires notarization for apps distributed outside the App Store.

4. **Windows Defender**: Even signed apps might trigger warnings on first run. This is normal.

## 🆘 Need Help?

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Verify all secrets are correctly set
3. Ensure certificates are valid and not expired
4. Check that your Apple Developer account is in good standing

## 🔄 Alternative: Unsigned Builds

If you don't want to set up code signing, users can still run your app by:

### macOS:
1. Right-click the app → "Open"
2. Or: `xattr -cr /path/to/your/app.app`

### Windows:
1. Click "More info" → "Run anyway" when SmartScreen appears
2. Or: Add the app to Windows Defender exclusions

However, **signed apps provide better user experience and security**.
