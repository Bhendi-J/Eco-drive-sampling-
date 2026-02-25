// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Types
export interface EcoScoreRequest {
    rpm_var: number;
    braking_hits: number;
    fuel_usage: number;
    smoothness_val: number;
}

export interface EcoScoreResponse {
    eco_score: number;
    status: string;
    timestamp: string;
}

export interface GameSession {
    mode: 'city' | 'highway' | 'jungle';
    final_score: number;
    duration: number;
    fuel_remaining: number;
    collisions: number;
    player_name?: string;
}

export interface SessionResponse {
    success: boolean;
    session_id: number;
    message: string;
}

export interface LeaderboardEntry {
    player_name: string;
    score: number;
    mode: string;
    timestamp: string;
}

export interface StatsResponse {
    total_sessions: number;
    average_score: number;
    best_score: number;
    total_playtime: number;
    city_sessions?: number;
    highway_sessions?: number;
    jungle_sessions?: number;
}

export interface SessionAnalysisRequest {
    total_rpm_variation: number;
    total_braking_events: number;
    total_fuel_consumed: number;
    total_lane_switches: number;
    distance_traveled: number;
    duration: number;
}

export interface Recommendation {
    feature: string;
    priority: 'high' | 'medium' | 'low';
    message: string;
    current_value: number;
    target_value: number;
    deviation_percent: number;
    potential_impact: number;
    icon: string;
}

export interface SessionAnalysisResponse {
    success: boolean;
    analysis: {
        current_score: number;
        optimal_score: number;
        improvement_potential: number;
        improvement_percent: number;
        session_averages: {
            rpm_variation: number;
            braking_frequency: number;
            fuel_efficiency: number;
            smoothness: number;
        };
    };
    recommendations: Recommendation[];
    summary: string;
    timestamp: string;
}

// API Client
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Health check
    async healthCheck(): Promise<{ status: string; timestamp: string }> {
        return this.request('/health');
    }

    // Get eco score
    async getEcoScore(data: EcoScoreRequest): Promise<EcoScoreResponse> {
        return this.request('/get_score', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Save game session
    async saveSession(session: GameSession): Promise<SessionResponse> {
        return this.request('/save_session', {
            method: 'POST',
            body: JSON.stringify(session),
        });
    }

    // Get leaderboard
    async getLeaderboard(mode: 'all' | 'city' | 'highway' = 'all', limit: number = 10): Promise<{
        leaderboard: LeaderboardEntry[];
        count: number;
    }> {
        return this.request(`/leaderboard?mode=${mode}&limit=${limit}`);
    }

    // Get overall stats
    async getStats(): Promise<StatsResponse> {
        return this.request('/stats');
    }

    // Get player stats
    async getPlayerStats(playerName: string): Promise<{
        player_name: string;
        total_sessions: number;
        average_score: number;
        best_score: number;
        recent_sessions: any[];
    }> {
        return this.request(`/player_stats?name=${encodeURIComponent(playerName)}`);
    }

    // Get recent sessions
    async getRecentSessions(limit: number = 10): Promise<{
        sessions: any[];
        count: number;
    }> {
        return this.request(`/recent_sessions?limit=${limit}`);
    }

    // Analyze session with AI recommendations
    async analyzeSession(sessionMetrics: SessionAnalysisRequest): Promise<SessionAnalysisResponse> {
        return this.request('/analyze_session', {
            method: 'POST',
            body: JSON.stringify(sessionMetrics),
        });
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual functions for convenience
export const api = {
    healthCheck: () => apiClient.healthCheck(),
    getEcoScore: (data: EcoScoreRequest) => apiClient.getEcoScore(data),
    saveSession: (session: GameSession) => apiClient.saveSession(session),
    getLeaderboard: (mode?: 'all' | 'city' | 'highway', limit?: number) =>
        apiClient.getLeaderboard(mode, limit),
    getStats: () => apiClient.getStats(),
    getPlayerStats: (playerName: string) => apiClient.getPlayerStats(playerName),
    getRecentSessions: (limit?: number) => apiClient.getRecentSessions(limit),
    analyzeSession: (sessionMetrics: SessionAnalysisRequest) => apiClient.analyzeSession(sessionMetrics),
};
