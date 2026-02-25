"""
ML Model Loader
Loads and caches the RandomForest model at startup
"""
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from typing import Tuple
import os

class ModelLoader:
    def __init__(self):
        self.model = None
        self.feature_names = None
        self.data_stats = None
    
    def load_model(self, csv_path: str = 'eco_driving_score.csv') -> RandomForestRegressor:
        """Load and train the ML model once at startup"""
        if self.model is not None:
            return self.model
        
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Training data not found: {csv_path}")
        
        # Load data
        df = pd.read_csv(csv_path)
        
        # Define features
        self.feature_names = [
            'rpm_variation',
            'harsh_braking_count',
            'idling_time',
            'fuel_consumption',
            'acceleration_smoothness'
        ]
        
        X = df[self.feature_names]
        y = df['eco_score']
        
        # Store data statistics for recommendations
        self.data_stats = {
            'mean': X.mean().to_dict(),
            'std': X.std().to_dict(),
            'min': X.min().to_dict(),
            'max': X.max().to_dict(),
        }
        
        # Train model
        self.model = RandomForestRegressor(
            n_estimators=100,
            random_state=42,
            max_depth=10,
            min_samples_split=5
        )
        self.model.fit(X, y)
        
        print(f"✓ Model loaded: {len(df)} training samples")
        print(f"✓ Feature importance calculated")
        
        return self.model
    
    def get_feature_importance(self) -> dict:
        """Get feature importance from the trained model"""
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        importance = self.model.feature_importances_
        return {
            feature: float(imp) 
            for feature, imp in zip(self.feature_names, importance)
        }
    
    def get_data_stats(self) -> dict:
        """Get statistical information about training data"""
        if self.data_stats is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        return self.data_stats


# Global instance
_model_loader = ModelLoader()

def get_model_loader() -> ModelLoader:
    """Get the global model loader instance"""
    return _model_loader
