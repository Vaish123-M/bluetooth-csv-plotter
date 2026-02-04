"""
Vercel Entry Point - Imports Flask app from backend
"""

from backend.app import app

# Export the Flask app for Vercel
if __name__ == "__main__":
    app.run(debug=False)
