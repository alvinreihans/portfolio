CropOptima was a Bangkit Academy 2023 capstone built by a team of seven across three paths: Machine Learning, Cloud Computing, and Mobile Development. Its Android app suggests crops based on your location and soil conditions such as nitrogen, phosphorus, and potassium, by calling a machine learning model through an API.

```flow
Android app -> *Backend API -> ML model (crop suggestion)
Backend API -> Cloud SQL
```

I was on the Cloud Computing path: building the backend service that connects the app to the model, and deploying it on Google Cloud with Compute Engine and Cloud SQL.
