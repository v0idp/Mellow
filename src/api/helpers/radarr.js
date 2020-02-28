module.exports = buildRadarrMovie = (movie, radarr) => {
    if (radarr.profile === "0" || radarr.rootfolder === "0" || radarr.rootfolder === "") {
        const errMsg = 'Please set quality profile and default root folder in radarr config!';
        console.log(errMsg);
        return errMsg;
    }

    let newMovie = {
        title: movie.title,
        tmdbId: movie.tmdbId,
        qualityProfileId: parseInt(radarr.profile),
        rootFolderPath: radarr.rootfolder,
        path: radarr.rootfolder + movie.title,
        titleSlug: movie.titleSlug,
        monitored: true,
        year: movie.year,
        images: movie.images,
        minimumAvailability: radarr.minimumavailability
    }

    Object.assign(newMovie, {
        addOptions: {
            searchForMovie: (radarr.searchonrequest === "true") ? true : false
        }
    });

    return newMovie;
}
