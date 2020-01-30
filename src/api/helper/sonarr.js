const TVMaze = require('../tvMaze.js');
const tvmaze = new TVMaze();

module.exports = buildSonarrSeries = (series, sonarr) => {
    if (sonarr.profile === "0" || sonar.rootfolder === "0") {
        console.log("Please set quality profile and default root folder in sonarr config!");
        return undefined;
    }

    let newSeries = {
        title: series.title,
        seasons: series.seasons,
        qualityProfileId: parseInt(sonarr.profile),
        rootFolderPath: parseInt(sonarr.rootfolder),
        seasonFolder: (sonarr.seasonfolders === "true") ? true : false,
        monitored: true,
        tvdbId: series.tvdbId,
        tvRageId: series.tvRageId,
        cleanTitle: series.cleanTitle,
        imdbid: series.imdbId,
        titleSlug: series.titleSlug,
        seriesType: series.seriesType,
        images: series.images
    };

    if (tvmaze.isAnime(series.tvdbId)) {
        if (sonarr.profileanime !== "0")
            newSeries.qualityProfileId = parseInt(sonarr.profileanime);
        if (sonarr.rootfolderanime !== "0")
            newSeries.rootFolderPath = parseInt(sonarr.rootfolderanime);

        newSeries.seriesType = "anime";
    }

    if (sonarr.v3 === "true") {
        newSeries.languageProfileId = parseInt(sonarr.languageprofile);
    }

    newSeries = {
        ...newSeries,
        addOptions: {
            ignoreEpisodesWithFiles: false,
            ignoreEpisodesWithoutFiles: false,
            searchForMissingEpisodes: false
        }
    }

    return newSeries;
}
