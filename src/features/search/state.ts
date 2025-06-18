import { atom } from 'jotai';
import { AlphaFindSearchState } from './types';

export const API_BASE_URL = 'https://api.stage.alphafind.dyn.cloud.e-infra.cz';

export const SearchStateAtom = atom<AlphaFindSearchState>({
    query: '',
    results: [],
    isSearching: false,
    error: null,
    progress: null
});

// Derived atoms for search state
export const IsSearchingAtom = atom((get) => get(SearchStateAtom).isSearching);
export const SearchResultsAtom = atom((get) => get(SearchStateAtom).results);
export const SearchProgressAtom = atom((get) => get(SearchStateAtom).progress);
export const SearchErrorAtom = atom((get) => get(SearchStateAtom).error); 