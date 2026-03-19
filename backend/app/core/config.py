from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FRONTEND_URL: str = "http://localhost:3000"
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""
    SMTP_EMAIL: str = ""
    SMTP_PASSWORD: str = ""
    RABBITMQ_URL: str = "amqp://admin:admin123@188.137.181.63:5672/"
    PUBLIC_BASE_URL: str = ""  # e.g. https://alexabodnar.com — used for image URLs in emails

    class Config:
        env_file = ".env"


settings = Settings()
