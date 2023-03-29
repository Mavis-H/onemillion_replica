import flask
import os
app = flask.Flask(__name__)
psql_username = os.environ['PSQL_USERNAME']
psql_password = os.environ['PSQL_PASSWORD']
psql_uri = "postgresql://" + psql_username + ":" + psql_password + "@localhost/one_billion_db"
app.config["SQLALCHEMY_DATABASE_URI"] = psql_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'demo_secrets'