import { BehaviorSubject } from 'rxjs';
import { ReactiveModel } from '../../../lib/reactive-model';
import { getPdbToUniprotMapping } from '../api';
import { map } from 'rxjs/operators';

export interface MappingState {
    data: any | null;
    isLoading: boolean;
    error: string | null;
}

export class MappingModel extends ReactiveModel {
    private state$ = new BehaviorSubject<MappingState>({
        data: null,
        isLoading: false,
        error: null
    });

    getStateProperty$<K extends keyof MappingState>(property: K) {
        return this.state$.pipe(map(state => state[property]));
    }

    // Organized selectors
    selectors = {
        mapping: {
            data: () => this.getStateProperty$('data')
        },
        status: {
            isLoading: () => this.getStateProperty$('isLoading'),
            error: () => this.getStateProperty$('error')
        }
    };

    private setState(newState: Partial<MappingState>) {
        this.state$.next({
            ...this.state$.value,
            ...newState
        });
    }

    async fetchMapping(pdbId: string) {
        try {
            this.setState({ isLoading: true, error: null });
            const data = await getPdbToUniprotMapping(pdbId);
            this.setState({ data, isLoading: false });
            return data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch mapping';
            this.setState({ error: errorMessage, isLoading: false });
            throw error;
        }
    }

    clearMapping() {
        this.setState({
            data: null,
            error: null,
            isLoading: false
        });
    }
} 