from fastapi import APIRouter
from app.database import get_db

router = APIRouter()


@router.get("/api/trends")
def get_trends():
    db = get_db()
    rows = db.execute("""
        SELECT month, SUM(net_revenue_usd) AS revenue
        FROM sales
        GROUP BY month
        ORDER BY month
    """).fetchall()
    db.close()
    return {"data": [dict(r) for r in rows], "status": "ok"}
