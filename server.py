from flask import Flask, render_template

import json

from scraper import Scraper

app = Flask(__name__)

@app.route('/')
def index():
    scraper = Scraper()
    scraper.perform_request()
    return render_template("index.html", data=json.dumps(scraper.parse_table()))
