# SkillUp Backend - Set Vercel Environment Variables
# Run this script from the backend folder while logged into Vercel CLI

Write-Host "Setting Vercel environment variables for skillupbackend..." -ForegroundColor Yellow

$pairs = @(
    @("MONGODB_URI",        "your_mongodb_uri_here"),
    @("JWT_SECRET",         "your_super_secret_jwt_key_change_this_in_production"),
    @("JWT_EXPIRE",         "7d"),
    @("JWT_REFRESH_SECRET", "your_refresh_token_secret_key"),
    @("JWT_REFRESH_EXPIRE", "30d"),
    @("NODE_ENV",           "production"),
    @("VERCEL",             "1"),
    @("CLIENT_URL",         "https://skill-up-r21x.vercel.app"),
    @("FRONTEND_URL",       "https://skill-up-r21x.vercel.app"),
    @("RESET_PASSWORD_URL", "https://skill-up-r21x.vercel.app/reset-password"),
    @("AGORA_APP_ID",       "your_agora_app_id_here"),
    @("AGORA_APP_CERTIFICATE", "your_agora_app_certificate_here"),
    @("EMAIL_HOST",         "smtp.gmail.com"),
    @("EMAIL_PORT",         "587"),
    @("EMAIL_USER",         "your_email_here"),
    @("EMAIL_PASSWORD",     "your_gmail_app_password_here"),
    @("EMAIL_FROM",         "your_email_here"),
    @("AI_PROVIDER",        "openai"),
    @("OPENAI_API_KEY",     "your_openai_api_key_here"),
    @("HUGGINGFACE_API_KEY","your_huggingface_api_key_here")
)

foreach ($pair in $pairs) {
    $key   = $pair[0]
    $value = $pair[1]
    Write-Host "  Adding $key ..." -ForegroundColor Cyan
    $tmpFile = [System.IO.Path]::GetTempFileName()
    [System.IO.File]::WriteAllText($tmpFile, $value, [System.Text.Encoding]::UTF8)
    Get-Content $tmpFile -Raw | vercel env add $key production
    Remove-Item $tmpFile -Force
    Start-Sleep -Milliseconds 300
}

Write-Host ""
Write-Host "All environment variables set!" -ForegroundColor Green
Write-Host "Now redeploying..." -ForegroundColor Yellow
vercel --prod
Write-Host ""
Write-Host "Done! Backend is live." -ForegroundColor Green
