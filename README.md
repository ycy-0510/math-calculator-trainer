# Math Calculator Trainer

A web application for practicing and improving your math calculation skills.

## Features

- Interactive math exercises
- Progress tracking
- Customizable difficulty levels

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

### Installation

1. Create a directory for the project and navigate into it:
   ```bash
   mkdir math-calculator-trainer
   cd math-calculator-trainer
   ```
2. Create a `docker-compose.yml` file with the following content:
   ```yaml
   version: '3.8'

   services:
     web:
       image: ycy10/math-calculator-trainer:latest
       ports:
         - "3000:80"
       restart: unless-stopped
   ```
3. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

### Stopping the Application

To stop the application, run:
```bash
docker-compose down
```

## License

This project is licensed under the MIT License.