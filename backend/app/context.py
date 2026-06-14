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

    channel_compare = [dict(r) for r in db.execute("""
        SELECT channel, ROUND(SUM(net_revenue_usd), 2) AS revenue
        FROM sales WHERE channel IN ('E-Commerce', 'Modern Trade')
        GROUP BY channel
    """).fetchall()]

    db.close()

    def fmt_reps(reps): return ', '.join(f"{r['sales_rep']}({r['units']}u)" for r in reps)
    def fmt_margin(items): return ', '.join(f"{i['category']}:{i['margin']}%" for i in items)
    def fmt_region_q(items):
        groups = {}
        for i in items:
            groups.setdefault(i['region'], {})[i['quarter']] = f"${i['revenue']:,.0f}"
        return '; '.join(f"{r}: " + ', '.join(f"{q}={v}" for q, v in qs.items()) for r, qs in groups.items())

    return f"""
TABLE: sales (1000 rows, columns: date,region,channel,category,product,units,revenue,profit)
REVENUE: ${overview['total_revenue']:,.0f} | UNITS: {overview['total_units']:,} | MARGIN: {overview['profit_margin']}%
REGIONS: {dict(top_region)}
CHANNELS: {dict(top_channel)}
TOP PRODUCTS: {', '.join(f"{p['product_name']}(${p['revenue']:,.0f})" for p in top_products)}
TOP REPS (all): {fmt_reps(top_reps)}
MARGIN BY CATEGORY: {fmt_margin(category_margin)}
REGION x QUARTER: {fmt_region_q(region_quarter)}
CHANNEL COMPARE: {', '.join(f"{c['channel']}=${c['revenue']:,.0f}" for c in channel_compare)}
"""
