$h = @{
    "apikey" = "sb_publishable_WniQ7BNB3SpUqydE_NyvKg_nuPKgFnT"
    "Authorization" = "Bearer sb_publishable_WniQ7BNB3SpUqydE_NyvKg_nuPKgFnT"
}
try {
    $r = Invoke-RestMethod -Uri "https://tjghdapguudilkzglhwg.supabase.co/rest/v1/" -Headers $h -Method Get
    Write-Output "Rest root keys: $($r.swagger)"
    Write-Output "Definitions: $($r.definitions.PSObject.Properties.Name -join ', ')"
} catch {
    Write-Output "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Output "Response body: $($reader.ReadToEnd())"
    }
}
