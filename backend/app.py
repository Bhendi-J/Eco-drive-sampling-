"""
EcoDrive Arena Backend API
Modular Flask application with ML-powered scoring and recommendations
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import traceback

# Import services
from model_loader import get_model_loader
from scoring_service import get_scoring_service
from recommendation_service import get_recommendation_service

app = Flask(__name__)
CORS(app)

# In-memory storage (in production, use a proper database)
game_sessions = []
leaderboard = []

# Load ML model at startup
print("🌿 EcoDrive Arena Backend Server")
print("📊 Loading ML model...")
try:
    model_loader = get_model_loader()
    model_loader.load_model('eco_driving_score.csv')
    print("✓ Model loaded successfully")
except Exception as e:
    print(f"✗ Failed to load model: {e}")
    raise

# Get service instances
scoring_service = get_scoring_service()
recommendation_service = get_recommendation_service()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": model_loader.model is not None,
        "features": model_loader.feature_names
    })

@app.route('/get_score', methods=['POST'])
def get_score():
    """
    Calculate eco score based on real-time game telemetry
    
    Request body:
        {
            "rpm_var": 1500,
            "braking_hits": 2,
            "fuel_usage": 7.5,
            "smoothness_val": 0.85
        }
    """
    try:
        data = request.json
        result = scoring_service.predict_eco_score(data)
        
        return jsonify({
            "eco_score": result["eco_score"],
            "status": result["status"],
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in get_score: {e}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_session', methods=['POST'])
def analyze_session():
    """
    Analyze a complete game session and generate AI recommendations
    
    Request body:
        {
            "total_rpm_variation": 15000,
            "total_braking_events": 5,
            "total_fuel_consumed": 45.5,
            "total_lane_switches": 12,
            "distance_traveled": 250,
            "duration": 180
        }
    """
    try:
        session_metrics = request.json
        
        # Analyze session
        analysis = scoring_service.analyze_full_session(session_metrics)
        
        # Generate recommendations
        recommendations = recommendation_service.generate_recommendations(
            session_metrics,
            analysis
        )
        
        # Generate summary
        summary = recommendation_service.generate_session_summary(
            session_metrics,
            analysis
        )
        
        return jsonify({
            "success": True,
            "analysis": analysis,
            "recommendations": recommendations,
            "summary": summary,
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in analyze_session: {e}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/save_session', methods=['POST'])
def save_session():
    """Save a completed game session"""
    try:
        session_data = request.json
        
        session = {
            "id": len(game_sessions) + 1,
            "mode": session_data.get('mode', 'highway'),
            "final_score": session_data.get('final_score', 0),
            "duration": session_data.get('duration', 0),
            "fuel_remaining": session_data.get('fuel_remaining', 0),
            "collisions": session_data.get('collisions', 0),
            "player_name": session_data.get('player_name', 'Anonymous'),
            "timestamp": datetime.now().isoformat()
        }
        
        game_sessions.append(session)
        update_leaderboard(session)
        
        return jsonify({
            "success": True,
            "session_id": session["id"],
            "message": "Session saved successfully"
        })
    
    except Exception as e:
        print(f"Error in save_session: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get top scores leaderboard"""
    try:
        mode = request.args.get('mode', 'all')
        limit = int(request.args.get('limit', 10))
        
        filtered_board = leaderboard
        if mode != 'all':
            filtered_board = [entry for entry in leaderboard if entry['mode'] == mode]
        
        # Sort by score descending
        sorted_board = sorted(filtered_board, key=lambda x: x['score'], reverse=True)[:limit]
        
        return jsonify({
            "leaderboard": sorted_board,
            "count": len(sorted_board)
        })
    
    except Exception as e:
        print(f"Error in get_leaderboard: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get overall game statistics"""
    try:
        if not game_sessions:
            return jsonify({
                "total_sessions": 0,
                "average_score": 0,
                "best_score": 0,
                "total_playtime": 0
            })
        
        total_sessions = len(game_sessions)
        scores = [s['final_score'] for s in game_sessions]
        durations = [s['duration'] for s in game_sessions]
        
        return jsonify({
            "total_sessions": total_sessions,
            "average_score": round(sum(scores) / len(scores), 1),
            "best_score": max(scores),
            "total_playtime": sum(durations),
            "city_sessions": len([s for s in game_sessions if s['mode'] == 'city']),
            "highway_sessions": len([s for s in game_sessions if s['mode'] == 'highway']),
            "jungle_sessions": len([s for s in game_sessions if s['mode'] == 'jungle'])
        })
    
    except Exception as e:
        print(f"Error in get_stats: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/player_stats', methods=['GET'])
def get_player_stats():
    """Get stats for a specific player"""
    try:
        player_name = request.args.get('name', 'Anonymous')
        
        player_sessions = [s for s in game_sessions if s['player_name'] == player_name]
        
        if not player_sessions:
            return jsonify({
                "player_name": player_name,
                "sessions": 0,
                "message": "No sessions found for this player"
            })
        
        scores = [s['final_score'] for s in player_sessions]
        
        return jsonify({
            "player_name": player_name,
            "total_sessions": len(player_sessions),
            "average_score": round(sum(scores) / len(scores), 1),
            "best_score": max(scores),
            "recent_sessions": player_sessions[-5:]  # Last 5 sessions
        })
    
    except Exception as e:
        print(f"Error in get_player_stats: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/recent_sessions', methods=['GET'])
def get_recent_sessions():
    """Get recent game sessions"""
    try:
        limit = int(request.args.get('limit', 10))
        return jsonify({
            "sessions": game_sessions[-limit:][::-1],  # Reverse to show most recent first
            "count": len(game_sessions[-limit:])
        })
    
    except Exception as e:
        print(f"Error in get_recent_sessions: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/feature_importance', methods=['GET'])
def get_feature_importance():
    """Get ML model feature importance"""
    try:
        importance = model_loader.get_feature_importance()
        return jsonify({
            "feature_importance": importance,
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in get_feature_importance: {e}")
        return jsonify({"error": str(e)}), 500

def update_leaderboard(session):
    """Update the leaderboard with a new session"""
    entry = {
        "player_name": session['player_name'],
        "score": session['final_score'],
        "mode": session['mode'],
        "timestamp": session['timestamp']
    }
    
    leaderboard.append(entry)
    
    # Keep only top 100 entries
    leaderboard.sort(key=lambda x: x['score'], reverse=True)
    if len(leaderboard) > 100:
        del leaderboard[100:]

if __name__ == '__main__':
    feature_importance = model_loader.get_feature_importance()
    print(f"🎮 Feature Importance:")
    for feature, importance in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {feature}: {importance:.3f}")
    print("🚀 Server starting on http://localhost:5000")
    app.run(port=5000, debug=True)