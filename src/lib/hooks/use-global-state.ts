import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';
import { globalStateService } from '../state/GlobalStateService';

export function useGlobalState<T>(selector: (service: typeof globalStateService) => Observable<T>): T | undefined {
  const [value, setValue] = useState<T>();

  useEffect(() => {
    const subscription = selector(globalStateService).subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [selector]);

  return value;
}

// Convenience hooks for common state selections
export function useSearchResults() {
  return useGlobalState(service => service.getSearchResults$());
}

export function useIsSearching() {
  return useGlobalState(service => service.getIsSearching$());
}

export function useSearchState() {
  return useGlobalState(service => service.getSearchState$());
} 