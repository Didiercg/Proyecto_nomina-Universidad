$h = @{
    "apikey" = "sb_publishable_WniQ7BNB3SpUqydE_NyvKg_nuPKgFnT"
    "Authorization" = "Bearer sb_publishable_WniQ7BNB3SpUqydE_NyvKg_nuPKgFnT"
}
$tables = @('registro', 'cambio_aceite', 'deudas', 'gastos_fijos', 'devengado_presupuesto', 'metas_ahorro', 'configuracion')
foreach ($table in $tables) {
    try {
        $res = Invoke-RestMethod -Uri "https://tjghdapguudilkzglhwg.supabase.co/rest/v1/$table?select=*&limit=1" -Headers $h -Method Get
        Write-Output "$table : OK (Records accessible)"
    } catch {
        Write-Output "$table : NOT FOUND or ERROR ($($_.Exception.Message))"
    }
}
