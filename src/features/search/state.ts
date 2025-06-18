import { atom } from 'jotai';
import { SearchState } from './types';

export const API_BASE_URL = 'https://api.alphafind.dyn.cloud.e-infra.cz';

export const SearchStateAtom = atom<SearchState>({
    status: 'idle',
    query: null,
    results: [],
    error: null,
    progress: null,
    lastUpdated: null
});

// Derived atoms for search state
export const SearchResultsAtom = atom((get) => get(SearchStateAtom).results);
export const SearchProgressAtom = atom((get) => get(SearchStateAtom).progress);
export const SearchErrorAtom = atom((get) => get(SearchStateAtom).error); 