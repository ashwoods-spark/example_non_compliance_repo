# API Quick Reference

Base URL (local): `http://localhost:8080/api`

## Authentication

### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "demo@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "displayName": "Demo User"
}
```

## Scans

### Create Scan
```http
POST /api/scans
Authorization: Bearer {token}
Content-Type: application/json

{
  "repoUrl": "https://github.com/example/repo",
  "branch": "main"
}
```

### List Scans
```http
GET /api/scans
Authorization: Bearer {token}
```

### Get Scan Details
```http
GET /api/scans/{scanId}
Authorization: Bearer {token}
```

### Get Scan Heatmap
```http
GET /api/scans/{scanId}/heatmap
Authorization: Bearer {token}
```

## Findings

### Get Finding
```http
GET /api/findings/{findingId}
Authorization: Bearer {token}
```

## Rulesets

### List Rulesets
```http
GET /api/rulesets
Authorization: Bearer {token}
```

### Get Ruleset
```http
GET /api/rulesets/{rulesetId}
Authorization: Bearer {token}
```

### Get Ruleset Diff
```http
GET /api/rulesets/{rulesetId}/diff?from=v1&to=v2
Authorization: Bearer {token}
```

### Export Ruleset
```http
GET /api/rulesets/{rulesetId}/export?format=json
Authorization: Bearer {token}
```

Format options: `json`, `yaml`, `txt`

## Reports

### Export Scan Report
```http
POST /api/reports/{scanId}/export
Authorization: Bearer {token}
Content-Type: application/json

{
  "format": "json"
}
```

Format options: `json`, `csv`, `pdf`

## Uploads

### Upload File
```http
POST /api/uploads
Authorization: Bearer {token}
Content-Type: multipart/form-data

(file upload)
```

### Get Upload
```http
GET /api/uploads/{uploadId}
Authorization: Bearer {token}
```

## Statistics

### Get Summary Stats
```http
GET /api/stats/summary
Authorization: Bearer {token}
```

Response:
```json
{
  "totalScans": 10,
  "completedScans": 8,
  "totalFindings": 42,
  "environment": "Evaluation",
  "region": "AU-East",
  "incomeCap": 92000
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Not implemented in demo. Recommended for production: 100 requests/minute per user.

