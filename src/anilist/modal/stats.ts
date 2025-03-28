export interface ScoreDistribution {
    score: number;
    amount: number;
}

export interface StatusDistribution {
    status: string;
    amount: number;
}

export interface AnimeStatsData {
    scoreDistribution: ScoreDistribution[];
    statusDistribution: StatusDistribution[];
}