import {useHttp} from '../hooks/http.hook';
import md5 from 'js-md5';

const useMarvelService = () => {
    const {loading, request, error, clearError} = useHttp();

    const _apiBase = 'https://gateway.marvel.com:443/v1/public/';
    const _apiPublicKey = 'aca1ce62f71271b3430f23a36cc46813'
    const _apiPrivateKey = 'daedd6f8f7d108f58b804232d36abaf7428a5b4e';
    const _apiKey = `apikey=${_apiPublicKey}`;
    const _baseOffset = 210;
    
    const calculateHash = (ts) => {
        const hash = md5.create();
        hash.update(ts + _apiPrivateKey + _apiPublicKey);
        return hash.hex();
    }

    const getCharacterByName = async (name) => {
        const res = await request(`${_apiBase}characters?name=${name}&${_apiKey}`);
        return res.data.results.map(_transformCharacter);
    }

    const getAllCharacters = async (offset = _baseOffset) => {
        const res = await request(`${_apiBase}characters?limit=9&offset=${offset}&${_apiKey}`);
        return res.data.results.map(_transformCharacter);
    }

    const getCharacter = async (id) => {
        const res = await request(`${_apiBase}characters/${id}?${_apiKey}`);
        return _transformCharacter(res.data.results[0]);
    }

    const getAllComics = async (offset = 0) => {
        const ts = Number(new Date());
        const res = await request(`${_apiBase}comics?ts=${ts}&orderBy=issueNumber&limit=8&offset=${offset}&${_apiKey}&hash=${calculateHash(ts)}`);
        return res.data.results.map(_transformComics);
    }
    

    const getComic = async (id) => {
        const ts = Number(new Date());
        console.log(`${_apiBase}comics/${id}?${_apiKey}&hash=${calculateHash(ts)}&ts=${ts}`)
        const res = await request(`${_apiBase}comics/${id}?${_apiKey}&hash=${calculateHash(ts)}&ts=${ts}`);
        return _transformComics(res.data.results[0]);
    }

    const _transformCharacter = (char) => {
        return {
            id: char.id,
            name: char.name,
            description: char.description ? `${char.description.slice(0,210)}...` : 'there is no description for this character',
            thumbnail: char.thumbnail.path + '.' + char.thumbnail.extension,
            homepage: char.urls[0].url,
            wiki: char.urls[1].url,
            comics: char.comics.items
        }
    }

    const _transformComics = (comics) => {
        return {
            id: comics.id,
            title: comics.title,
            description: comics.description || 'There is no description',
            pageCount: comics.pageCount ? `${comics.pageCount} p.` : 'No information about the number of pages',
            thumbnail: comics.thumbnail.path + '.' + comics.thumbnail.extension,
            language: comics.textObjects.language || 'en-us',
            price: comics.prices.price ? `${comics.prices.price}$` : 'not available'
        }
    }

    return {loading, error, clearError, getCharacterByName, getAllCharacters, getCharacter, getAllComics, getComic}
}

export default useMarvelService;