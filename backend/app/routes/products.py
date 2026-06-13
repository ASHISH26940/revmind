from fastapi import APIRouter
from app.database import get_db

router = APIRouter()


@router.get("/api/products")
def list_products():
    db = get_db()
    rows = db.execute("""
        SELECT sku, product_name, category, subcategory,
               SUM(units_sold) AS total_units,
               SUM(net_revenue_usd) AS total_revenue
        FROM sales
        GROUP BY sku
        ORDER BY total_revenue DESC
    """).fetchall()
    db.close()
    return {"data": [dict(r) for r in rows], "status": "ok"}
