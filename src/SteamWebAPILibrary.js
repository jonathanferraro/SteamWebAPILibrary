import 'dotenv/config';
import { hasUncaughtExceptionCaptureCallback } from 'process';

async function handleEndpointOrFormat(format, url, method, specificData) {
    //DRY template for handling if a specific format or data endpoint is specified

    let dataEndpoint = '';

    switch (method) {
        case 'getNewsForApp':
            if (specificData) {
                dataEndpoint = 'appnews.' + specificData;
            } else {
                dataEndpoint = 'appnews'
            }
            break;
        case 'getGlobalAchievementPercentagesForApp':
            if (specificData) {
                dataEndpoint = 'achievementpercentages.' + specificData;
            } else {
                dataEndpoint = 'achievementpercentages';
            }
            break;
        case 'getPlayerSummaries':
            if (specificData) {
                dataEndpoint = 'response.' + specificData;
            } else {
                dataEndpoint = 'response';
            }
            break;
        case 'getFriendList':
            if (specificData) {
                dataEndpoint = 'friendslist.' + specificData;
            } else {
                dataEndpoint = 'friendslist';
            }
            break;
        case 'getPlayerAchievements':
            if (specificData) {
                dataEndpoint = 'playerstats.' + specificData;
            } else {
                dataEndpoint = 'playerstats';
            }
            break;
        case 'getUserStatsForGame':
            if (specificData) {
                dataEndpoint = 'playerstats.' + specificData;
                console.log(dataEndpoint);
            } else {
                dataEndpoint = 'playerstats';
            }
            break;
        case 'getOwnedGames':
            if (specificData) {
                dataEndpoint = 'response.' + specificData;
            } else {
                dataEndpoint = 'response';
            }
            break;
        case 'getRecentlyPlayedGames':
            if (specificData) {
                dataEndpoint = 'response.' + specificData;
            } else {
                dataEndpoint = 'response';
            }
            break;
        default:
            console.error("Invalid method: ", method);
            return null;
    }

    if (format === 'json' || format === '') {
        try {
            const response = await fetch(url);
            const data = await response.json();
            const keys = dataEndpoint.split('.');
            const result = keys.reduce((acc, key) => acc[key], data);

            return result;

        } catch (error) {
            console.error('The server returned an error: ', error);
            return null;
        }
    } else if (format === 'xml') {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`The server returned an error: ${response.status}`);
            }
            const xml = await response.text();
            return xml;
        } catch (error) {
            console.error(`The server returned an error: ${response.status}`);
            return null;
        }
    } else if (format === 'vdf') try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching VDF: ${response.status}`);
        }
        const vdf = await response.text();
        return vdf;
    } catch (error) {
        console.error('Error fetching VDF: ', error);
        return null;
    } else {
        console.error(`An unknown format was specified. Format is an optional parameter and is a JSON object by default.`)
        return null;
    }
}

class CallSteamAPI {
    static #baseURL = `http://api.steampowered.com`;

    constructor() {
        this.key = process.env.STEAM_KEY;
        try {
            const key = this.key;
            if (!key) {
                throw new Error('A Steam Web API key was not found.');
            }
            const keyRegex = /^[a-zA-Z0-9]{32}$/;
            if (!keyRegex.test(key)) {
                throw new Error('The Steam Web API key provided is invalid. It must be a 32-character alphanumeric string with no special characters.')
            }
        } catch (error) {
            console.error(`There was a problem instantiating the Steam Web API Library object: \n\n${error}\n`);
            return null;
        }
    }

    //Format should be truthy in each method by default, but if for some reason handleEndpointOrFormat doesn't execute, methods will at least return a default JSON object

    async getNewsForApp(appid, count = 3, maxlength = 300, format = 'json', specificData) {
        const endpoint = `/ISteamNews/GetNewsForApp/v0002/`;
        const query = `?appid=${appid}&count=${count}&maxlength=${maxlength}&format=${format}`;
        const url = `${CallSteamAPI.#baseURL}` + endpoint + query;

        if (format || specificData) {
            return handleEndpointOrFormat(format, url, 'getNewsForApp', specificData);
        } else {
            try {
                const response = await fetch(url);
                const data = await response.json();
                return data.appnews;
            } catch (error) {
                console.error('The server returned an error: ', error);
                return null;
            }
        }
    }
    async getGlobalAchievementPercentagesForApp(gameid, format = 'json', specificData) {
        const endpoint = `/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v002/`;
        const query = `?gameid=${gameid}&format=${format}`;
        const url = `${CallSteamAPI.#baseURL}` + endpoint + query;

        if (format || specificData) {
            return handleEndpointOrFormat(format, url, 'getGlobalAchievementPercentagesForApp', specificData);
        } else {
            try {
                const response = await fetch(url);
                const data = await response.json();
                return data.achievementpercentages.achievements;
            } catch (error) {
                console.error('The server returned an error: ', error);
                return null;
            }
        }
    }
    async getPlayerSummaries(steamids, format = 'json', specificData) {
        const endpoint = `/ISteamUser/GetPlayerSummaries/v0002/`;
        const query = `?key=${this.key}&steamids=${steamids}&format=${format}`
        const url = `${CallSteamAPI.#baseURL}` + endpoint + query;

        if (format || specificData) {
            return handleEndpointOrFormat(format, url, 'getPlayerSummaries', specificData);
        } else {
            try {
                const response = await fetch(url);
                const data = await response.json();
                return data.response;
            } catch (error) {
                console.error('The server returned an error: ', error);
                return null;
            }
        }
    }
    async getFriendList(steamid, relationship = `friend`, format = 'json', specificData) {
        const endpoint = `/ISteamUser/GetFriendList/v0001/`;
        const query = `?key=${this.key}&steamid=${steamid}&relationship=${relationship}&format=${format}`
        const url = `${CallSteamAPI.#baseURL}` + endpoint + query;

        if (format || specificData) {
            return handleEndpointOrFormat(format, url, 'getFriendList', specificData);
        } else {
            try {
                const response = await fetch(url);
                const data = await response.json();
                return data.friendslist;
            } catch (error) {
                console.error('The server returned an error: ', error);
                return null;
            }
        }
    }
    async getPlayerAchievements(steamid, appid, format = 'json', specificData) {
        const endpoint = `/ISteamUserStats/GetPlayerAchievements/v0001/`;
        const query = `?appid=${appid}&key=${this.key}&steamid=${steamid}&format=${format}`;
        const url = `${CallSteamAPI.#baseURL}` + endpoint + query;

        if (format || specificData) {
            return handleEndpointOrFormat(format, url, 'getPlayerAchievements', specificData);
        } else {
            try {
                const response = await fetch(url);
                const data = await response.json();
                return data.playerstats;
            } catch (error) {
                console.error('The server returned an error: ', error);
                return null;
            }
        }
    }
    async getUserStatsForGame(steamid, appid, format = 'json', specificData) {
        const endpoint = `/ISteamUserStats/GetUserStatsForGame/v0002/`;
        const query = `?appid=${appid}&key=${this.key}&steamid=${steamid}&format=${format}`;
        const url = `${CallSteamAPI.#baseURL}` + endpoint + query;

        if (format || specificData) {
            return handleEndpointOrFormat(format, url, 'getUserStatsForGame', specificData);
        } else {
            try {
                const response = await fetch(url);
                const data = await response.json();
                return data.playerstats;
            } catch (error) {
                console.error('The server returned an error: ', error)
                return null;
            }
        }
    }
    async getOwnedGames(steamid, format = 'json', specificData, includeAppInfo = true, includePlayedFreeGames = true) {
        const includeAppInfoParam = includeAppInfo ? `&include_appinfo=true` : '';
        const includePlayedFreeGamesParam = includePlayedFreeGames ? `&include_played_free_games=true` : '';

        const endpoint = `/IPlayerService/GetOwnedGames/v0001/`;
        const query = `?key=${this.key}&steamid=${steamid}${includeAppInfoParam}${includePlayedFreeGamesParam}&format=${format}`;
        const url = `${CallSteamAPI.#baseURL}` + endpoint + query;

        if (format || specificData) {
            return handleEndpointOrFormat(format, url, 'getOwnedGames', specificData);
        } else {
            try {
                const response = await fetch(url);
                const data = await response.json();
                return data.response.games;
            } catch (error) {
                console.error('The server returned an error: ', error)
                return null;
            }
        }
    }
    async getRecentlyPlayedGames(steamid, format, count = null, specificData) {
        const countParam = count ? `&count=${count}` : '';

        const endpoint = `/IPlayerService/GetRecentlyPlayedGames/v0001/`;
        const query = `?key=${this.key}&steamid=${steamid}${countParam}&format=${format}`;
        const url = `${CallSteamAPI.#baseURL}` + endpoint + query;

        if (format || specificData) {
            return handleEndpointOrFormat(format, url, 'getRecentlyPlayedGames', specificData)
        } else {
            try {
                const response = await fetch(url);
                const data = await response.json();
                return data.response;
            } catch (error) {
                console.error('The server returned an error: ', error)
                return null;
            }
        }
    }
}

export default CallSteamAPI;