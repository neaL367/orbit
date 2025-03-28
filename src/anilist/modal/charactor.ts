export interface CharacterEdge {
    id: number
    role: string
    node: {
        id: number
        name: {
            full: string
            native: string
        }
        image: {
            large: string | null
            medium: string | null
        }
    }
    voiceActors?: {
        id: number
        name: {
            full: string
            native: string
        }
        image: {
            large: string | null
        }
        languageV2: string
    }[]
}

export interface Staff {
    id: number;
    name: {
        full: string;
        native: string;
    };
    image: {
        large: string | null;
    };
}

export interface StaffEdge {
    id: number;
    role: string;
    node: Staff;
}

export interface StaffConnection {
    edges: StaffEdge[];
}