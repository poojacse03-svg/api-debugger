from backend.app.db.database import Base, engine
from backend.app.models.incident import Incident


def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")


if __name__ == "__main__":
    init_db()