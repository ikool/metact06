#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging, json
from google.appengine.api import users
from flask import Flask, render_template, request, redirect, jsonify
from google.appengine.ext import ndb
from functools import wraps
import os


app = Flask(__name__)
app.jinja_env.line_statement_prefix = '#'

DEFAULT_COMMENTS_NAME = 'default_comments'

class Product(ndb.Model):
	name = ndb.StringProperty()
	price = ndb.IntegerProperty()

# def comments_key(comments_name=DEFAULT_COMMENTS_NAME):

#     return ndb.Key('Comments', comments_name)
class Index(ndb.Model):
    pass

INDEX = Index.get_or_insert("index")
class Customer(ndb.Model):
    """Sub model for representing an author."""
    identity = ndb.StringProperty()
    email = ndb.StringProperty()
	

class Comments(ndb.Model):
	value = ndb.StringProperty()
#	author = ndb.KeyProperty(kind=Customer)
	date = ndb.DateTimeProperty(auto_now=True)
	safe = ndb.StringProperty()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user = users.get_current_user()
        if not current_user:
            logging.info("*****[OK] VISITOR IS REQUESTED TO SIGN-IN WITH HIS GOOGLE ACCOUNT")
            return redirect(users.create_login_url("/"))

        elif not Customer.query(ancestor=INDEX.key).filter(Customer.email == current_user.email()).get() :
            logging.info("*****[OK] RECORD NEW USER [%s] IN THE DATABASE", current_user.email())
            Customer(parent = INDEX.key,email=current_user.email()).put()

        return f(*args, **kwargs)
    return decorated_function	
def get_current_customer():
    return Customer.query(ancestor = INDEX.key).filter(Customer.email==users.get_current_user().email()).get()

def encode_keys(entities):
    return [dict(e.to_dict(), **dict(key=e.key.urlsafe())) for e in entities]

def encode_key(entity):
    return encode_keys([entity])[0]
	
@app.route('/', methods=['GET'])
def index():

	user        = users.get_current_user()
	login_url   = users.create_login_url('/')
	logout_url  = users.create_logout_url('/')

#	toto = "bonjour"
	posts = Comments.query(ancestor=INDEX.key).fetch()
#	logging.info(posts)

	
	customers = [ post.key.parent().get() for post in posts ]


	return render_template('index.html', **locals())



@app.route('/profile/comment', methods=['POST'])
@login_required
def add_comment():

	logging.info("-> /comment/profile")
	logging.info(request.get_data())
#	logging.info(request.get_json())
	
#	logging.info(request.form['jsondata'])

	# for key, value in request.form.comment.iteritems():
	# 	logging.info("request")
	# 	logging.info(request.form.iteritems())
	# 	logging.info(key)
	# 	logging.info(value)
	post = Comments(parent=get_current_customer().key,value = request.data)
	#logging.info(post)
	post.put()
	#logging.info(post.key)
	post.safe = post.key.urlsafe()
	post.put()
	logging.info("/comment/profile ->")
	current_customer = get_current_customer()
	posts_user = Comments.query(ancestor = current_customer.key).fetch()
#	logging.info(request.form)

	return jsonify(Result='OK', Records=encode_key(post))
	#	return redirect('/')

@app.route('/profile', methods=['GET'])
@login_required
def user_profile():
	
	user        = users.get_current_user()
	is_admin    = users.is_current_user_admin()
	login_url   = users.create_login_url(request.path)
	logout_url  = users.create_logout_url(request.path)

	current_customer = get_current_customer()
#	customers = [ post.key.parent().get() for post in posts ]

	return render_template('profile.html', **locals())

@app.route('/profile/comment', methods=['GET'])
def list_comments():


	
	current_customer = get_current_customer()
#	customers = [ post.key.parent().get() for post in posts ]
	posts_user = Comments.query(ancestor = current_customer.key).fetch()
	posts_safe = [ post.key.urlsafe() for post in posts_user]
#	logging.info(posts_user)
	
	return jsonify(Result='OK', Records=encode_keys(posts_user))
		


#	return render_template('profile.html', **locals())

@app.route('/profile/comment/<safekey>', methods=['GET'])
@login_required
def get_comment(safekey):
#	logging.info("safekey")
#	logging.info(safekey)

	current_customer = get_current_customer()
	logging.info("safekey>1")

	post = Comments()
	post.Key = ndb.Key(urlsafe=safekey)
	#	post.Key = ndb.Key(str(safekey))


	post_modified = post.Key.get()

#	post_modified = safekey
#	post_modified.key = safekey
#	return render_template('comment.html', **locals())
	return jsonify(Result="OK", Records=encode_key(post_modified))

@app.route('/profile/comment/<safekey>', methods=['POST'])
@login_required
def put_comment(safekey):
	logging.info("-> /profile/comment/<safekey>")
	logging.info(request.get_data())
	message = request.form["comment"]
	post = Comments()
	post = ndb.Key(urlsafe=safekey).get()
	
	logging.info(safekey)
	post.value = message

	post.put()
	return redirect('/profile')

@app.route('/profile/comment/<safekey>', methods=['DELETE'])
@login_required
def delete_comment(safekey):
	logging.info("TOC")
	post = Comments()
	post.Key = ndb.Key(urlsafe=safekey)
	post.Key.delete()
#	return redirect('/profile')
	return jsonify(Result='OK')

@app.route('/profile/comment/<safekey>', methods=['PUT'])
def modif_comment(safekey):
	logging.info("method PUT")
	logging.info(request.data)
#	logging.info(request.form['key'])
	current_customer = get_current_customer()
	post = Comments()
	post = ndb.Key(urlsafe=safekey).get()
	post.value = request.data
	post.put()
	return jsonify(Result="OK")
#     