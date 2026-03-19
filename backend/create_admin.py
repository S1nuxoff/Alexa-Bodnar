"""
Запуск: python create_admin.py
Создаёт первого админ-пользователя
"""
import asyncio
from sqlalchemy import select
from app.database import engine, Base, AsyncSessionLocal
from app.models.admin import AdminUser
from app.core.security import hash_password


async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    email = input("Email: ")
    password = input("Password: ")

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(AdminUser).where(AdminUser.email == email))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"Пользователь {email} уже существует")
        else:
            user = AdminUser(email=email, hashed_password=hash_password(password))
            db.add(user)
            await db.commit()
            print(f"✓ Админ {email} создан")


asyncio.run(main())
