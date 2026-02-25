"""
Recommendation Service
Generates AI-powered recommendations using ML feature importance
"""
from typing import List, Dict, Any
from model_loader import get_model_loader
import numpy as np

class RecommendationService:
    def __init__(self):
        self.model_loader = get_model_loader()
        
        # Feature metadata for generating recommendations
        self.feature_metadata = {
            'rpm_variation': {
                'name': 'RPM Stability',
                'unit': 'RPM',
                'lower_is_better': True,
                'tips': [
                    "Maintain steady throttle input",
                    "Avoid rapid acceleration",
                    "Use cruise control when possible",
                    "Anticipate traffic flow"
                ]
            },
            'harsh_braking_count': {
                'name': 'Braking Discipline',
                'unit': 'events',
                'lower_is_better': True,
                'tips': [
                    "Increase following distance",
                    "Anticipate stops earlier",
                    "Use engine braking on descents",
                    "Coast to slow down gradually"
                ]
            },
            'idling_time': {
                'name': 'Idle Time',
                'unit': 'seconds',
                'lower_is_better': True,
                'tips': [
                    "Turn off engine during long stops",
                    "Plan routes to avoid congestion",
                    "Use auto start-stop systems"
                ]
            },
            'fuel_consumption': {
                'name': 'Fuel Efficiency',
                'unit': 'L/100km',
                'lower_is_better': True,
                'tips': [
                    "Maintain optimal speed range",
                    "Reduce unnecessary weight",
                    "Keep tires properly inflated",
                    "Minimize AC/heating usage"
                ]
            },
            'acceleration_smoothness': {
                'name': 'Acceleration Smoothness',
                'unit': 'score',
                'lower_is_better': False,
                'tips': [
                    "Accelerate gradually",
                    "Avoid sudden lane changes",
                    "Drive predictably",
                    "Maintain consistent speed"
                ]
            }
        }
    
    def generate_recommendations(
        self, 
        session_metrics: Dict[str, Any],
        session_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Generate AI-powered recommendations based on feature importance
        and session performance
        
        Args:
            session_metrics: Raw session metrics
            session_analysis: Analyzed session data with scores
        
        Returns:
            List of recommendation objects with priority, message, and potential impact
        """
        feature_importance = self.model_loader.get_feature_importance()
        stats = self.model_loader.get_data_stats()
        
        # Calculate metrics deviation from optimal
        duration = max(session_metrics.get('duration', 1), 1)
        distance = max(session_metrics.get('distance_traveled', 1), 1)
        
        current_metrics = {
            'rpm_variation': session_metrics.get('total_rpm_variation', 0) / duration,
            'harsh_braking_count': session_metrics.get('total_braking_events', 0),
            'idling_time': 0,
            'fuel_consumption': (session_metrics.get('total_fuel_consumed', 0) / distance) * 100,
            'acceleration_smoothness': max(0, 1 - (session_metrics.get('total_lane_switches', 0) / (duration * 2)))
        }
        
        recommendations = []
        
        # Generate recommendations for each feature
        for feature, importance in sorted(
            feature_importance.items(), 
            key=lambda x: x[1], 
            reverse=True
        ):
            if feature not in self.feature_metadata:
                continue
            
            metadata = self.feature_metadata[feature]
            current_value = current_metrics.get(feature, 0)
            optimal_value = stats['mean'][feature] if metadata['lower_is_better'] else stats['max'][feature]
            
            # Calculate deviation
            if metadata['lower_is_better']:
                deviation = max(0, current_value - optimal_value)
                deviation_percent = (deviation / max(optimal_value, 1)) * 100
            else:
                deviation = max(0, optimal_value - current_value)
                deviation_percent = (deviation / max(optimal_value, 0.1)) * 100
            
            # Only recommend if there's significant deviation
            if deviation_percent > 10:
                # Calculate potential impact (importance * deviation)
                potential_impact = importance * min(deviation_percent / 100, 1.0)
                
                # Select best tip based on deviation severity
                tip_index = min(int(deviation_percent / 30), len(metadata['tips']) - 1)
                tip = metadata['tips'][tip_index]
                
                recommendation = {
                    'feature': metadata['name'],
                    'priority': 'high' if deviation_percent > 50 else 'medium' if deviation_percent > 25 else 'low',
                    'message': f"{tip} to improve {metadata['name']}",
                    'current_value': round(current_value, 2),
                    'target_value': round(optimal_value, 2),
                    'deviation_percent': round(deviation_percent, 1),
                    'potential_impact': round(potential_impact * 100, 1),  # As percentage
                    'icon': self._get_icon(feature)
                }
                
                recommendations.append(recommendation)
        
        # Sort by potential impact (highest first)
        recommendations.sort(key=lambda x: x['potential_impact'], reverse=True)
        
        # Limit to top 5 most impactful recommendations
        return recommendations[:5]
    
    def _get_icon(self, feature: str) -> str:
        """Get emoji icon for feature"""
        icons = {
            'rpm_variation': '⚡',
            'harsh_braking_count': '🛑',
            'idling_time': '⏱️',
            'fuel_consumption': '⛽',
            'acceleration_smoothness': '🎯'
        }
        return icons.get(feature, '💡')
    
    def generate_session_summary(
        self,
        session_metrics: Dict[str, Any],
        session_analysis: Dict[str, Any]
    ) -> str:
        """Generate a human-readable session summary"""
        score = session_analysis['current_score']
        improvement = session_analysis['improvement_percent']
        duration_min = session_metrics.get('duration', 0) / 60
        distance = session_metrics.get('distance_traveled', 0)
        
        if score >= 80:
            performance = "excellent"
        elif score >= 60:
            performance = "good"
        elif score >= 40:
            performance = "fair"
        else:
            performance = "needs improvement"
        
        summary = (
            f"Session complete! Your eco-driving performance was {performance} "
            f"with a score of {score:.1f}/100. "
            f"You drove {distance:.0f} units in {duration_min:.1f} minutes. "
        )
        
        if improvement > 5:
            summary += f"You have {improvement:.1f}% improvement potential! "
        else:
            summary += "You're driving near optimal efficiency! "
        
        return summary


# Global instance
_recommendation_service = RecommendationService()

def get_recommendation_service() -> RecommendationService:
    """Get the global recommendation service instance"""
    return _recommendation_service
