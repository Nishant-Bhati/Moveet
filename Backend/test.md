# API Endpoints Verification Responses

## 1. GET /scooters/nearby?lat=28.01&lng=77.24

```json
{
  "success": true,
  "data": [
    {
      "id": "6a22a32cb773af37e6f157d3",
      "iotId": "c2000000-0000-0000-0000-000000000002",
      "code": "S-102",
      "displayName": "S-102",
      "model": "Moveet Pro X",
      "battery": 100,
      "rangeKm": 45,
      "latitude": 28.015,
      "longitude": 77.23,
      "status": "AVAILABLE",
      "isLocked": true,
      "speed": 0,
      "signalStrength": 81,
      "odometer": 89.2,
      "lastHeartbeat": "2026-06-05T13:53:00.728Z",
      "pricing": {
        "minutely": 0.25,
        "daily": 150
      }
    },
    {
      "id": "6a22a32cb773af37e6f157d2",
      "iotId": "c1000000-0000-0000-0000-000000000001",
      "code": "Z-010",
      "displayName": "Z-010",
      "model": "Moveet Pro X",
      "battery": 100,
      "rangeKm": 45,
      "latitude": 28.0112,
      "longitude": 77.2258,
      "status": "AVAILABLE",
      "isLocked": true,
      "speed": 0,
      "signalStrength": 97,
      "odometer": 1204.5,
      "lastHeartbeat": "2026-06-05T13:53:00.728Z",
      "pricing": {
        "minutely": 0.25,
        "daily": 150
      }
    }
  ],
  "message": "Nearby AVAILABLE scooters retrieved successfully"
}
```

## 2. POST /rides/start

```json
{
  "success": true,
  "data": {
    "userId": "6a22d45d3829a6f9581c25cd",
    "scooterId": {
      "pricing": {
        "minutely": 0.25,
        "daily": 150
      },
      "location": {
        "type": "Point",
        "coordinates": [
          77.23,
          28.015
        ]
      },
      "_id": "6a22a32cb773af37e6f157d3",
      "iotId": "c2000000-0000-0000-0000-000000000002",
      "__v": 0,
      "assignedUserId": "6a22d45d3829a6f9581c25cd",
      "battery": 100,
      "code": "S-102",
      "createdAt": "2026-06-05T10:21:32.890Z",
      "isLocked": true,
      "lastHeartbeat": "2026-06-05T13:53:00.728Z",
      "latitude": 28.015,
      "longitude": 77.23,
      "model": "Moveet Pro X",
      "odometer": 89.2,
      "rangeKm": 45,
      "signalStrength": 81,
      "speed": 0,
      "status": "IN_USE",
      "updatedAt": "2026-06-05T13:53:54.838Z"
    },
    "iotScooterId": "c2000000-0000-0000-0000-000000000002",
    "status": "ACTIVE",
    "startTime": "2026-06-05T13:53:54.355Z",
    "endTime": null,
    "durationSeconds": null,
    "distanceKm": null,
    "cost": 0,
    "fromLabel": null,
    "toLabel": null,
    "_id": "6a22d4f24724aef53fd9ddbf",
    "createdAt": "2026-06-05T13:53:54.365Z",
    "updatedAt": "2026-06-05T13:53:54.365Z",
    "__v": 0
  },
  "message": "Ride started successfully"
}
```

## 3. GET /rides/active

```json
{
  "success": true,
  "data": {
    "_id": "6a22d4f24724aef53fd9ddbf",
    "userId": "6a22d45d3829a6f9581c25cd",
    "scooterId": {
      "pricing": {
        "minutely": 0.25,
        "daily": 150
      },
      "location": {
        "type": "Point",
        "coordinates": [
          77.23,
          28.015
        ]
      },
      "_id": "6a22a32cb773af37e6f157d3",
      "iotId": "c2000000-0000-0000-0000-000000000002",
      "__v": 0,
      "assignedUserId": "6a22d45d3829a6f9581c25cd",
      "battery": 100,
      "code": "S-102",
      "createdAt": "2026-06-05T10:21:32.890Z",
      "isLocked": true,
      "lastHeartbeat": "2026-06-05T13:53:00.728Z",
      "latitude": 28.015,
      "longitude": 77.23,
      "model": "Moveet Pro X",
      "odometer": 89.2,
      "rangeKm": 45,
      "signalStrength": 81,
      "speed": 0,
      "status": "IN_USE",
      "updatedAt": "2026-06-05T13:53:54.838Z"
    },
    "iotScooterId": "c2000000-0000-0000-0000-000000000002",
    "status": "ACTIVE",
    "startTime": "2026-06-05T13:53:54.355Z",
    "endTime": null,
    "durationSeconds": null,
    "distanceKm": null,
    "cost": 0,
    "fromLabel": null,
    "toLabel": null,
    "createdAt": "2026-06-05T13:53:54.365Z",
    "updatedAt": "2026-06-05T13:53:54.365Z",
    "__v": 0
  },
  "message": "Active ride fetched"
}
```

## 4. POST /rides/end

```json
{
  "success": true,
  "data": {
    "_id": "6a22d4f24724aef53fd9ddbf",
    "userId": "6a22d45d3829a6f9581c25cd",
    "scooterId": "6a22a32cb773af37e6f157d3",
    "iotScooterId": "c2000000-0000-0000-0000-000000000002",
    "status": "COMPLETED",
    "startTime": "2026-06-05T13:53:54.355Z",
    "endTime": "2026-06-05T13:55:00.591Z",
    "durationSeconds": 66,
    "distanceKm": null,
    "cost": 0.5,
    "fromLabel": null,
    "toLabel": null,
    "createdAt": "2026-06-05T13:53:54.365Z",
    "updatedAt": "2026-06-05T13:55:00.592Z",
    "__v": 0
  },
  "message": "Ride ended successfully"
}
```

## 5. GET /user/me

```json
{
  "success": true,
  "data": {
    "id": "MOVEET-8985",
    "firstName": "Test",
    "lastName": "Bypass",
    "email": "bypass@example.com",
    "phone": "8888888888",
    "kycStatus": "NOT_STARTED",
    "walletBalance": 199.5,
    "activePlanId": null,
    "planExpiryDate": null,
    "autoRenew": false,
    "notifications": []
  },
  "message": "Profile retrieved successfully"
}
```

## 6. GET /rides/history

```json
{
  "success": true,
  "data": [
    {
      "_id": "6a22d4f24724aef53fd9ddbf",
      "userId": "6a22d45d3829a6f9581c25cd",
      "scooterId": {
        "pricing": {
          "minutely": 0.25,
          "daily": 150
        },
        "location": {
          "type": "Point",
          "coordinates": [
            77.23,
            28.015
          ]
        },
        "_id": "6a22a32cb773af37e6f157d3",
        "iotId": "c2000000-0000-0000-0000-000000000002",
        "__v": 0,
        "assignedUserId": null,
        "battery": 100,
        "code": "S-102",
        "createdAt": "2026-06-05T10:21:32.890Z",
        "isLocked": true,
        "lastHeartbeat": "2026-06-05T13:54:55.732Z",
        "latitude": 28.015,
        "longitude": 77.23,
        "model": "Moveet Pro X",
        "odometer": 89.2,
        "rangeKm": 45,
        "signalStrength": 62,
        "speed": 0,
        "status": "AVAILABLE",
        "updatedAt": "2026-06-05T13:55:00.671Z"
      },
      "iotScooterId": "c2000000-0000-0000-0000-000000000002",
      "status": "COMPLETED",
      "startTime": "2026-06-05T13:53:54.355Z",
      "endTime": "2026-06-05T13:55:00.591Z",
      "durationSeconds": 66,
      "distanceKm": null,
      "cost": 0.5,
      "fromLabel": null,
      "toLabel": null,
      "createdAt": "2026-06-05T13:53:54.365Z",
      "updatedAt": "2026-06-05T13:55:00.592Z",
      "__v": 0
    }
  ],
  "message": "Ride history fetched"
}
```

