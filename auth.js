/* Auth guard — loaded at top of every section page (before body paint) */
(function () {
  var SESSION_KEY = 'wj_auth_token';
  var HMAC_KEY_HEX = '3f5872fa78a3e093313654f190d58d1354e5e7fc44f7eb7550871f6a4956c154';
  var MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

  function hexToBytes(hex) {
    var arr = new Uint8Array(hex.length / 2);
    for (var i = 0; i < arr.length; i++)
      arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return arr;
  }

  function redirect() {
    // Wipe any token that exists before redirecting
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    var depth = window.location.pathname.split('/').filter(Boolean).length;
    var prefix = depth > 1 ? '../' : '';
    window.location.replace(prefix + 'index.html');
  }

  var raw = null;
  try { raw = sessionStorage.getItem(SESSION_KEY); } catch (e) {}
  if (!raw) { redirect(); return; }

  var parts = raw.split('|');
  if (parts.length !== 3) { redirect(); return; }

  var storedSig = parts[0];
  var issuedAt  = parseInt(parts[1], 10);
  var nonce     = parts[2];

  // Check expiry first (cheap)
  if (isNaN(issuedAt) || Date.now() - issuedAt > MAX_AGE_MS) { redirect(); return; }

  // Verify HMAC-SHA256 in the background — hide content until verified
  document.documentElement.style.visibility = 'hidden';

  var payload = issuedAt + '|' + nonce;
  crypto.subtle.importKey(
    'raw', hexToBytes(HMAC_KEY_HEX),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  ).then(function (key) {
    var enc = new TextEncoder();
    return crypto.subtle.verify('HMAC', key, hexToBytes(storedSig), enc.encode(payload));
  }).then(function (valid) {
    if (valid) {
      document.documentElement.style.visibility = '';
    } else {
      redirect();
    }
  }).catch(function () { redirect(); });
})();
