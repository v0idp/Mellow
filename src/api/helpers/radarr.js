module.exports = buildRadarrMovie = (movie, radarr, searchNow = false) => {
    if (radarr.profile === "0" || radarr.rootfolder === "0") {
        console.log("Please set quality profile and default root folder in radarr config!");
        return undefined;
    }

    let newMovie = {
        title = movie.title,
        tmdbId = movie.tmdbId,
        qualityProfileId = parseInt(radarr.profile),
        rootFolderPath = parseInt(radarr.rootfolder),
        titleSlug = movie.titleSlug,
        monitored = true,
        year = movie.year,
        images = movie.images,
        minimumAvailability = radarr.minimumavailability
    };

    newMovie = {
        ...newMovie,
        addOptions: {
            searchForMovie: searchNow
        }
    }

    return newMovie;
}
