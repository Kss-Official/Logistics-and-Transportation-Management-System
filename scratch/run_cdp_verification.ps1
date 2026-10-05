$chromeProcess = Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" `
    -ArgumentList "--remote-debugging-port=9222", "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--user-data-dir=C:\Users\shrut\AppData\Local\Temp\chrome-debug-profile", "http://localhost:5173/warehouse/login" `
    -PassThru

Start-Sleep -Seconds 3

try {
    node .\scratch\verify_cdp.cjs
} finally {
    if ($chromeProcess -and !$chromeProcess.HasExited) {
        Stop-Process -Id $chromeProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
