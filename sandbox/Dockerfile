FROM python:3.11-slim

WORKDIR /workspace

RUN apt-get update && apt-get install -y --no-install-recommends patch && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir pytest

COPY . /workspace

CMD ["python", "/workspace/sandbox/runner.py"]