from flask import Flask, render_template, jsonify, request, make_response, redirect, url_for
import datetime
from model import run_model

app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    token = request.cookies.get('token')
    if not token:
        return render_template("login.html")
    return render_template("index.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")
    if request.form['token'] == "risk":
        resp = make_response(redirect(url_for("index")))
        expire_date = datetime.datetime.now()
        expire_date = expire_date + datetime.timedelta(days=7)
        resp.set_cookie('token', 'Success', expires=expire_date)
        return resp
    return redirect(url_for("index"))

@app.route("/estimate", methods=["POST"])
def estimate():
    data = request.get_json()
    result = run_model(data["data"])
    return jsonify(data=result)

if __name__ == "__main__":
    app.run(host="172.30.31.152")
