
import os
from motor.motor_asyncio import AsyncIOMotorClient

class DatabaseProxy:
    def __init__(self):
        self._client = None
        self._db = None

    async def connect(self):
        mongo_url = os.environ.get('MONGO_URL')
        db_name = os.environ.get('DB_NAME')
        if not mongo_url:
            raise RuntimeError("MONGO_URL environment variable is required but not set")
        if not db_name:
            raise RuntimeError("DB_NAME environment variable is required but not set")
        # mongodb+srv:// URLs auto-enable TLS; only override if MONGO_TLS is explicitly set
        tls_env = os.environ.get('MONGO_TLS')
        connect_kwargs = {}
        if tls_env is not None:
            connect_kwargs['tls'] = tls_env.lower() in ('1', 'true', 'yes')
        self._client = AsyncIOMotorClient(mongo_url, **connect_kwargs)
        self._db = self._client[db_name]
        # Verify connection
        await self._db.command("ping")
        return self._db

    async def close(self):
        if self._client:
            self._client.close()

    def __getattr__(self, name):
        if self._db is None:
             raise AttributeError("Database not initialized")
        return getattr(self._db, name)
    
    # Allow dict-style access (e.g. db['users'])
    def __getitem__(self, name):
        if self._db is None:
             raise AttributeError("Database not initialized")
        return self._db[name]

# Global database instance
db = DatabaseProxy()
