"""
Session Manager for Temporary In-Memory & Disk-Backed State
Manages uploaded images, noisy states, and experimental results per session ID.
Persists sessions to disk so states survive across warm serverless lambdas or multi-worker environments.
"""

import os
import time
import uuid
import json
import tempfile
import cv2
import numpy as np
from typing import Dict, Any, Optional

STORAGE_DIR = os.path.join(tempfile.gettempdir(), "dsp_sessions")
os.makedirs(STORAGE_DIR, exist_ok=True)


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

    def _get_paths(self, session_id: str):
        base = os.path.join(STORAGE_DIR, session_id)
        return {
            "meta": f"{base}_meta.json",
            "orig": f"{base}_orig.png",
            "noisy": f"{base}_noisy.png",
            "filtered": f"{base}_filtered.png",
        }

    def save_session(self, session: SessionData):
        session.update_access()
        try:
            paths = self._get_paths(session.session_id)
            cv2.imwrite(paths["orig"], session.original_image)
            cv2.imwrite(paths["noisy"], session.noisy_image)
            if session.last_filtered_image is not None:
                cv2.imwrite(paths["filtered"], session.last_filtered_image)
            elif os.path.exists(paths["filtered"]):
                try:
                    os.remove(paths["filtered"])
                except Exception:
                    pass

            meta = {
                "session_id": session.session_id,
                "filename": session.filename,
                "noise_metadata": session.noise_metadata,
                "filter_history": session.filter_history,
                "last_accessed": session.last_accessed,
                "has_filtered": session.last_filtered_image is not None,
            }
            with open(paths["meta"], "w", encoding="utf-8") as f:
                json.dump(meta, f)
        except Exception:
            # Non-fatal if disk write fails
            pass

    def _load_from_disk(self, session_id: str) -> Optional[SessionData]:
        paths = self._get_paths(session_id)
        if not os.path.exists(paths["meta"]) or not os.path.exists(paths["orig"]):
            return None
        try:
            with open(paths["meta"], "r", encoding="utf-8") as f:
                meta = json.load(f)

            orig = cv2.imread(paths["orig"], cv2.IMREAD_UNCHANGED)
            if orig is None:
                return None
            noisy = cv2.imread(paths["noisy"], cv2.IMREAD_UNCHANGED) if os.path.exists(paths["noisy"]) else orig.copy()
            filtered = cv2.imread(paths["filtered"], cv2.IMREAD_UNCHANGED) if meta.get("has_filtered") and os.path.exists(paths["filtered"]) else None

            session = SessionData(session_id, orig, meta.get("filename", "image.png"))
            session.noisy_image = noisy
            session.last_filtered_image = filtered
            session.noise_metadata = meta.get("noise_metadata", {"type": "none"})
            session.filter_history = meta.get("filter_history", [])
            session.last_accessed = meta.get("last_accessed", time.time())
            self.sessions[session_id] = session
            return session
        except Exception:
            return None

    def cleanup_expired(self):
        now = time.time()
        expired_keys = [
            sid for sid, s in self.sessions.items()
            if now - s.last_accessed > self.ttl_seconds
        ]
        for sid in expired_keys:
            del self.sessions[sid]
            paths = self._get_paths(sid)
            for p in paths.values():
                if os.path.exists(p):
                    try:
                        os.remove(p)
                    except Exception:
                        pass

        # If still over limit, drop oldest
        if len(self.sessions) > self.max_sessions:
            sorted_sids = sorted(self.sessions.keys(), key=lambda sid: self.sessions[sid].last_accessed)
            for sid in sorted_sids[:len(self.sessions) - self.max_sessions]:
                del self.sessions[sid]

    def create_session(self, image: np.ndarray, filename: str = "image.png") -> str:
        self.cleanup_expired()
        session_id = str(uuid.uuid4())
        session = SessionData(session_id, image, filename)
        self.sessions[session_id] = session
        self.save_session(session)
        return session_id

    def get_session(self, session_id: str) -> Optional[SessionData]:
        session = self.sessions.get(session_id)
        if not session:
            session = self._load_from_disk(session_id)
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
        self.save_session(session)
        return True


# Global session manager instance
session_manager = SessionManager()
