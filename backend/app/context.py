from app.database import get_db


def build_context() -> str:
    db = get_db()

    overview = dict(db.execute("""
        SELECT
            SUM(net_revenue_usd) AS total_revenue,
            SUM(units_sold) AS total_units,
            ROUND(SUM(gross_profit_usd) / SUM(net_revenue_usd) * 100, 2) AS profit_margin
        FROM sales
    """).fetchone())

    top_region = dict(db.execute("""
        SELECT region, ROUND(SUM(net_revenue_usd), 2) AS revenue
        FROM sales GROUP BY region ORDER BY revenue DESC
    """).fetchall())

    top_channel = dict(db.execute("""
        SELECT channel, ROUND(SUM(net_revenue_usd), 2) AS revenue
        FROM sales GROUP BY channel ORDER BY revenue DESC
    """).fetchall())

    top_products = [dict(r) for r in db.execute("""
        SELECT product_name, ROUND(SUM(net_revenue_usd), 2) AS revenue
        FROM sales GROUP BY product_name ORDER BY revenue DESC LIMIT 5
    """).fetchall()]

    top_reps = [dict(r) for r in db.execute("""
        SELECT sales_rep, SUM(units_sold) AS units
        FROM sales GROUP BY sales_rep ORDER BY units DESC LIMIT 5
    """).fetchall()]

    category_margin = [dict(r) for r in db.execute("""
        SELECT category,
               ROUND(SUM(gross_profit_usd) / SUM(net_revenue_usd) * 100, 2) AS margin
        FROM sales GROUP BY category ORDER BY margin DESC
    """).fetchall()]

    region_quarter = [dict(r) for r in db.execute("""
        SELECT region, quarter, ROUND(SUM(net_revenue_usd), 2) AS revenue
        FROM sales GROUP BY region, quarter ORDER BY region, quarter
    """).fetchall()]

    yearly_reps = [dict(r) for r in db.execute("""
        SELECT sales_rep, SUM(units_sold) AS units
        FROM sales WHERE date >= '2025-01-01' AND date < '2026-01-01'
        GROUP BY sales_rep ORDER BY units DESC LIMIT 5
    """).fetchall()]

    channel_compare = [dict(r) for r in db.execute("""
        SELECT channel, ROUND(SUM(net_revenue_usd), 2) AS revenue
        FROM sales WHERE channel IN ('E-Commerce', 'Modern Trade')
        GROUP BY channel
    """).fetchall()]

    west_products = [dict(r) for r in db.execute("""
        SELECT product_name, ROUND(SUM(net_revenue_usd), 2) AS revenue
        FROM sales WHERE region = 'West'
        GROUP BY product_name ORDER BY revenue DESC LIMIT 5
    """).fetchall()]

    db.close()

    return f"""
DATABASE OVERVIEW
- Table: sales (1000 rows)
- Columns: transaction_id, date, month, quarter, sku, product_name, category, subcategory, region, channel, sales_rep, units_sold, unit_price_usd, gross_revenue_usd, discount_pct, net_revenue_usd, cogs_usd, gross_profit_usd

GLOBAL KPIs
- Total net revenue: ${overview['total_revenue']:,.2f}
- Total units sold: {overview['total_units']:,}
- Gross profit margin: {overview['profit_margin']}%

REVENUE BY REGION: {top_region}

REVENUE BY CHANNEL: {top_channel}

TOP 5 PRODUCTS BY REVENUE: {top_products}

TOP 5 SALES REPS (all time, by units): {top_reps}

GROSS PROFIT MARGIN BY CATEGORY: {category_margin}

REVENUE BY REGION AND QUARTER: {region_quarter}

TOP 5 SALES REPS IN 2025 (by units): {yearly_reps}

E-COMMERCE vs MODERN TRADE REVENUE: {channel_compare}

TOP 5 PRODUCTS IN WEST REGION: {west_products}
"""
