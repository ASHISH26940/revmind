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

    # Year-over-year trends (2025 vs 2024)
    yoy = {}
    for year in ('2024', '2025'):
        row = db.execute("""
            SELECT
                SUM(net_revenue_usd) AS revenue,
                ROUND(SUM(gross_profit_usd) / SUM(net_revenue_usd) * 100, 2) AS margin
            FROM sales WHERE date >= ? AND date < ?
        """, (f"{year}-01-01", f"{int(year)+1}-01-01")).fetchone()
        yoy[year] = dict(row)

    revenue_change = ((yoy['2025']['revenue'] - yoy['2024']['revenue']) / yoy['2024']['revenue'] * 100) if yoy['2024']['revenue'] else 0
    margin_change = yoy['2025']['margin'] - yoy['2024']['margin'] if yoy['2024']['margin'] else 0

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
            "trends": {
                "revenue_change_pct": round(revenue_change, 1),
                "margin_change_pct": round(margin_change, 1),
            },
        },
        "status": "ok",
    }
