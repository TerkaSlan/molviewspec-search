import { Observable, Subscription } from 'rxjs';

export class ReactiveModel {
    private subscriptions: Subscription[] = [];
    private mounted = false;

    private debug(action: string, data?: any) {
        console.log(`[ReactiveModel] ${action}`, data || '');
    }

    subscribe<T>(obs: Observable<T>, action: (v: T) => any) {
        const subscription = obs.subscribe(action);
        this.subscriptions.push(subscription);
        
        // If already mounted, execute action with current value
        if (this.mounted && 'value' in obs) {
            action((obs as any).value);
        }

        this.debug('subscribe', { 
            mounted: this.mounted, 
            subscriptionCount: this.subscriptions.length 
        });
        
        return () => {
            subscription.unsubscribe();
            this.subscriptions = this.subscriptions.filter(s => s !== subscription);
        };
    }

    event<T extends HTMLElement | Document | Window>(
        target: T,
        type: string,
        listener: EventListener,
        options?: boolean | AddEventListenerOptions
    ) {
        target.addEventListener(type, listener, options);
        const subscription = new Subscription(() => {
            target.removeEventListener(type, listener, options);
        });
        this.subscriptions.push(subscription);
        return () => subscription.unsubscribe();
    }

    customDispose(action: () => void) {
        const subscription = new Subscription(action);
        this.subscriptions.push(subscription);
        return () => subscription.unsubscribe();
    }

    mount(...args: any[]) {
        this.debug('mount', { subscriptionCount: this.subscriptions.length });
        this.mounted = true;
    }

    dispose() {
        this.debug('dispose', { subscriptionCount: this.subscriptions.length });
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.subscriptions = [];
        this.mounted = false;
    }
}