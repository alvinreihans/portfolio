## Overview

A Flask API that serves an image classification model from MBKM research. The model recognises which part of the plant *Micromelum minutum* is in a photo: the stem, a leaf, or a twig.

## How it works

```flow
Client -> *Flask /predict -> Preprocess (224x224, /255) -> Keras model (HDF5) -> JSON label
```

1. The client sends a JPG or PNG photo to `POST /predict` as the `file` field. A request without a file gets an error message.
2. The photo is saved temporarily, resized to 224x224, and its pixel values are divided by 255.
3. The Keras model (HDF5 format), loaded once when the app starts, predicts the image. The class with the highest score is returned as JSON.
4. The temporary file is deleted after the prediction, so no images are kept.

## Deployment

In production, the app runs under gunicorn on port 8080. The README includes a deployment guide for Google Compute Engine: a VM with a static IP, a firewall rule for port 8080, and a systemd service running gunicorn with three workers.
