# Software Deployment System

A system for managing software deployments to client machines, consisting of a Django backend API, React frontend dashboard, and Python client script.

## Project Structure
- `backend/` - Django REST API
- `frontend/` - React dashboard
- `client/` - Python client script

## Setup Instructions

### Backend Setup
1. Create and activate a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables in `.env`:
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/deployment_db
REDIS_URL=redis://localhost:6379/0
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Start the development server:
```bash
python manage.py runserver
```

### Frontend Setup
1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

### Client Setup
1. Create and activate a virtual environment:
```bash
cd client
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure client settings in `config.ini`

4. Run the client:
```bash
python client.py
```

## Requirements
- Python 3.8+
- Node.js 18+
- PostgreSQL
- Redis 