const { X509Certificate, generateKeyPairSync } = require('crypto');
const { execSync } = require('child_process');
const fs = require('fs');

// Use Node.js built-in to generate cert via a small script
const script = `
const { writeFileSync } = require('fs');
const forge = require('/tmp/forge.js');
// Fallback: just use node crypto with a different approach
`;

// Simplest: use PowerShell to create cert via .NET
const powershell = `
$cert = New-SelfSignedCertificate -DnsName "localhost","127.0.0.1","192.168.1.42","10.210.53.3" -CertStoreLocation "Cert:\\CurrentUser\\My" -NotAfter (Get-Date).AddYears(1) -KeyAlgorithm RSA -KeyLength 2048 -HashAlgorithm SHA256
$password = ConvertTo-SecureString -String "temp123" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "G:\\App\\cert.pfx" -Password $password
Write-Output "Cert thumbprint: $($cert.Thumbprint)"
`;

try {
  execSync(`powershell -Command "${powershell.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
  
  // Extract PEM from PFX using PowerShell
  const extractPem = `
$cert = Get-ChildItem -Path Cert:\\CurrentUser\\My -DnsName "localhost" | Sort-Object NotAfter -Descending | Select-Object -First 1
$key = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($cert)
$privateKeyBytes = $key.ExportRSAPrivateKey()
$publicKeyBytes = $cert.PublicKey.EncodedKeyValue.RawData

function Convert-ToPem($bytes, $label) {
  $b64 = [Convert]::ToBase64String($bytes)
  $lines = ($b64 -split '(.{64})') | Where-Object { $_ }
  return "-----BEGIN $label-----`n" + ($lines -join "`n") + "`n-----END $label-----"
}

$keyPem = Convert-ToPem $privateKeyBytes "PRIVATE KEY"
$certPem = "-----BEGIN CERTIFICATE-----`n" + [Convert]::ToBase64String($cert.RawData) + "`n-----END CERTIFICATE-----"

$keyPem | Out-File -FilePath "G:\\App\\key.pem" -Encoding ascii -NoNewline
$certPem | Out-File -FilePath "G:\\App\\cert.pem" -Encoding ascii -NoNewline
Write-Output "PEM files created"
`;

  execSync(`powershell -Command "${extractPem.replace(/"/g, '\\"').replace(/`n/g, ';')}"`, { stdio: 'inherit' });
  console.log('✅ SSL certificates created: cert.pem, key.pem');
} catch (e) {
  console.error('Failed:', e.message);
}
