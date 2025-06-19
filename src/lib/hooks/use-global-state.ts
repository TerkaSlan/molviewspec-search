import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';
import { globalStateService } from '../state/GlobalStateService';
import { SuperpositionData, SearchProgressInfo } from '../../features/search/types';
import { Story, Scene, CurrentView } from '../../features/types';

export function useGlobalState<T>(selector: (service: typeof globalStateService) => Observable<T>): T | undefined {
  const [value, setValue] = useState<T>();

  useEffect(() => {
    const subscription = selector(globalStateService).subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [selector]);

  return value;
}

// Search Hooks
export function useSearchState() {
  return useGlobalState(service => service.getSearchState$());
}

export function useSearchResults() {
  return useGlobalState(service => service.getSearchResults$());
}

export function useIsSearching() {
  return useGlobalState(service => service.getIsSearching$());
}

export function useSelectedResult() {
  return useGlobalState(service => service.getSelectedResult$());
}

// MVS Hooks
export function useMVSState() {
  return useGlobalState(service => service.getMVSState$());
}

export function useActiveScene() {
  return useGlobalState(service => service.getActiveScene$());
}

// Convenience hook for search view state
export function useSearchViewState() {
  const searchState = useSearchState();
  
  return {
    query: searchState?.query || null,
    results: searchState?.results || [],
    error: searchState?.validationError,
    progress: searchState?.progress,
    isValidating: searchState?.isValidating || false,
    isSearching: searchState?.isSearching || false,
    hasResults: (searchState?.results.length || 0) > 0,
    isEmpty: !searchState?.query && !searchState?.results.length
  };
}

// Convenience hook for MVS view state
export function useMVSViewState() {
  const mvsState = useMVSState();
  const activeScene = useActiveScene();
  
  return {
    story: mvsState?.story || null,
    currentView: mvsState?.currentView || { type: 'story-options', subview: 'story-metadata' },
    activeScene,
    hasStory: !!mvsState?.story,
    isViewingScene: mvsState?.currentView.type === 'scene',
    currentSnapshot: mvsState?.currentSnapshot
  };
} 