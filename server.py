from flask import Flask, render_template, jsonify
app = Flask(__name__)

from model import run_model

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/estimate", methods=["POST", "GET"])
def estimate():
    data = [19, 29, 1372, 2499]
    result = run_model(data)
    return jsonify(data=result)

if __name__ == "__main__":
    app.run(host="172.30.31.152")
