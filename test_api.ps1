try {
  $login = Invoke-RestMethod -Method Post -Uri 'http://localhost:5000/api/auth/login' -ContentType 'application/json' -Body ('{"email":"admin@phcs.com","password":"admin123"}')
  Write-Output 'LOGIN_RESPONSE:'
  $login | ConvertTo-Json -Depth 5
  $token = $login.token
  Write-Output 'TOKEN:'
  Write-Output $token
  if ($token) {
    Write-Output 'CREATING CASE...'
    $create = Invoke-RestMethod -Uri 'http://localhost:5000/api/cases' -Method Post -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body ('{"ownerName":"Alice","ownerPhone":"1234567890","petName":"Buddy","issueType":"injury","description":"Test case from automated check"}')
    $create | ConvertTo-Json -Depth 5
    Write-Output 'FETCHING CASES...'
    $list = Invoke-RestMethod -Uri 'http://localhost:5000/api/cases'
    $list | ConvertTo-Json -Depth 10
  } else {
    Write-Error 'No token received'
  }
} catch {
  Write-Error $_.Exception.Message
}
