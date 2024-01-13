import { keepUnstableUntilFirst } from '@angular/fire';
import { from } from 'rxjs';
import { filter, map, pairwise, scan, startWith } from 'rxjs/operators';
import { AngularFirestoreDocument } from '../document/document';
import { fromCollectionRef } from '../observable/fromRef';
import { docChanges, sortedChanges } from './changes';
export function validateEventsArray(events) {
    if (!events || events.length === 0) {
        events = ['added', 'removed', 'modified'];
    }
    return events;
}
/**
 * AngularFirestoreCollection service
 *
 * This class creates a reference to a Firestore Collection. A reference and a query are provided in
 * in the constructor. The query can be the unqueried reference if no query is desired.The class
 * is generic which gives you type safety for data update methods and data streaming.
 *
 * This class uses Symbol.observable to transform into Observable using Observable.from().
 *
 * This class is rarely used directly and should be created from the AngularFirestore service.
 *
 * Example:
 *
 * const collectionRef = firebase.firestore.collection('stocks');
 * const query = collectionRef.where('price', '>', '0.01');
 * const fakeStock = new AngularFirestoreCollection<Stock>(collectionRef, query);
 *
 * // NOTE!: the updates are performed on the reference not the query
 * await fakeStock.add({ name: 'FAKE', price: 0.01 });
 *
 * // Subscribe to changes as snapshots. This provides you data updates as well as delta updates.
 * fakeStock.valueChanges().subscribe(value => console.log(value));
 */
export class AngularFirestoreCollection {
    ref;
    query;
    afs;
    /**
     * The constructor takes in a CollectionReference and Query to provide wrapper methods
     * for data operations and data streaming.
     *
     * Note: Data operation methods are done on the reference not the query. This means
     * when you update data it is not updating data to the window of your query unless
     * the data fits the criteria of the query. See the AssociatedRefence type for details
     * on this implication.
     */
    constructor(ref, query, afs) {
        this.ref = ref;
        this.query = query;
        this.afs = afs;
    }
    /**
     * Listen to the latest change in the stream. This method returns changes
     * as they occur and they are not sorted by query order. This allows you to construct
     * your own data structure.
     */
    stateChanges(events) {
        let source = docChanges(this.query, this.afs.schedulers.outsideAngular);
        if (events && events.length > 0) {
            source = source.pipe(map(actions => actions.filter(change => events.indexOf(change.type) > -1)));
        }
        return source.pipe(
        // We want to filter out empty arrays, but always emit at first, so the developer knows
        // that the collection has been resolve; even if it's empty
        startWith(undefined), pairwise(), filter(([prior, current]) => current.length > 0 || !prior), map(([, current]) => current), keepUnstableUntilFirst);
    }
    /**
     * Create a stream of changes as they occur it time. This method is similar to stateChanges()
     * but it collects each event in an array over time.
     */
    auditTrail(events) {
        return this.stateChanges(events).pipe(scan((current, action) => [...current, ...action], []));
    }
    /**
     * Create a stream of synchronized changes. This method keeps the local array in sorted
     * query order.
     */
    snapshotChanges(events) {
        const validatedEvents = validateEventsArray(events);
        const scheduledSortedChanges$ = sortedChanges(this.query, validatedEvents, this.afs.schedulers.outsideAngular);
        return scheduledSortedChanges$.pipe(keepUnstableUntilFirst);
    }
    valueChanges(options = {}) {
        return fromCollectionRef(this.query, this.afs.schedulers.outsideAngular)
            .pipe(map(actions => actions.payload.docs.map(a => {
            if (options.idField) {
                return {
                    ...a.data(),
                    ...{ [options.idField]: a.id }
                };
            }
            else {
                return a.data();
            }
        })), keepUnstableUntilFirst);
    }
    /**
     * Retrieve the results of the query once.
     */
    get(options) {
        return from(this.query.get(options)).pipe(keepUnstableUntilFirst);
    }
    /**
     * Add data to a collection reference.
     *
     * Note: Data operation methods are done on the reference not the query. This means
     * when you update data it is not updating data to the window of your query unless
     * the data fits the criteria of the query.
     */
    add(data) {
        return this.ref.add(data);
    }
    /**
     * Create a reference to a single document in a collection.
     */
    doc(path) {
        // TODO is there a better way to solve this type issue
        return new AngularFirestoreDocument(this.ref.doc(path), this.afs);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wYXQvZmlyZXN0b3JlL2NvbGxlY3Rpb24vY29sbGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdkQsT0FBTyxFQUFjLElBQUksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN4QyxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3hFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBR2hFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBSXRELE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxNQUE2QjtJQUMvRCxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ2xDLE1BQU0sR0FBRyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDM0M7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQkc7QUFDSCxNQUFNLE9BQU8sMEJBQTBCO0lBV25CO0lBQ0M7SUFDQTtJQVpuQjs7Ozs7Ozs7T0FRRztJQUNILFlBQ2tCLEdBQTJCLEVBQzFCLEtBQWUsRUFDZixHQUFxQjtRQUZ0QixRQUFHLEdBQUgsR0FBRyxDQUF3QjtRQUMxQixVQUFLLEdBQUwsS0FBSyxDQUFVO1FBQ2YsUUFBRyxHQUFILEdBQUcsQ0FBa0I7SUFBSSxDQUFDO0lBRTdDOzs7O09BSUc7SUFDSCxZQUFZLENBQUMsTUFBNkI7UUFDeEMs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RUQ7O09BRUc7SUFDSCxHQUFHLENBQVMsSUFBYTtRQUN2QixzREFBc0Q7UUFDdEQsT0FBTyxJQUFJLHdCQUF3QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBUSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzRSxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBrZWVwVW5zdGFibGVVbnRpbEZpcnN0IH0gZnJvbSAnQGFuZ3VsYXIvZmlyZSc7XG5pbXBvcnQgZmlyZWJhc2UgZnJvbSAnZmlyZWJhc2UvY29tcGF0L2FwcCc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBmaWx0ZXIsIG1hcCwgcGFpcndpc2UsIHNjYW4sIHN0YXJ0V2l0aCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IEFuZ3VsYXJGaXJlc3RvcmVEb2N1bWVudCB9IGZyb20gJy4uL2RvY3VtZW50L2RvY3VtZW50JztcbmltcG9ydCB7IEFuZ3VsYXJGaXJlc3RvcmUgfSBmcm9tICcuLi9maXJlc3RvcmUnO1xuaW1wb3J0IHsgQ29sbGVjdGlvblJlZmVyZW5jZSwgRG9jdW1lbnRDaGFuZ2VBY3Rpb24sIERvY3VtZW50Q2hhbmdlVHlwZSwgRG9jdW1lbnREYXRhLCBEb2N1bWVudFJlZmVyZW5jZSwgUXVlcnkgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGZyb21Db2xsZWN0aW9uUmVmIH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS9mcm9tUmVmJztcbmltcG9ydCB7IGRvY0NoYW5nZXMsIHNvcnRlZENoYW5nZXMgfSBmcm9tICcuL2NoYW5nZXMnO1xuXG50eXBlIERvY3VtZW50Q2hhbmdlVHVwbGU8VD4gPSBbRG9jdW1lbnRDaGFuZ2VBY3Rpb248VD5bXSwgRG9jdW1lbnRDaGFuZ2VBY3Rpb248VD5bXV07XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUV2ZW50c0FycmF5KGV2ZW50cz86IERvY3VtZW50Q2hhbmdlVHlwZVtdKSB7XG4gIGlmICghZXZlbnRzIHx8IGV2ZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBldmVudHMgPSBbJ2FkZGVkJywgJ3JlbW92ZWQnLCAnbW9kaWZpZWQnXTtcbiAgfVxuICByZXR1cm4gZXZlbnRzO1xufVxuXG4vKipcbiAqIEFuZ3VsYXJGaXJlc3RvcmVDb2xsZWN0aW9uIHNlcnZpY2VcbiAqXG4gKiBUaGlzIGNsYXNzIGNyZWF0ZXMgYSByZWZlcmVuY2UgdG8gYSBGaXJlc3RvcmUgQ29sbGVjdGlvbi4gQSByZWZlcmVuY2UgYW5kIGEgcXVlcnkgYXJlIHByb3ZpZGVkIGluXG4gKiBpbiB0aGUgY29uc3RydWN0b3IuIFRoZSBxdWVyeSBjYW4gYmUgdGhlIHVucXVlcmllZCByZWZlcmVuY2UgaWYgbm8gcXVlcnkgaXMgZGVzaXJlZC5UaGUgY2xhc3NcbiAqIGlzIGdlbmVyaWMgd2hpY2ggZ2l2ZXMgeW91IHR5cGUgc2FmZXR5IGZvciBkYXRhIHVwZGF0ZSBtZXRob2RzIGFuZCBkYXRhIHN0cmVhbWluZy5cbiAqXG4gKiBUaGlzIGNsYXNzIHVzZXMgU3ltYm9sLm9ic2VydmFibGUgdG8gdHJhbnNmb3JtIGludG8gT2JzZXJ2YWJsZSB1c2luZyBPYnNlcnZhYmxlLmZyb20oKS5cbiAqXG4gKiBUaGlzIGNsYXNzIGlzIHJhcmVseSB1c2VkIGRpcmVjdGx5IGFuZCBzaG91bGQgYmUgY3JlYXRlZCBmcm9tIHRoZSBBbmd1bGFyRmlyZXN0b3JlIHNlcnZpY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBjb25zdCBjb2xsZWN0aW9uUmVmID0gZmlyZWJhc2UuZmlyZXN0b3JlLmNvbGxlY3Rpb24oJ3N0b2NrcycpO1xuICogY29uc3QgcXVlcnkgPSBjb2xsZWN0aW9uUmVmLndoZXJlKCdwcmljZScsICc+JywgJzAuMDEnKTtcbiAqIGNvbnN0IGZha2VTdG9jayA9IG5ldyBBbmd1bGFyRmlyZXN0b3JlQ29sbGVjdGlvbjxTdG9jaz4oY29sbGVjdGlvblJlZiwgcXVlcnkpO1xuICpcbiAqIC8vIE5PVEUhOiB0aGUgdXBkYXRlcyBhcmUgcGVyZm9ybWVkIG9uIHRoZSByZWZlcmVuY2Ugbm90IHRoZSBxdWVyeVxuICogYXdhaXQgZmFrZVN0b2NrLmFkZCh7IG5hbWU6ICdGQUtFJywgcHJpY2U6IDAuMDEgfSk7XG4gKlxuICogLy8gU3Vic2NyaWJlIHRvIGNoYW5nZXMgYXMgc25hcHNob3RzLiBUaGlzIHByb3ZpZGVzIHlvdSBkYXRhIHVwZGF0ZXMgYXMgd2VsbCBhcyBkZWx0YSB1cGRhdGVzLlxuICogZmFrZVN0b2NrLnZhbHVlQ2hhbmdlcygpLnN1YnNjcmliZSh2YWx1ZSA9PiBjb25zb2xlLmxvZyh2YWx1ZSkpO1xuICovXG5leHBvcnQgY2xhc3MgQW5ndWxhckZpcmVzdG9yZUNvbGxlY3Rpb248VCA9IERvY3VtZW50RGF0YT4ge1xuICAvKipcbiAgICogVGhlIGNvbnN0cnVjdG9yIHRha2VzIGluIGEgQ29sbGVjdGlvblJlZmVyZW5jZSBhbmQgUXVlcnkgdG8gcHJvdmlkZSB3cmFwcGVyIG1ldGhvZHNcbiAgICogZm9yIGRhdGEgb3BlcmF0aW9ucyBhbmQgZGF0YSBzdHJlYW1pbmcuXG4gICAqXG4gICAqIE5vdGU6IERhdGEgb3BlcmF0aW9uIG1ldGhvZHMgYXJlIGRvbmUgb24gdGhlIHJlZmVyZW5jZSBub3QgdGhlIHF1ZXJ5LiBUaGlzIG1lYW5zXG4gICAqIHdoZW4geW91IHVwZGF0ZSBkYXRhIGl0IGlzIG5vdCB1cGRhdGluZyBkYXRhIHRvIHRoZSB3aW5kb3cgb2YgeW91ciBxdWVyeSB1bmxlc3NcbiAgICogdGhlIGRhdGEgZml0cyB0aGUgY3JpdGVyaWEgb2YgdGhlIHF1ZXJ5LiBTZWUgdGhlIEFzc29jaWF0ZWRSZWZlbmNlIHR5cGUgZm9yIGRldGFpbHNcbiAgICogb24gdGhpcyBpbXBsaWNhdGlvbi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSByZWY6IENvbGxlY3Rpb25SZWZlcmVuY2U8VD4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBxdWVyeTogUXVlcnk8VD4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBhZnM6IEFuZ3VsYXJGaXJlc3RvcmUpIHsgfVxuXG4gIC8qKlxuICAgKiBMaXN0ZW4gdG8gdGhlIGxhdGVzdCBjaGFuZ2UgaW4gdGhlIHN0cmVhbS4gVGhpcyBtZXRob2QgcmV0dXJucyBjaGFuZ2VzXG4gICAqIGFzIHRoZXkgb2NjdXIgYW5kIHRoZXkgYXJlIG5vdCBzb3J0ZWQgYnkgcXVlcnkgb3JkZXIuIFRoaXMgYWxsb3dzIHlvdSB0byBjb25zdHJ1Y3RcbiAgICogeW91ciBvd24gZGF0YSBzdHJ1Y3R1cmUuXG4gICAqL1xuICBzdGF0ZUNoYW5nZXMoZXZlbnRzPzogRG9jdW1lbnRDaGFuZ2VUeXBlW10pOiBPYnNlcnZhYmxlPERvY3VtZW50Q2hhbmdlQWN0aW9uPFQ+W10+IHtcbiAgICBsZXQgc291cmNlID0gZG9jQ2hhbmdlczxUPih0aGlzLnF1ZXJ5LCB0aGlzLmFmcy5zY2hlZHVsZXJzLm91dHNpZGVBbmd1bGFyKTtcbiAgICBpZiAoZXZlbnRzICYmIGV2ZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICBzb3VyY2UgPSBzb3VyY2UucGlwZShcbiAgICAgICAgbWFwKGFjdGlvbnMgPT4gYWN0aW9ucy5maWx0ZXIoY2hhbmdlID0+IGV2ZW50cy5pbmRleE9mKGNoYW5nZS50eXBlKSA+IC0xKSlcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2UucGlwZShcbiAgICAgIC8vIFdlIHdhbnQgdG8gZmlsdGVyIG91dCBlbXB0eSBhcnJheXMsIGJ1dCBhbHdheXMgZW1pdCBhdCBmaXJzdCwgc28gdGhlIGRldmVsb3BlciBrbm93c1xuICAgICAgLy8gdGhhdCB0aGUgY29sbGVjdGlvbiBoYXMgYmVlbiByZXNvbHZlOyBldmVuIGlmIGl0J3MgZW1wdHlcbiAgICAgIHN0YXJ0V2l0aDxEb2N1bWVudENoYW5nZUFjdGlvbjxUPltdLCB1bmRlZmluZWQ+KHVuZGVmaW5lZCksXG4gICAgICBwYWlyd2lzZSgpLFxuICAgICAgZmlsdGVyKChbcHJpb3IsIGN1cnJlbnRdOiBEb2N1bWVudENoYW5nZVR1cGxlPFQ+KSA9PiBjdXJyZW50Lmxlbmd0aCA+IDAgfHwgIXByaW9yKSxcbiAgICAgIG1hcCgoWywgY3VycmVudF0pID0+IGN1cnJlbnQpLFxuICAgICAga2VlcFVuc3RhYmxlVW50aWxGaXJzdFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgc3RyZWFtIG9mIGNoYW5nZXMgYXMgdGhleSBvY2N1ciBpdCB0aW1lLiBUaGlzIG1ldGhvZCBpcyBzaW1pbGFyIHRvIHN0YXRlQ2hhbmdlcygpXG4gICAqIGJ1dCBpdCBjb2xsZWN0cyBlYWNoIGV2ZW50IGluIGFuIGFycmF5IG92ZXIgdGltZS5cbiAgICovXG4gIGF1ZGl0VHJhaWwoZXZlbnRzPzogRG9jdW1lbnRDaGFuZ2VUeXBlW10pOiBPYnNlcnZhYmxlPERvY3VtZW50Q2hhbmdlQWN0aW9uPFQ+W10+IHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZUNoYW5nZXMoZXZlbnRzKS5waXBlKHNjYW4oKGN1cnJlbnQsIGFjdGlvbikgPT4gWy4uLmN1cnJlbnQsIC4uLmFjdGlvbl0sIFtdKSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgc3RyZWFtIG9mIHN5bmNocm9uaXplZCBjaGFuZ2VzLiBUaGlzIG1ldGhvZCBrZWVwcyB0aGUgbG9jYWwgYXJyYXkgaW4gc29ydGVkXG4gICAqIHF1ZXJ5IG9yZGVyLlxuICAgKi9cbiAgc25hcHNob3RDaGFuZ2VzKGV2ZW50cz86IERvY3VtZW50Q2hhbmdlVHlwZVtdKTogT2JzZXJ2YWJsZTxEb2N1bWVudENoYW5nZUFjdGlvbjxUPltdPiB7XG4gICAgY29uc3QgdmFsaWRhdGVkRXZlbnRzID0gdmFsaWRhdGVFdmVudHNBcnJheShldmVudHMpO1xuICAgIGNvbnN0IHNjaGVkdWxlZFNvcnRlZENoYW5nZXMkID0gc29ydGVkQ2hhbmdlczxUPih0aGlzLnF1ZXJ5LCB2YWxpZGF0ZWRFdmVudHMsIHRoaXMuYWZzLnNjaGVkdWxlcnMub3V0c2lkZUFuZ3VsYXIpO1xuICAgIHJldHVybiBzY2hlZHVsZWRTb3J0ZWRDaGFuZ2VzJC5waXBlKFxuICAgICAga2VlcFVuc3RhYmxlVW50aWxGaXJzdFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogTGlzdGVuIHRvIGFsbCBkb2N1bWVudHMgaW4gdGhlIGNvbGxlY3Rpb24gYW5kIGl0cyBwb3NzaWJsZSBxdWVyeSBhcyBhbiBPYnNlcnZhYmxlLlxuICAgKlxuICAgKiBJZiB0aGUgYGlkRmllbGRgIG9wdGlvbiBpcyBwcm92aWRlZCwgZG9jdW1lbnQgSURzIGFyZSBpbmNsdWRlZCBhbmQgbWFwcGVkIHRvIHRoZVxuICAgKiBwcm92aWRlZCBgaWRGaWVsZGAgcHJvcGVydHkgbmFtZS5cbiAgICovXG4gIHZhbHVlQ2hhbmdlcygpOiBPYnNlcnZhYmxlPFRbXT47XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1lbXB0eS1wYXR0ZXJuXG4gIHZhbHVlQ2hhbmdlcyh7fSk6IE9ic2VydmFibGU8VFtdPjtcbiAgdmFsdWVDaGFuZ2VzPEsgZXh0ZW5kcyBzdHJpbmc+KG9wdGlvbnM6IHtpZEZpZWxkOiBLfSk6IE9ic2VydmFibGU8KFQgJiB7IFtUIGluIEtdOiBzdHJpbmcgfSlbXT47XG4gIHZhbHVlQ2hhbmdlczxLIGV4dGVuZHMgc3RyaW5nPihvcHRpb25zOiB7aWRGaWVsZD86IEt9ID0ge30pOiBPYnNlcnZhYmxlPFRbXT4ge1xuICAgIHJldHVybiBmcm9tQ29sbGVjdGlvblJlZjxUPih0aGlzLnF1ZXJ5LCB0aGlzLmFmcy5zY2hlZHVsZXJzLm91dHNpZGVBbmd1bGFyKVxuICAgICAgLnBpcGUoXG4gICAgICAgIG1hcChhY3Rpb25zID0+IGFjdGlvbnMucGF5bG9hZC5kb2NzLm1hcChhID0+IHtcbiAgICAgICAgICBpZiAob3B0aW9ucy5pZEZpZWxkKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAuLi5hLmRhdGEoKSBhcyBhbnksXG4gICAgICAgICAgICAgIC4uLnsgW29wdGlvbnMuaWRGaWVsZF06IGEuaWQgfVxuICAgICAgICAgICAgfSBhcyBUICYgeyBbVCBpbiBLXTogc3RyaW5nIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBhLmRhdGEoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKSxcbiAgICAgICAga2VlcFVuc3RhYmxlVW50aWxGaXJzdFxuICAgICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgcmVzdWx0cyBvZiB0aGUgcXVlcnkgb25jZS5cbiAgICovXG4gIGdldChvcHRpb25zPzogZmlyZWJhc2UuZmlyZXN0b3JlLkdldE9wdGlvbnMpIHtcbiAgICByZXR1cm4gZnJvbSh0aGlzLnF1ZXJ5LmdldChvcHRpb25zKSkucGlwZShcbiAgICAgIGtlZXBVbnN0YWJsZVVudGlsRmlyc3QsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgZGF0YSB0byBhIGNvbGxlY3Rpb24gcmVmZXJlbmNlLlxuICAgKlxuICAgKiBOb3RlOiBEYXRhIG9wZXJhdGlvbiBtZXRob2RzIGFyZSBkb25lIG9uIHRoZSByZWZlcmVuY2Ugbm90IHRoZSBxdWVyeS4gVGhpcyBtZWFuc1xuICAgKiB3aGVuIHlvdSB1cGRhdGUgZGF0YSBpdCBpcyBub3QgdXBkYXRpbmcgZGF0YSB0byB0aGUgd2luZG93IG9mIHlvdXIgcXVlcnkgdW5sZXNzXG4gICAqIHRoZSBkYXRhIGZpdHMgdGhlIGNyaXRlcmlhIG9mIHRoZSBxdWVyeS5cbiAgICovXG4gIGFkZChkYXRhOiBUKTogUHJvbWlzZTxEb2N1bWVudFJlZmVyZW5jZTxUPj4ge1xuICAgIHJldHVybiB0aGlzLnJlZi5hZGQoZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgcmVmZXJlbmNlIHRvIGEgc2luZ2xlIGRvY3VtZW50IGluIGEgY29sbGVjdGlvbi5cbiAgICovXG4gIGRvYzxUMiA9IFQ+KHBhdGg/OiBzdHJpbmcpOiBBbmd1bGFyRmlyZXN0b3JlRG9jdW1lbnQ8VDI+IHtcbiAgICAvLyBUT0RPIGlzIHRoZXJlIGEgYmV0dGVyIHdheSB0byBzb2x2ZSB0aGlzIHR5cGUgaXNzdWVcbiAgICByZXR1cm4gbmV3IEFuZ3VsYXJGaXJlc3RvcmVEb2N1bWVudCh0aGlzLnJlZi5kb2MocGF0aCkgYXMgYW55LCB0aGlzLmFmcyk7XG4gIH1cbn1cbiJdfQ==