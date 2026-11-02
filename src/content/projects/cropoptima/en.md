## Overview

CropOptima is a Bangkit Academy 2023 capstone built by a team of seven across three paths: Machine Learning, Cloud Computing, and Mobile Development. The app suggests one of 22 crops based on soil nutrients (nitrogen, phosphorus, potassium, and pH) and the user's location. I was in the Cloud Computing path and wrote all of its cloud backend code.

## Architecture

```flow
Client -> *Main API (App Engine) -> Firebase Auth (idToken check)
Main API -> Model API (Docker) -> OpenWeatherMap (temperature, humidity)
Main API -> Cloud SQL (history)
Model API -> LightGBM (22 crops)
```

The backend is two Flask services, kept apart on purpose: one as the gateway, one only for the model.

- **The main API on Google App Engine** is the public entry point. It verifies the Firebase idToken through the Identity Toolkit REST API, forwards the request to the model API, and stores the prediction history in Cloud SQL (MySQL) over the `/cloudsql` unix socket with parameterised queries. Signed-in users can read their history back.
- **The model API in a Docker container** looks up the temperature, humidity, and city name from OpenWeatherMap by coordinates, adds rainfall from a monthly table, and runs the LightGBM model made by the Machine Learning team. The result comes with a crop description in Indonesian and an image from Cloud Storage.

Both services answer in the same response format, and the database settings come from environment variables.

## Model

The Machine Learning team compared four models and chose LightGBM at 98.9% accuracy, against a decision tree (98.4%), logistic regression (94.5%), and a Keras neural network (96.0%).
