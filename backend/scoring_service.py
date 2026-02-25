"""
Scoring Service
Handles eco score prediction using the ML model
"""
from typing import Dict, Any
from model_loader import get_model_loader
import numpy as np

class ScoringService:
    def __init__(self):
        self.model_loader = get_model_loader()
    
    def predict_eco_score(self, metrics: Dict[str, float]) -> Dict[str, Any]:
        """
        Predict eco score from driving metrics
        
        Args:
            metrics: Dictionary with keys:
                - rpm_var: RPM variation
                - braking_hits: Harsh braking count
                - fuel_usage: Fuel consumption
                - smoothness_val: Acceleration smoothness (0-1)
        
        Returns:
            Dictionary with eco_score, status, and breakdown
        """
        import pandas as pd
        
        model = self.model_loader.model
        
        if model is None:
            raise ValueError("Model not loaded")
        
        # Prepare features as DataFrame with proper column names
        features_dict = {
            'rpm_variation': [metrics.get('rpm_var', 1000)],
            'harsh_braking_count': [metrics.get('braking_hits', 0)],
            'idling_time': [0.0],  # 0 while moving in game
            'fuel_consumption': [metrics.get('fuel_usage', 8.0)],
            'acceleration_smoothness': [metrics.get('smoothness_val', 0.8)]
        }
        features_df = pd.DataFrame(features_dict)
        
        # Predict
        prediction = model.predict(features_df)[0]
        eco_score = float(np.clip(prediction, 0, 100))
        
        # Generate status message
        status = self._generate_status(
            eco_score,
            metrics.get('braking_hits', 0),
            metrics.get('smoothness_val', 0.8)
        )
        
        # Get feature contributions
        feature_importance = self.model_loader.get_feature_importance()
        
        return {
            "eco_score": round(eco_score, 1),
            "status": status,
            "feature_importance": feature_importance,
            "metrics_received": metrics
        }
    
    def analyze_full_session(self, session_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a complete game session with cumulative metrics
        
        Args:
            session_metrics: Dictionary with cumulative session data:
                - total_rpm_variation
                - total_braking_events
                - total_fuel_consumed
                - total_lane_switches
                - distance_traveled
                - duration (seconds)
        
        Returns:
            Detailed analysis with predictions and improvement potential
        """
        model = self.model_loader.model
        stats = self.model_loader.get_data_stats()
        
        # Calculate average metrics from totals
        duration = max(session_metrics.get('duration', 1), 1)
        distance = max(session_metrics.get('distance_traveled', 1), 1)
        
        avg_rpm_var = session_metrics.get('total_rpm_variation', 0) / duration
        avg_braking = session_metrics.get('total_braking_events', 0) / (distance / 100)  # per 100 units
        avg_fuel = session_metrics.get('total_fuel_consumed', 0) / distance
        avg_smoothness = max(0, 1 - (session_metrics.get('total_lane_switches', 0) / (duration * 2)))
        
        # Predict current score using DataFrame
        import pandas as pd
        current_features_df = pd.DataFrame({
            'rpm_variation': [avg_rpm_var],
            'harsh_braking_count': [session_metrics.get('total_braking_events', 0)],
            'idling_time': [0.0],
            'fuel_consumption': [avg_fuel * 100],  # Scale to match training data
            'acceleration_smoothness': [avg_smoothness]
        })
        current_score = float(model.predict(current_features_df)[0])
        
        # Predict optimal score (best case scenario)
        optimal_features_df = pd.DataFrame({
            'rpm_variation': [stats['mean']['rpm_variation']],
            'harsh_braking_count': [0],  # No braking
            'idling_time': [0],
            'fuel_consumption': [stats['min']['fuel_consumption']],
            'acceleration_smoothness': [1.0]  # Perfect smoothness
        })
        optimal_score = float(model.predict(optimal_features_df)[0])
        
        # Calculate improvement potential
        improvement_potential = max(0, optimal_score - current_score)
        improvement_percent = (improvement_potential / max(current_score, 1)) * 100
        
        return {
            "current_score": round(current_score, 1),
            "optimal_score": round(optimal_score, 1),
            "improvement_potential": round(improvement_potential, 1),
            "improvement_percent": round(improvement_percent, 1),
            "session_averages": {
                "rpm_variation": round(avg_rpm_var, 1),
                "braking_frequency": round(avg_braking, 2),
                "fuel_efficiency": round(avg_fuel, 4),
                "smoothness": round(avg_smoothness, 2)
            }
        }
    
    def _generate_status(self, score: float, braking: int, smoothness: float) -> str:
        """Generate dynamic status message based on metrics"""
        if braking > 3:
            return "Critical: Excessive Braking!"
        elif braking > 0:
            return "Warning: High Braking!"
        elif smoothness > 0.9 and score > 80:
            return "Excellent: Perfect Eco-Driving!"
        elif score > 70:
            return "Good: Smooth Driving"
        elif score > 50:
            return "Fair: Room for Improvement"
        else:
            return "Poor: Focus on Smoothness"


# Global instance
_scoring_service = ScoringService()

def get_scoring_service() -> ScoringService:
    """Get the global scoring service instance"""
    return _scoring_service
