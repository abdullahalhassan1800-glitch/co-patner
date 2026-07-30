const forge = require('node-forge');
const fs = require('fs');

const pfxBuffer = fs.readFileSync('cert.pfx');
const p12Asn1 = forge.asn1.fromDer(forge.util.decode64(pfxBuffer.toString('base64')));
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, 'copatner123');

const keyBags = p12.getBags({ bagType: forge.oids.pkcs8ShroudedKeyBag });
const certBags = p12.getBags({ bagType: forge.oids.certBag });

const key = keyBags[forge.oids.pkcs8ShroudedKeyBag][0].key;
const cert = certBags[forge.oids.certBag][0].cert;

const keyPem = forge.pki.privateKeyToPem(key);
const certPem = forge.pki.certificateToPem(cert);

fs.writeFileSync('key.pem', keyPem);
fs.writeFileSync('cert.pem', certPem);
console.log('✅ PEM files created: cert.pem, key.pem');
