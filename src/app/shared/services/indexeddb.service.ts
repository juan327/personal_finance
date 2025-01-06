import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IndexeddbService {
  private readonly dbName = 'personal_finance';

  constructor() {
  }

  public initDB(tables: {
    tableName: string,
    primaryKey: string,
  }[]): void {
    const request = indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      tables.forEach(table => {
        if (!db.objectStoreNames.contains(table.tableName)) {
          db.createObjectStore(table.tableName, { keyPath: table.primaryKey });
        }
      });
    };

    request.onerror = () => {
      console.error('Error al inicializar IndexedDB.');
    };
  }

  public addItem<T>(tableName: string, data: T): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([tableName], 'readwrite');
        const store = transaction.objectStore(tableName);
        const addRequest = store.add(data);

        addRequest.onsuccess = () => resolve(addRequest.result);
        addRequest.onerror = () => reject(addRequest.error);
      };

      request.onerror = () => reject(request.error);
    });
  }

  public getAllItems<T>(tableName: string, orderBy: string, order: 'asc' | 'desc' = 'asc'): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([tableName], 'readonly');
        const store = transaction.objectStore(tableName);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const items = getAllRequest.result;
  
          // Ordenar los elementos según el campo y el orden
          items.sort((a: any, b: any) => {
            if (order === 'asc') {
              return a[orderBy] > b[orderBy] ? 1 : -1;
            } else {
              return a[orderBy] < b[orderBy] ? 1 : -1;
            }
          });
  
          resolve(items);
        };

        //getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };

      request.onerror = () => reject(request.error);
    });
  }

  public getListPagination<T>(tableName: string, skip: number, take: number, orderBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([tableName], 'readonly');
        const store = transaction.objectStore(tableName);
        const direction = sortOrder === 'asc' ? 'next' : 'prev';
        const getAllRequest = store.openCursor(null, direction);
  
        const items: T[] = [];
        let index = 0;
  
        getAllRequest.onsuccess = (event: any) => {
          const cursor = event.target.result;
          if (cursor) {
            if (index >= skip && items.length < take) {
              items.push(cursor.value);
            }
            index++;
            cursor.continue();
          } else {
            resolve(items);
          }
        };

        //getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };

      request.onerror = () => reject(request.error);
    });
  }

  public getTotalRecords(tableName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
  
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([tableName], 'readonly');
        const store = transaction.objectStore(tableName);
        const countRequest = store.count();
  
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => reject(countRequest.error);
      };
  
      request.onerror = () => reject(request.error);
    });
  }
  

  public deleteItem(tableName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([tableName], 'readwrite');
        const store = transaction.objectStore(tableName);
        const deleteRequest = store.delete(id);

        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };

      request.onerror = () => reject(request.error);
    });
  }

  public updateItem<T>(tableName: string, id: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([tableName], 'readwrite');
        const store = transaction.objectStore(tableName);
        const putRequest = store.put({ ...data, id });

        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      request.onerror = () => reject(request.error);
    });
  }
}
