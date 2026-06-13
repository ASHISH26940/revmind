from fastapi import APIRouter
from app.database import get_db

router = APIRouter()


@router.get("/api/summary")
def get_summary():
    db = get_db()

    kpi = db.execute("""
        SELECT
            SUM(net_revenue_usd) AS total_revenue,
            SUM(units_sold) AS total_units,
            ROUND(SUM(gross_profit_usd) / SUM(net_revenue_usd) * 100, 2) AS profit_margin_pct
        FROM sales
    """).fetchone()

    top_region = db.execute("""
        SELECT region, SUM(net_revenue_usd) AS revenue
        FROM sales GROUP BY region ORDER BY revenue DESC LIMIT 1
    """).fetchone()

    top_channel = db.execute("""
        SELECT channel, SUM(net_revenue_usd) AS revenue
        FROM sales GROUP BY channel ORDER BY revenue DESC LIMIT 1
    """).fetchone()

    top_product = db.execute("""
        SELECT product_name, SUM(net_revenue_usd) AS revenue
        FROM sales GROUP BY product_name ORDER BY revenue DESC LIMIT 1
    """).fetchone()

    category_breakdown = [dict(r) for r in db.execute("""
        SELECT category, ROUND(SUM(net_revenue_usd), 2) AS revenue
        FROM sales GROUP BY category ORDER BY revenue DESC
    """).fetchall()]

    db.close()

    return {
        "data": {
            "total_revenue": round(kpi["total_revenue"], 2),
            "total_units": kpi["total_units"],
            "profit_margin_pct": kpi["profit_margin_pct"],
            "top_region": dict(top_region),
            "top_channel": dict(top_channel),
            "top_product": dict(top_product),
            "category_breakdown": category_breakdown,
        },
        "status": "ok",
    }
