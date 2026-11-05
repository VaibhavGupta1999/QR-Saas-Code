$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$outDir = "C:\Users\vaibhav\proposal_assets"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir }

Write-Host "Capturing Menu..."
Start-Process $edge -ArgumentList "--headless", "--screenshot=$outDir\screenshot_menu.png", "--window-size=1280,950", "http://localhost:3000/menu?table=04" -Wait

Write-Host "Capturing Kitchen KDS..."
Start-Process $edge -ArgumentList "--headless", "--screenshot=$outDir\screenshot_kds.png", "--window-size=1280,950", "http://localhost:3000/kitchen" -Wait

Write-Host "Capturing Admin Command..."
Start-Process $edge -ArgumentList "--headless", "--screenshot=$outDir\screenshot_admin.png", "--window-size=1280,950", "http://localhost:3000/admin" -Wait

$files = Get-ChildItem $outDir
foreach ($f in $files) {
    Write-Host "$($f.Name): $($f.Length) bytes"
}
