# SmartCrop - Google OAuth Configuration Script
# This script helps you add Google OAuth credentials to your .env file

Write-Host "`n🔐 SmartCrop - Google OAuth Setup" -ForegroundColor Green
Write-Host "====================================`n" -ForegroundColor Green

# Get current directory
$envPath = "C:\Users\praghav\smartcrop\backend\.env"

# Check if .env exists
if (!(Test-Path $envPath)) {
    Write-Host "❌ .env file not found at: $envPath" -ForegroundColor Red
    Write-Host "Creating new .env file..." -ForegroundColor Yellow
    New-Item -Path $envPath -ItemType File -Force
}

Write-Host "📋 Please enter your Google OAuth credentials:" -ForegroundColor Cyan
Write-Host "(Get these from: https://console.cloud.google.com/apis/credentials)`n" -ForegroundColor Gray

# Get Client ID
Write-Host "Google Client ID:" -ForegroundColor Yellow
Write-Host "  (format: xxxxx-xxxxx.apps.googleusercontent.com)" -ForegroundColor Gray
$clientId = Read-Host "Enter Client ID"

# Get Client Secret
Write-Host "`nGoogle Client Secret:" -ForegroundColor Yellow
Write-Host "  (format: GOCSPX-xxxxxxxxxxxx)" -ForegroundColor Gray
$clientSecret = Read-Host "Enter Client Secret"

Write-Host "`n📝 Updating .env file..." -ForegroundColor Cyan

# Read current .env content
$envContent = Get-Content $envPath -Raw

# Check if Google OAuth settings already exist
if ($envContent -match "GOOGLE_CLIENT_ID") {
    Write-Host "⚠️  Google OAuth settings already exist. Updating..." -ForegroundColor Yellow
    
    # Update existing values
    $envContent = $envContent -replace "GOOGLE_CLIENT_ID=.*", "GOOGLE_CLIENT_ID=$clientId"
    $envContent = $envContent -replace "GOOGLE_CLIENT_SECRET=.*", "GOOGLE_CLIENT_SECRET=$clientSecret"
} else {
    Write-Host "➕ Adding new Google OAuth settings..." -ForegroundColor Yellow
    
    # Add new values
    $oauthConfig = @"

# Google OAuth Configuration
GOOGLE_CLIENT_ID=$clientId
GOOGLE_CLIENT_SECRET=$clientSecret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:8080
"@
    $envContent += $oauthConfig
}

# Ensure FRONTEND_URL exists
if ($envContent -notmatch 'FRONTEND_URL') {
    $envContent += "`nFRONTEND_URL=http://localhost:8080"
}

# Save updated content
Set-Content -Path $envPath -Value $envContent -NoNewline

Write-Host "`n✅ Configuration saved successfully!" -ForegroundColor Green
Write-Host "`n📋 Current Google OAuth settings:" -ForegroundColor Cyan
Write-Host "  GOOGLE_CLIENT_ID=$clientId" -ForegroundColor Gray
Write-Host "  GOOGLE_CLIENT_SECRET=$clientSecret" -ForegroundColor Gray
Write-Host "  GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback" -ForegroundColor Gray
Write-Host "  FRONTEND_URL=http://localhost:8080" -ForegroundColor Gray

Write-Host "`n🔄 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Restart your backend: cd backend && npm start" -ForegroundColor White
Write-Host "  2. Go to http://localhost:8080/login" -ForegroundColor White
Write-Host "  3. Click 'Continue with Google'" -ForegroundColor White
Write-Host "  4. Test the login!" -ForegroundColor White

Write-Host "`n🎉 Setup complete!`n" -ForegroundColor Green

