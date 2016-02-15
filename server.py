from flask import Flask, render_template, jsonify, request
app = Flask(__name__)

from model import run_model

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/estimate", methods=["POST"])
def estimate():
    data = request.get_json()
    result = run_model(data["data"])
    return jsonify(data=result)

@app.route("/estimate_csv", methods=["POST"])
def estimate_csv():
    #TODO file upload
    return jsonify(data=True)

if __name__ == "__main__":
    app.run(host="172.30.31.152")
