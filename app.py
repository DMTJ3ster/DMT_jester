import os
from flask import Flask, render_template

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dmt-jester-experience-secret-key")

@app.route('/')
def index():
    """Main page with overview and navigation"""
    return render_template('index.html')

@app.route('/story')
def story():
    """The story begins section"""
    return render_template('story.html')

@app.route('/encounter')
def encounter():
    """The jester encounter section"""
    return render_template('encounter.html')

@app.route('/archetype')
def archetype():
    """The jester archetype section"""
    return render_template('archetype.html')

@app.route('/synchronicities')
def synchronicities():
    """Synchronicities in waking life section"""
    return render_template('synchronicities.html')

@app.route('/interpretations')
def interpretations():
    """Possible interpretations section"""
    return render_template('interpretations.html')

@app.route('/animals')
def animals():
    """Animal messengers section"""
    return render_template('animals.html')

@app.route('/childhood')
def childhood():
    """Childhood encounter section"""
    return render_template('childhood.html')

@app.route('/rituals')
def rituals():
    """Rituals and practices section"""
    return render_template('rituals.html')

@app.route('/numerology')
def numerology():
    """666 numerology section"""
    return render_template('numerology.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
