export interface RelatedAnime {
    id: number;
    title: {
        romaji: string;
        english: string | null;
        native: string;
    };
    format: string;
    type: string;
    status: string;
    coverImage: {
        large: string | null;
    };
}

export interface RelationEdge {
    id: number;
    relationType: string;
    node: RelatedAnime;
}

export interface RelationConnection {
    edges: RelationEdge[];
}

export interface Recommendation {
    id: number;
    rating: number;
    mediaRecommendation: {
        id: number;
        title: {
            romaji: string;
            english: string | null;
        };
        coverImage: {
            large: string | null;
        };
        format: string;
        episodes: number | null;
    };
}

export interface RecommendationConnection {
    nodes: Recommendation[];
}