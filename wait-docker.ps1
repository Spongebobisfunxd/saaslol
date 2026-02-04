Write-Host "Waiting for Docker daemon..."
$docker = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
for ($i = 0; $i -lt 30; $i++) {
    try {
        $output = & $docker info 2>&1
        if ($LASTEXITCODE -eq 0 -and $output -notmatch "ERROR") {
            Write-Host "Docker is ready!"
            exit 0
        }
    } catch {}
    Start-Sleep -Seconds 5
    Write-Host "Attempt $($i+1)/30..."
}
Write-Host "Docker did not start in time"
exit 1
