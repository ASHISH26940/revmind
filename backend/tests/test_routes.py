def test_products_returns_200_and_list(client):
    resp = client.get("/api/products")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert isinstance(body["data"], list)
    assert len(body["data"]) > 0

    product = body["data"][0]
    assert "sku" in product
    assert "product_name" in product
    assert "total_units" in product
    assert "total_revenue" in product


def test_products_sorted_by_revenue_desc(client):
    resp = client.get("/api/products")
    products = resp.json()["data"]
    revenues = [p["total_revenue"] for p in products]
    assert revenues == sorted(revenues, reverse=True)


def test_summary_returns_all_kpis(client):
    resp = client.get("/api/summary")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    data = body["data"]

    assert "total_revenue" in data
    assert "total_units" in data
    assert "profit_margin_pct" in data
    assert data["total_revenue"] > 0
    assert data["total_units"] > 0
    assert data["profit_margin_pct"] > 0


def test_summary_returns_top_region(client):
    resp = client.get("/api/summary")
    data = resp.json()["data"]
    assert "top_region" in data
    assert "region" in data["top_region"]
    assert "revenue" in data["top_region"]


def test_summary_returns_top_channel(client):
    resp = client.get("/api/summary")
    data = resp.json()["data"]
    assert "top_channel" in data
    assert "channel" in data["top_channel"]


def test_summary_returns_top_product(client):
    resp = client.get("/api/summary")
    data = resp.json()["data"]
    assert "top_product" in data
    assert "product_name" in data["top_product"]


def test_summary_returns_category_breakdown(client):
    resp = client.get("/api/summary")
    data = resp.json()["data"]
    assert "category_breakdown" in data
    assert len(data["category_breakdown"]) > 0
    for cat in data["category_breakdown"]:
        assert "category" in cat
        assert "revenue" in cat


def test_summary_returns_yoy_trends(client):
    resp = client.get("/api/summary")
    data = resp.json()["data"]
    assert "trends" in data
    assert "revenue_change_pct" in data["trends"]
    assert "margin_change_pct" in data["trends"]


def test_trends_returns_200_and_list(client):
    resp = client.get("/api/trends")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert isinstance(body["data"], list)
    assert len(body["data"]) > 0


def test_trends_chronological(client):
    resp = client.get("/api/trends")
    months = [d["month"] for d in resp.json()["data"]]
    assert months == sorted(months), "Trends not sorted chronologically"


def test_trends_has_month_and_revenue(client):
    resp = client.get("/api/trends")
    entry = resp.json()["data"][0]
    assert "month" in entry
    assert "revenue" in entry
    assert entry["revenue"] > 0


def test_chat_requires_question(client):
    resp = client.post("/api/chat", json={})
    assert resp.status_code == 422


def test_chat_returns_streaming_response(client):
    resp = client.post("/api/chat", json={"question": "hello"})
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "text/event-stream; charset=utf-8" or \
           resp.headers["content-type"] == "text/event-stream"
