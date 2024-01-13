/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable, NgZone } from '@angular/core';
import { Observable, asyncScheduler, queueScheduler } from 'rxjs';
import { observeOn, subscribeOn, tap } from 'rxjs/operators';
import * as i0 from "@angular/core";
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {
}
/**
 * Schedules tasks so that they are invoked inside the Zone that is passed in the constructor.
 */
export class ɵZoneScheduler {
    zone;
    delegate;
    constructor(zone, delegate = queueScheduler) {
        this.zone = zone;
        this.delegate = delegate;
    }
    now() {
        return this.delegate.now();
    }
    schedule(work, delay, state) {
        const targetZone = this.zone;
        // Wrap the specified work function to make sure that if nested scheduling takes place the
        // work is executed in the correct zone
        const workInZone = function (state) {
            targetZone.runGuarded(() => {
                work.apply(this, [state]);
            });
        };
        // Scheduling itself needs to be run in zone to ensure setInterval calls for async scheduling are done
        // inside the correct zone. This scheduler needs to schedule asynchronously always to ensure that
        // firebase emissions are never synchronous. Specifying a delay causes issues with the queueScheduler delegate.
        return this.delegate.schedule(workInZone, delay, state);
    }
}
class BlockUntilFirstOperator {
    zone;
    // @ts-ignore
    task = null;
    constructor(zone) {
        this.zone = zone;
    }
    call(subscriber, source) {
        const unscheduleTask = this.unscheduleTask.bind(this);
        // @ts-ignore
        this.task = this.zone.run(() => Zone.current.scheduleMacroTask('firebaseZoneBlock', noop, {}, noop, noop));
        return source.pipe(tap({ next: unscheduleTask, complete: unscheduleTask, error: unscheduleTask })).subscribe(subscriber).add(unscheduleTask);
    }
    unscheduleTask() {
        // maybe this is a race condition, invoke in a timeout
        // hold for 10ms while I try to figure out what is going on
        setTimeout(() => {
            if (this.task != null && this.task.state === 'scheduled') {
                this.task.invoke();
                this.task = null;
            }
        }, 10);
    }
}
export class ɵAngularFireSchedulers {
    ngZone;
    outsideAngular;
    insideAngular;
    constructor(ngZone) {
        this.ngZone = ngZone;
        // @ts-ignore
        this.outsideAngular = ngZone.runOutsideAngular(() => new ɵZoneScheduler(Zone.current));
        // @ts-ignore
        this.insideAngular = ngZone.run(() => new ɵZoneScheduler(Zone.current, asyncScheduler));
        globalThis.ɵAngularFireScheduler ||= this;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: ɵAngularFireSchedulers, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: ɵAngularFireSchedulers, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: ɵAngularFireSchedulers, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }] });
function getSchedulers() {
    const schedulers = globalThis.ɵAngularFireScheduler;
    if (!schedulers) {
        throw new Error(`Either AngularFireModule has not been provided in your AppModule (this can be done manually or implictly using
provideFirebaseApp) or you're calling an AngularFire method outside of an NgModule (which is not supported).`);
    }
    return schedulers;
}
function runOutsideAngular(fn) {
    return getSchedulers().ngZone.runOutsideAngular(() => fn());
}
function run(fn) {
    return getSchedulers().ngZone.run(() => fn());
}
export function observeOutsideAngular(obs$) {
    return obs$.pipe(observeOn(getSchedulers().outsideAngular));
}
export function observeInsideAngular(obs$) {
    return obs$.pipe(observeOn(getSchedulers().insideAngular));
}
export function keepUnstableUntilFirst(obs$) {
    return ɵkeepUnstableUntilFirstFactory(getSchedulers())(obs$);
}
/**
 * Operator to block the zone until the first value has been emitted or the observable
 * has completed/errored. This is used to make sure that universal waits until the first
 * value from firebase but doesn't block the zone forever since the firebase subscription
 * is still alive.
 */
export function ɵkeepUnstableUntilFirstFactory(schedulers) {
    return function keepUnstableUntilFirst(obs$) {
        obs$ = obs$.lift(new BlockUntilFirstOperator(schedulers.ngZone));
        return obs$.pipe(
        // Run the subscribe body outside of Angular (e.g. calling Firebase SDK to add a listener to a change event)
        subscribeOn(schedulers.outsideAngular), 
        // Run operators inside the angular zone (e.g. side effects via tap())
        observeOn(schedulers.insideAngular)
        // INVESTIGATE https://github.com/angular/angularfire/pull/2315
        // share()
        );
    };
}
// @ts-ignore
const zoneWrapFn = (it, macrotask) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    // function() is needed for the arguments object
    return function () {
        const _arguments = arguments;
        if (macrotask) {
            setTimeout(() => {
                if (macrotask.state === 'scheduled') {
                    macrotask.invoke();
                }
            }, 10);
        }
        return run(() => it.apply(_this, _arguments));
    };
};
export const ɵzoneWrap = (it, blockUntilFirst) => {
    // function() is needed for the arguments object
    return function () {
        // @ts-ignore
        let macrotask;
        const _arguments = arguments;
        // if this is a callback function, e.g, onSnapshot, we should create a microtask and invoke it
        // only once one of the callback functions is tripped.
        for (let i = 0; i < arguments.length; i++) {
            if (typeof _arguments[i] === 'function') {
                if (blockUntilFirst) {
                    // @ts-ignore
                    macrotask ||= run(() => Zone.current.scheduleMacroTask('firebaseZoneBlock', noop, {}, noop, noop));
                }
                // TODO create a microtask to track callback functions
                _arguments[i] = zoneWrapFn(_arguments[i], macrotask);
            }
        }
        const ret = runOutsideAngular(() => it.apply(this, _arguments));
        if (!blockUntilFirst) {
            if (ret instanceof Observable) {
                const schedulers = getSchedulers();
                return ret.pipe(subscribeOn(schedulers.outsideAngular), observeOn(schedulers.insideAngular));
            }
            else {
                return run(() => ret);
            }
        }
        if (ret instanceof Observable) {
            return ret.pipe(keepUnstableUntilFirst);
        }
        else if (ret instanceof Promise) {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            return run(() => new Promise((resolve, reject) => ret.then(it => run(() => resolve(it)), reason => run(() => reject(reason)))));
        }
        else if (typeof ret === 'function' && macrotask) {
            // Handle unsubscribe
            // function() is needed for the arguments object
            return function () {
                setTimeout(() => {
                    if (macrotask && macrotask.state === 'scheduled') {
                        macrotask.invoke();
                    }
                }, 10);
                return ret.apply(this, arguments);
            };
        }
        else {
            // TODO how do we handle storage uploads in Zone? and other stuff with cancel() etc?
            return run(() => ret);
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9uZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvem9uZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBQ3RELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFDTCxVQUFVLEVBT1YsY0FBYyxFQUNkLGNBQWMsRUFDZixNQUFNLE1BQU0sQ0FBQztBQUNkLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDOztBQUU3RCxnRUFBZ0U7QUFDaEUsU0FBUyxJQUFJO0FBQ2IsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGNBQWM7SUFDTDtJQUFtQjtJQUF2QyxZQUFvQixJQUFTLEVBQVUsV0FBZ0IsY0FBYztRQUFqRCxTQUFJLEdBQUosSUFBSSxDQUFLO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBc0I7SUFDckUsQ0FBQztJQUVELEdBQUc7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELFFBQVEsQ0FBQyxJQUF1RCxFQUFFLEtBQWMsRUFBRSxLQUFXO1FBQzNGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDN0IsMEZBQTBGO1FBQzFGLHVDQUF1QztRQUN2QyxNQUFNLFVBQVUsR0FBRyxVQUFxQyxLQUFVO1lBQ2hFLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFRixzR0FBc0c7UUFDdEcsaUdBQWlHO1FBQ2pHLCtHQUErRztRQUMvRyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxL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Q1AsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNwQyxDQUFDLENBQUM7U0FDSDthQUFNO1lBQ0wsb0ZBQW9GO1lBQ3BGLE9BQU8sR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3ZCO0lBQ0gsQ0FBUSxDQUFDO0FBQ1gsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50ICovXG5pbXBvcnQgeyBJbmplY3RhYmxlLCBOZ1pvbmUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIE9ic2VydmFibGUsXG4gIE9wZXJhdG9yLFxuICBTY2hlZHVsZXJBY3Rpb24sXG4gIFNjaGVkdWxlckxpa2UsXG4gIFN1YnNjcmliZXIsXG4gIFN1YnNjcmlwdGlvbixcbiAgVGVhcmRvd25Mb2dpYyxcbiAgYXN5bmNTY2hlZHVsZXIsXG4gIHF1ZXVlU2NoZWR1bGVyXG59IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgb2JzZXJ2ZU9uLCBzdWJzY3JpYmVPbiwgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LWZ1bmN0aW9uXG5mdW5jdGlvbiBub29wKCkge1xufVxuXG4vKipcbiAqIFNjaGVkdWxlcyB0YXNrcyBzbyB0aGF0IHRoZXkgYXJlIGludm9rZWQgaW5zaWRlIHRoZSBab25lIHRoYXQgaXMgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAqL1xuZXhwb3J0IGNsYXNzIMm1Wm9uZVNjaGVkdWxlciBpbXBsZW1lbnRzIFNjaGVkdWxlckxpa2Uge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHpvbmU6IGFueSwgcHJpdmF0ZSBkZWxlZ2F0ZTogYW55ID0gcXVldWVTY2hlZHVsZXIpIHtcbiAgfVxuXG4gIG5vdygpIHtcbiAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5ub3coKTtcbiAgfVxuXG4gIHNjaGVkdWxlKHdvcms6ICh0aGlzOiBTY2hlZHVsZXJBY3Rpb248YW55Piwgc3RhdGU/OiBhbnkpID0+IHZvaWQsIGRlbGF5PzogbnVtYmVyLCBzdGF0ZT86IGFueSk6IFN1YnNjcmlwdGlvbiB7XG4gICAgY29uc3QgdGFyZ2V0Wm9uZSA9IHRoaXMuem9uZTtcbiAgICAvLyBXcmFwIHRoZSBzcGVjaWZpZWQgd29yayBmdW5jdGlvbiB0byBtYWtlIHN1cmUgdGhhdCBpZiBuZXN0ZWQgc2NoZWR1bGluZyB0YWtlcyBwbGFjZSB0aGVcbiAgICAvLyB3b3JrIGlzIGV4ZWN1dGVkIGluIHRoZSBjb3JyZWN0IHpvbmVcbiAgICBjb25zdCB3b3JrSW5ab25lID0gZnVuY3Rpb24odGhpczogU2NoZWR1bGVyQWN0aW9uPGFueT4sIHN0YXRlOiBhbnkpIHtcbiAgICAgIHRhcmdldFpvbmUucnVuR3VhcmRlZCgoKSA9PiB7XG4gICAgICAgIHdvcmsuYXBwbHkodGhpcywgW3N0YXRlXSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gU2NoZWR1bGluZyBpdHNlbGYgbmVlZHMgdG8gYmUgcnVuIGluIHpvbmUgdG8gZW5zdXJlIHNldEludGVydmFsIGNhbGxzIGZvciBhc3luYyBzY2hlZHVsaW5nIGFyZSBkb25lXG4gICAgLy8gaW5zaWRlIHRoZSBjb3JyZWN0IHpvbmUuIFRoaXMgc2NoZWR1bGVyIG5lZWRzIHRvIHNjaGVkdWxlIGFzeW5jaHJvbm91c2x5IGFsd2F5cyB0byBlbnN1cmUgdGhhdFxuICAgIC8vIGZpcmViYXNlIGVtaXNzaW9ucyBhcmUgbmV2ZXIgc3luY2hyb25vdXMuIFNwZWNpZnlpbmcgYSBkZWxheSBjYXVzZXMgaXNzdWVzIHdpdGggdGhlIHF1ZXVlU2NoZWR1bGVyIGRlbGVnYXRlLlxuICAgIHJldHVybiB0aGlzLmRlbGVnYXRlLnNjaGVkdWxlKHdvcmtJblpvbmUsIGRlbGF5LCBzdGF0ZSk7XG4gIH1cbn1cblxuY2xhc3MgQmxvY2tVbnRpbEZpcnN0T3BlcmF0b3I8VD4gaW1wbGVtZW50cyBPcGVyYXRvcjxULCBUPiB7XG4gIC8vIEB0cy1pZ25vcmVcbiAgcHJpdmF0ZSB0YXNrOiBNYWNyb1Rhc2sgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHpvbmU6IGFueSkge1xuICB9XG5cbiAgY2FsbChzdWJzY3JpYmVyOiBTdWJzY3JpYmVyPFQ+LCBzb3VyY2U6IE9ic2VydmFibGU8VD4pOiBUZWFyZG93bkxvZ2ljIHtcbiAgICBjb25zdCB1bnNjaGVkdWxlVGFzayA9IHRoaXMudW5zY2hlZHVsZVRhc2suYmluZCh0aGlzKTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgdGhpcy50YXNrID0gdGhpcy56b25lLnJ1bigoKSA9PiBab25lLmN1cnJlbnQuc2NoZWR1bGVNYWNyb1Rhc2soJ2ZpcmViYXNlWm9uZUJsb2NrJywgbm9vcCwge30sIG5vb3AsIG5vb3ApKTtcblxuICAgIHJldHVybiBzb3VyY2UucGlwZShcbiAgICAgIHRhcCh7IG5leHQ6IHVuc2NoZWR1bGVUYXNrLCBjb21wbGV0ZTogdW5zY2hlZHVsZVRhc2ssIGVycm9yOiB1bnNjaGVkdWxlVGFzayB9KVxuICAgICkuc3Vic2NyaWJlKHN1YnNjcmliZXIpLmFkZCh1bnNjaGVkdWxlVGFzayk7XG4gIH1cblxuICBwcml2YXRlIHVuc2NoZWR1bGVUYXNrKCkge1xuICAgIC8vIG1heWJlIHRoaXMgaXMgYSByYWNlIGNvbmRpdGlvbiwgaW52b2tlIGluIGEgdGltZW91dFxuICAgIC8vIGhvbGQgZm9yIDEwbXMgd2hpbGUgSSB0cnkgdG8gZmlndXJlIG91dCB3aGF0IGlzIGdvaW5nIG9uXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy50YXNrICE9IG51bGwgJiYgdGhpcy50YXNrLnN0YXRlID09PSAnc2NoZWR1bGVkJykge1xuICAgICAgICB0aGlzLnRhc2suaW52b2tlKCk7XG4gICAgICAgIHRoaXMudGFzayA9IG51bGw7XG4gICAgICB9XG4gICAgfSwgMTApO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxufSlcbmV4cG9ydCBjbGFzcyDJtUFuZ3VsYXJGaXJlU2NoZWR1bGVycyB7XG4gIHB1YmxpYyByZWFkb25seSBvdXRzaWRlQW5ndWxhcjogybVab25lU2NoZWR1bGVyO1xuICBwdWJsaWMgcmVhZG9ubHkgaW5zaWRlQW5ndWxhcjogybVab25lU2NoZWR1bGVyO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuZ1pvbmU6IE5nWm9uZSkge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICB0aGlzLm91dHNpZGVBbmd1bGFyID0gbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IG5ldyDJtVpvbmVTY2hlZHVsZXIoWm9uZS5jdXJyZW50KSk7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHRoaXMuaW5zaWRlQW5ndWxhciA9IG5nWm9uZS5ydW4oKCkgPT4gbmV3IMm1Wm9uZVNjaGVkdWxlcihab25lLmN1cnJlbnQsIGFzeW5jU2NoZWR1bGVyKSk7XG4gICAgZ2xvYmFsVGhpcy7JtUFuZ3VsYXJGaXJlU2NoZWR1bGVyIHx8PSB0aGlzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFNjaGVkdWxlcnMoKSB7XG4gIGNvbnN0IHNjaGVkdWxlcnMgPSBnbG9iYWxUaGlzLsm1QW5ndWxhckZpcmVTY2hlZHVsZXIgYXMgybVBbmd1bGFyRmlyZVNjaGVkdWxlcnN8dW5kZWZpbmVkO1xuICBpZiAoIXNjaGVkdWxlcnMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG5gRWl0aGVyIEFuZ3VsYXJGaXJlTW9kdWxlIGhhcyBub3QgYmVlbiBwcm92aWRlZCBpbiB5b3VyIEFwcE1vZHVsZSAodGhpcyBjYW4gYmUgZG9uZSBtYW51YWxseSBvciBpbXBsaWN0bHkgdXNpbmdcbnByb3ZpZGVGaXJlYmFzZUFwcCkgb3IgeW91J3JlIGNhbGxpbmcgYW4gQW5ndWxhckZpcmUgbWV0aG9kIG91dHNpZGUgb2YgYW4gTmdNb2R1bGUgKHdoaWNoIGlzIG5vdCBzdXBwb3J0ZWQpLmApO1xuICB9XG4gIHJldHVybiBzY2hlZHVsZXJzO1xufVxuXG5mdW5jdGlvbiBydW5PdXRzaWRlQW5ndWxhcjxUPihmbjogKC4uLmFyZ3M6IGFueVtdKSA9PiBUKTogVCB7XG4gIHJldHVybiBnZXRTY2hlZHVsZXJzKCkubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IGZuKCkpO1xufVxuXG5mdW5jdGlvbiBydW48VD4oZm46ICguLi5hcmdzOiBhbnlbXSkgPT4gVCk6IFQge1xuICByZXR1cm4gZ2V0U2NoZWR1bGVycygpLm5nWm9uZS5ydW4oKCkgPT4gZm4oKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvYnNlcnZlT3V0c2lkZUFuZ3VsYXI8VD4ob2JzJDogT2JzZXJ2YWJsZTxUPik6IE9ic2VydmFibGU8VD4ge1xuICByZXR1cm4gb2JzJC5waXBlKG9ic2VydmVPbihnZXRTY2hlZHVsZXJzKCkub3V0c2lkZUFuZ3VsYXIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9ic2VydmVJbnNpZGVBbmd1bGFyPFQ+KG9icyQ6IE9ic2VydmFibGU8VD4pOiBPYnNlcnZhYmxlPFQ+IHtcbiAgcmV0dXJuIG9icyQucGlwZShvYnNlcnZlT24oZ2V0U2NoZWR1bGVycygpLmluc2lkZUFuZ3VsYXIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtlZXBVbnN0YWJsZVVudGlsRmlyc3Q8VD4ob2JzJDogT2JzZXJ2YWJsZTxUPik6IE9ic2VydmFibGU8VD4ge1xuICByZXR1cm4gybVrZWVwVW5zdGFibGVVbnRpbEZpcnN0RmFjdG9yeShnZXRTY2hlZHVsZXJzKCkpKG9icyQpO1xufVxuXG4vKipcbiAqIE9wZXJhdG9yIHRvIGJsb2NrIHRoZSB6b25lIHVudGlsIHRoZSBmaXJzdCB2YWx1ZSBoYXMgYmVlbiBlbWl0dGVkIG9yIHRoZSBvYnNlcnZhYmxlXG4gKiBoYXMgY29tcGxldGVkL2Vycm9yZWQuIFRoaXMgaXMgdXNlZCB0byBtYWtlIHN1cmUgdGhhdCB1bml2ZXJzYWwgd2FpdHMgdW50aWwgdGhlIGZpcnN0XG4gKiB2YWx1ZSBmcm9tIGZpcmViYXNlIGJ1dCBkb2Vzbid0IGJsb2NrIHRoZSB6b25lIGZvcmV2ZXIgc2luY2UgdGhlIGZpcmViYXNlIHN1YnNjcmlwdGlvblxuICogaXMgc3RpbGwgYWxpdmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtWtlZXBVbnN0YWJsZVVudGlsRmlyc3RGYWN0b3J5KHNjaGVkdWxlcnM6IMm1QW5ndWxhckZpcmVTY2hlZHVsZXJzKSB7XG4gIHJldHVybiBmdW5jdGlvbiBrZWVwVW5zdGFibGVVbnRpbEZpcnN0PFQ+KG9icyQ6IE9ic2VydmFibGU8VD4pOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICBvYnMkID0gb2JzJC5saWZ0KFxuICAgICAgbmV3IEJsb2NrVW50aWxGaXJzdE9wZXJhdG9yKHNjaGVkdWxlcnMubmdab25lKVxuICAgICk7XG5cbiAgICByZXR1cm4gb2JzJC5waXBlKFxuICAgICAgLy8gUnVuIHRoZSBzdWJzY3JpYmUgYm9keSBvdXRzaWRlIG9mIEFuZ3VsYXIgKGUuZy4gY2FsbGluZyBGaXJlYmFzZSBTREsgdG8gYWRkIGEgbGlzdGVuZXIgdG8gYSBjaGFuZ2UgZXZlbnQpXG4gICAgICBzdWJzY3JpYmVPbihzY2hlZHVsZXJzLm91dHNpZGVBbmd1bGFyKSxcbiAgICAgIC8vIFJ1biBvcGVyYXRvcnMgaW5zaWRlIHRoZSBhbmd1bGFyIHpvbmUgKGUuZy4gc2lkZSBlZmZlY3RzIHZpYSB0YXAoKSlcbiAgICAgIG9ic2VydmVPbihzY2hlZHVsZXJzLmluc2lkZUFuZ3VsYXIpXG4gICAgICAvLyBJTlZFU1RJR0FURSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyZmlyZS9wdWxsLzIzMTVcbiAgICAgIC8vIHNoYXJlKClcbiAgICApO1xuICB9O1xufVxuXG4vLyBAdHMtaWdub3JlXG5jb25zdCB6b25lV3JhcEZuID0gKGl0OiAoLi4uYXJnczogYW55W10pID0+IGFueSwgbWFjcm90YXNrOiBNYWNyb1Rhc2t8dW5kZWZpbmVkKSA9PiB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gIC8vIGZ1bmN0aW9uKCkgaXMgbmVlZGVkIGZvciB0aGUgYXJndW1lbnRzIG9iamVjdFxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgX2FyZ3VtZW50cyA9IGFyZ3VtZW50cztcbiAgICBpZiAobWFjcm90YXNrKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKG1hY3JvdGFzay5zdGF0ZSA9PT0gJ3NjaGVkdWxlZCcpIHtcbiAgICAgICAgICBtYWNyb3Rhc2suaW52b2tlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIDEwKTtcbiAgICB9XG4gICAgcmV0dXJuIHJ1bigoKSA9PiBpdC5hcHBseShfdGhpcywgX2FyZ3VtZW50cykpO1xuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IMm1em9uZVdyYXAgPSA8VD0gdW5rbm93bj4oaXQ6IFQsIGJsb2NrVW50aWxGaXJzdDogYm9vbGVhbik6IFQgPT4ge1xuICAvLyBmdW5jdGlvbigpIGlzIG5lZWRlZCBmb3IgdGhlIGFyZ3VtZW50cyBvYmplY3RcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBsZXQgbWFjcm90YXNrOiBNYWNyb1Rhc2sgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgX2FyZ3VtZW50cyA9IGFyZ3VtZW50cztcbiAgICAvLyBpZiB0aGlzIGlzIGEgY2FsbGJhY2sgZnVuY3Rpb24sIGUuZywgb25TbmFwc2hvdCwgd2Ugc2hvdWxkIGNyZWF0ZSBhIG1pY3JvdGFzayBhbmQgaW52b2tlIGl0XG4gICAgLy8gb25seSBvbmNlIG9uZSBvZiB0aGUgY2FsbGJhY2sgZnVuY3Rpb25zIGlzIHRyaXBwZWQuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0eXBlb2YgX2FyZ3VtZW50c1tpXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBpZiAoYmxvY2tVbnRpbEZpcnN0KSB7XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgIG1hY3JvdGFzayB8fD0gcnVuKCgpID0+IFpvbmUuY3VycmVudC5zY2hlZHVsZU1hY3JvVGFzaygnZmlyZWJhc2Vab25lQmxvY2snLCBub29wLCB7fSwgbm9vcCwgbm9vcCkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE8gY3JlYXRlIGEgbWljcm90YXNrIHRvIHRyYWNrIGNhbGxiYWNrIGZ1bmN0aW9uc1xuICAgICAgICBfYXJndW1lbnRzW2ldID0gem9uZVdyYXBGbihfYXJndW1lbnRzW2ldLCBtYWNyb3Rhc2spO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXQgPSBydW5PdXRzaWRlQW5ndWxhcigoKSA9PiAoaXQgYXMgYW55KS5hcHBseSh0aGlzLCBfYXJndW1lbnRzKSk7XG4gICAgaWYgKCFibG9ja1VudGlsRmlyc3QpIHtcbiAgICAgIGlmIChyZXQgaW5zdGFuY2VvZiBPYnNlcnZhYmxlKSB7XG4gICAgICAgIGNvbnN0IHNjaGVkdWxlcnMgPSBnZXRTY2hlZHVsZXJzKCk7XG4gICAgICAgIHJldHVybiByZXQucGlwZShcbiAgICAgICAgICBzdWJzY3JpYmVPbihzY2hlZHVsZXJzLm91dHNpZGVBbmd1bGFyKSxcbiAgICAgICAgICBvYnNlcnZlT24oc2NoZWR1bGVycy5pbnNpZGVBbmd1bGFyKSxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBydW4oKCkgPT4gcmV0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJldCBpbnN0YW5jZW9mIE9ic2VydmFibGUpIHtcbiAgICAgIHJldHVybiByZXQucGlwZShrZWVwVW5zdGFibGVVbnRpbEZpcnN0KSBhcyBhbnk7XG4gICAgfSBlbHNlIGlmIChyZXQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW1pc3VzZWQtcHJvbWlzZXNcbiAgICAgIHJldHVybiBydW4oKCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gcmV0LnRoZW4oaXQgPT4gcnVuKCgpID0+IHJlc29sdmUoaXQpKSwgcmVhc29uID0+IHJ1bigoKSA9PiByZWplY3QocmVhc29uKSkpKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmV0ID09PSAnZnVuY3Rpb24nICYmIG1hY3JvdGFzaykge1xuICAgICAgLy8gSGFuZGxlIHVuc3Vic2NyaWJlXG4gICAgICAvLyBmdW5jdGlvbigpIGlzIG5lZWRlZCBmb3IgdGhlIGFyZ3VtZW50cyBvYmplY3RcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgaWYgKG1hY3JvdGFzayAmJiBtYWNyb3Rhc2suc3RhdGUgPT09ICdzY2hlZHVsZWQnKSB7XG4gICAgICAgICAgICBtYWNyb3Rhc2suaW52b2tlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAxMCk7XG4gICAgICAgIHJldHVybiByZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRPRE8gaG93IGRvIHdlIGhhbmRsZSBzdG9yYWdlIHVwbG9hZHMgaW4gWm9uZT8gYW5kIG90aGVyIHN0dWZmIHdpdGggY2FuY2VsKCkgZXRjP1xuICAgICAgcmV0dXJuIHJ1bigoKSA9PiByZXQpO1xuICAgIH1cbiAgfSBhcyBhbnk7XG59O1xuIl19