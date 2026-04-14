from fastapi.testclient import TestClient

from backend.main import app


def main() -> None:
  client = TestClient(app)
  resp = client.post(
      "/auth/login",
      data={"username": "admin", "password": "admin"},
      headers={"Content-Type": "application/x-www-form-urlencoded"},
  )
  print("status", resp.status_code)
  print("body", resp.text)


if __name__ == "__main__":
  main()

