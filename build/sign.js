const { execSync } = require('child_process');
const path = require('path');

exports.default = async function(configuration) {
  const { path: filePath, hash } = configuration;
  
  console.log(`Signing ${filePath}...`);
  
  try {
    // For development/testing, you can use a self-signed certificate
    // In production, use a proper code signing certificate
    const certPath = path.join(__dirname, 'certificate.p12');
    const certPassword = process.env.CERTIFICATE_PASSWORD || '';
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Skipping code signing');
      return;
    }
    
    // Windows code signing with signtool
    const signToolPath = 'signtool.exe';
    const command = `"${signToolPath}" sign /f "${certPath}" /p "${certPassword}" /t http://timestamp.digicert.com /v "${filePath}"`;
    
    execSync(command, { stdio: 'inherit' });
    console.log(`Successfully signed ${filePath}`);
    
  } catch (error) {
    console.warn(`Code signing failed for ${filePath}:`, error.message);
    // Don't fail the build if signing fails
  }
};
