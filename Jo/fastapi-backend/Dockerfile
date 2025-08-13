# Step 1 : Base Images
FROM python:3.10-slim

# Step 2 : Package Install
RUN apt -y update; apt -y upgrade; apt -y install vim git net-tools

# Step 3 : Specify a Working directory
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "dbload:app", "--host", "0.0.0.0", "--port", "8080"]