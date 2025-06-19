import { BehaviorSubject } from 'rxjs';

interface StateComparison {
    key: string;
    oldValue: any;
    newValue: any;
    matches: boolean;
}

export class StateComparisonMonitor {
    private comparisons: StateComparison[] = [];
    private enabled = new BehaviorSubject<boolean>(false);

    enable() {
        this.enabled.next(true);
    }

    disable() {
        this.enabled.next(false);
    }

    compareState(key: string, oldValue: any, newValue: any) {
        if (!this.enabled.value) return;

        const comparison: StateComparison = {
            key,
            oldValue,
            newValue,
            matches: JSON.stringify(oldValue) === JSON.stringify(newValue)
        };

        this.comparisons.push(comparison);
        
        // Log the comparison
        console.group(`State Comparison: ${key}`);
        console.log('Old Value:', oldValue);
        console.log('New Value:', newValue);
        console.log('Matches:', comparison.matches);
        if (!comparison.matches) {
            console.warn('State mismatch detected!');
        }
        console.groupEnd();
    }

    getComparisons() {
        return this.comparisons;
    }

    clear() {
        this.comparisons = [];
    }
}

// Create a singleton instance
export const stateMonitor = new StateComparisonMonitor(); 