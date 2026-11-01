Teman Jalan ("walking companion") is an IoT smart cane for visually impaired users, and I built its backend for my undergraduate thesis. The cane sends sensor and GPS data every 5 seconds, so the backend has to take in a constant stream without falling behind.

```flow
IoT cane (every 5s) -> MQTT broker -> *Express API -> Redis (live state)
Express API -> MySQL (history)
Express API -> FCM (push)
```

Data arrives over MQTT, is validated, and then processed: trip sessions are recorded, distance is calculated with the Haversine formula, and hazards such as obstacles or standing water are detected. The live state sits in Redis for fast reads, the history in MySQL, and emergencies trigger push notifications to companions through FCM. The backend runs on AWS EC2 with Amazon RDS.

The public repository is a demonstration version; some internal components and configuration are intentionally left out.
