export function getDayOfWeek(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date().getDay()]
}

export function getCurrentSeason(): { season: string; year: number } {
    const date = new Date()
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    let season
    if (month >= 3 && month <= 5) {
        season = "SPRING"
    } else if (month >= 6 && month <= 8) {
        season = "SUMMER"
    } else if (month >= 9 && month <= 11) {
        season = "FALL"
    } else {
        season = "WINTER"
    }

    return { season, year }
}

export function formatStatus(status: string): string {
    switch (status) {
        case "FINISHED":
            return "Finished"
        case "RELEASING":
            return "Airing"
        case "NOT_YET_RELEASED":
            return "Coming Soon"
        case "CANCELLED":
            return "Cancelled"
        default:
            return status
    }
}

export function formatFormat(format: string): string {
    switch (format) {
        case "TV":
            return "TV Series"
        case "TV_SHORT":
            return "TV Short"
        case "MOVIE":
            return "Movie"
        case "SPECIAL":
            return "Special"
        case "OVA":
            return "OVA"
        case "ONA":
            return "ONA"
        case "MUSIC":
            return "Music"
        default:
            return format
    }
}

export function formatCountdown(seconds: number): string {
    const d = Math.floor(seconds / (60 * 60 * 24));
    const h = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    const m = Math.floor((seconds % (60 * 60)) / 60);

    return [
        d > 0 ? `${d}d` : null,
        h > 0 ? `${h}h` : null,
        m > 0 ? `${m}m` : null,
    ]
        .filter(Boolean)
        .join(" ");
}

