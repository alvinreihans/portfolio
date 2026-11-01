During MBKM research and an internship at Gita Persada Butterfly Park, I applied the cloud skills from Bangkit to serve a plant classification machine learning model. The CNN model (stored as HDF5) is wrapped in a Flask RESTful API: send a plant photo to the `/predict` endpoint and the API returns its classification.

```flow
Plant photo -> *Flask API (/predict) -> CNN model (HDF5) -> Classification
Flask API -> Cloud SQL
Flask API -> Cloud Storage (images)
```

The API is deployed on Google Compute Engine, with Cloud SQL as the main database and Cloud Storage for media. The research was published in three papers, listed on my ORCID profile.
