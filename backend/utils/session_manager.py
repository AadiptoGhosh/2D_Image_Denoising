"""
Session Manager for Temporary In-Memory State
Manages uploaded images, noisy states, and experimental results per session ID.
"""

import time
import uuid
import numpy as np
from typing import Dict, Any, Optional


class SessionData:
    def __init__(self, session_id: str, original_image: np.ndarray, filename: str = "image.png"):
        self.session_id: str = session_id
        self.filename: str = filename
        self.original_image: np.ndarray = original_image
        self.noisy_image: np.ndarray = original_image.copy()
        self.last_filtered_image: Optional[np.ndarray] = None
        self.noise_metadata: Dict[str, Any] = {"type": "none"}
        self.filter_history: list = []
        self.last_accessed: float = time.time()

    def update_access(self):
        self.last_accessed = time.time()


class SessionManager:
    def __init__(self, max_sessions: int = 50, ttl_seconds: float = 7200.0):
        self.sessions: Dict[str, SessionData] = {}
        self.max_sessions = max_sessions
        self.ttl_seconds = ttl_seconds

    def cleanup_expired(self):
        now = time.time()
        expired_keys = [
            sid for sid, s in self.sessions.items()
            if now - s.last_accessed > self.ttl_seconds
        ]
        for sid in expired_keys:
            del self.sessions[sid]

        # If still over limit, drop oldest
        if len(self.sessions) > self.max_sessions:
            sorted_sids = sorted(self.sessions.keys(), key=lambda sid: self.sessions[sid].last_accessed)
            for sid in sorted_sids[:len(self.sessions) - self.max_sessions]:
                del self.sessions[sid]

    def create_session(self, image: np.ndarray, filename: str = "image.png") -> str:
        self.cleanup_expired()
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = SessionData(session_id, image, filename)
        return session_id

    def get_session(self, session_id: str) -> Optional[SessionData]:
        session = self.sessions.get(session_id)
        if session:
            session.update_access()
        return session

    def reset_to_original(self, session_id: str) -> bool:
        session = self.get_session(session_id)
        if not session:
            return False
        session.noisy_image = session.original_image.copy()
        session.last_filtered_image = None
        session.noise_metadata = {"type": "none"}
        session.filter_history.clear()
        return True


# Global session manager instance
session_manager = SessionManager()
