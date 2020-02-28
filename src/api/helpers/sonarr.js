const TVMaze = require('../tvmaze.js');
const tvmaze = new TVMaze();

module.exports = buildSonarrSeries = (series, sonarr) => {
    if (sonarr.profile === "0" || sonarr.rootfolder === "0" || sonarr.rootfolder === "") {
        const errMsg = 'Please set quality profile and default root folder in sonarr config!';
        console.log(errMsg);
        return errMsg;
    }

    let newSeries = {
        title: series.title,
        seasons: series.seasons,
        qualityProfileId: parseInt(sonarr.profile),
        rootFolderPath: sonarr.rootfolder,
        path: sonarr.rootfolder + series.title,
        seasonFolder: (sonarr.seasonfolders === "true") ? true : false,
        monitored: true,
        tvdbId: series.tvdbId,
        tvRageId: series.tvRageId,
        cleanTitle: series.cleanTitle,
        imdbid: series.imdbId,
        titleSlug: series.titleSlug,
        seriesType: series.seriesType,
        images: series.images,
        id: series.id
    }

    tvmaze.isAnime(series.tvdbId).then((status) => {
        if (status) {
            if (sonarr.profileanime !== "0")
                newSeries.qualityProfileId = parseInt(sonarr.profileanime);
            if (sonarr.rootfolderanime !== "0" && sonarr.rootfolderanime !== "")
                newSeries.rootFolderPath = sonarr.rootfolderanime;

            newSeries.seriesType = "anime";
        }
    });

    if (sonarr.v3 === "true") {
        newSeries.languageProfileId = parseInt(sonarr.languageprofile);
    }

    Object.assign(newSeries, {
        addOptions: {
            ignoreEpisodesWithFiles: true,
            ignoreEpisodesWithoutFiles: false,
            searchForMissingEpisodes: (sonarr.searchonrequest === "true") ? true : false
        }
    });

    return newSeries;
}
