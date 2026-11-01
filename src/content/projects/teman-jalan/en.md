## Overview

Teman Jalan is an IoT smart cane for visually impaired people, built for a thesis by a team of three: the mobile app, the cane firmware, and the backend. My part was the backend: taking in data from the cane, recording each trip, and keeping companions (family or caregivers) informed through their app.

The public repository is a demonstration version; some internal components and configuration are left out on purpose.

## Architecture

```flow
Smart cane (sensors + GPS) -> MQTT broker -> *Express backend -> Redis (live session)
Express backend -> MySQL (history)
Express backend -> FCM + Socket.IO (emergency, status) -> Companion app
```

A single Node.js process runs both the Express REST API and the MQTT consumer. The code is grouped by feature (auth, stick, user), each with route, handler, service, and validator layers. Redis holds what is happening right now and short-lived data, while MySQL is the permanent record.

## From the cane to the backend

The cane sends four kinds of MQTT messages: sensor data, status (online or offline), emergency, and battery. The cane's ID is read from the topic.

- **Sensor data** is stored in MySQL and tagged with a hazard marker by a threshold rule: "obstacle" when the ultrasonic distance is below 50, "puddle" when the water sensor detects water. GPS fixes at (0,0) are dropped.
- **Emergencies** trigger push notifications through FCM to every device of every companion watching that cane, found with a single SQL join between the watchlist and the device tokens. Turning the cane on or off sends a notification too.
- **Two-way communication:** a companion answers an SOS with "pick up" or "decline" in the app, and the backend relays it to the cane on an MQTT `callback` topic.

## Trip sessions

```flow
Cane online -> *Session in Redis (distance, hazards, time) -> Cane offline -> MySQL (session)
```

During a trip, each GPS point only triggers cheap Redis operations: the distance grows by a hand-written Haversine formula, and the counts of obstacles, puddles, and active time go up. When the cane goes offline, the totals are written to MySQL once and the Redis keys are cleared.

The history endpoint combines both: today's totals from MySQL plus the session still running in Redis, so the numbers stay current in the middle of a walk.

## For the companion app

- Live cane status over Socket.IO, with a JWT checked at the handshake.
- Current status, today's history, distance statistics per day over a date range, and the route of a single session with its hazard markers.
- A watchlist per companion and the 25 most recent notifications.
- Authentication: passwords hashed with bcrypt, a one-day JWT access token, and a seven-day refresh token stored in the database so it can be revoked on logout. Password reset uses an email OTP kept in Redis for 10 minutes and limited to 5 attempts per 10 minutes. Input is validated with Joi.
- Profile photos are cropped to a 500x500 JPEG with Sharp.
