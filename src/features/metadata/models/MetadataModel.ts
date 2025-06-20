import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { ReactiveModel } from '../../../lib/reactive-model';
import { MetadataState, MetadataResponse } from '../types';
import { getMetadata } from '../api';

const initialState: MetadataState = {
    data: null,
    isLoading: false,
    error: null
};

export class MetadataModel extends ReactiveModel {
    private state$ = new BehaviorSubject<MetadataState>(initialState);

    // Generic state selector
    getStateProperty$<K extends keyof MetadataState>(property: K) {
        return this.state$.pipe(
            map(state => state[property]),
            distinctUntilChanged()
        );
    }

    // Organized selectors
    selectors = {
        metadata: {
            data: () => this.getStateProperty$('data')
        },
        status: {
            isLoading: () => this.getStateProperty$('isLoading'),
            error: () => this.getStateProperty$('error')
        }
    };

    private setState(newState: Partial<MetadataState>) {
        this.state$.next({
            ...this.state$.value,
            ...newState
        });
    }

    async fetchMetadata(uniprotId: string, inputType: 'uniprot' | 'pdb' | 'invalid' | null) {
        try {
            // Clear any previous error state
            this.setState({ isLoading: true, error: null });
            
            // Extract UniProt ID from PDB ID if necessary
            const effectiveUniprotId = inputType === 'pdb' ? 
                await this.extractUniprotFromPdb(uniprotId) : 
                uniprotId;
            
            const data = await getMetadata(effectiveUniprotId);
            this.setState({ data, isLoading: false });
            return data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch metadata';
            this.setState({ error: errorMessage, isLoading: false, data: null });
            throw error;
        }
    }

    private async extractUniprotFromPdb(pdbId: string): Promise<string> {
        // TODO: Implement PDB to UniProt mapping
        // For now, just throw an error
        throw new Error('PDB to UniProt mapping not yet implemented');
    }

    clearMetadata() {
        this.setState(initialState);
    }
} 