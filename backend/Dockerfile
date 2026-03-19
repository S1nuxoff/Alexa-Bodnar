FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Keep a seed copy of uploads so they can be copied into the volume on first start
RUN cp -r /app/uploads /app/uploads_seed

COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 8000

CMD ["sleep", "infinity"]
