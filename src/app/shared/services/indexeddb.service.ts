import { Injectable } from '@angular/core';
import { DTOResponseListPagination } from '../dto/generic';

@Injectable({
  providedIn: 'root',
})
export class IndexeddbService {
  private readonly dbName = 'personal_finance';

  constructor() {
  }

  /**
   * Inicializa la base de datos
   * @param tables Tablas a crear
   */
  public initDB(tables: {
    tableName: string,
    primaryKey: string,
    indexes: {
      name: string,
      unique: boolean,
    }[],
  }[]): void {
    const request = indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      tables.forEach(table => {
        if (!db.objectStoreNames.contains(table.tableName)) {
          const objectStore = db.createObjectStore(table.tableName, { keyPath: table.primaryKey });

          table.indexes.forEach(index => {
            objectStore.createIndex(index.name, index.name, { unique: index.unique });
          });
        }
      });
    };

    request.onerror = () => {
      console.error('Error al inicializar IndexedDB.');
    };
  }

  /**
   * Agrega un elemento a una tabla
   * @param tableName Nombre de la tabla
   * @param data Elemento a agregar
   * @returns Promise<any>
   */
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

  /**
   * Obtiene todos los elementos de una tabla
   * @param tableName Nombre de la tabla
   * @param orderBy Campo por el que ordenar
   * @param sortOrder Orden de la tabla (asc o desc)
   * @returns Promise<DTOResponseListPagination<T>>
   */
  public getAllItems<T>(tableName: string, orderBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Promise<DTOResponseListPagination<T>> {
    return new Promise((resolve, reject) => {
      const requestDB = indexedDB.open(this.dbName);

      requestDB.onsuccess = (event: any) => {
        const db = event.target.result;
        const objectStore = db.transaction(tableName, 'readonly').objectStore(tableName);
        const direction = sortOrder === 'asc' ? 'next' : 'prev';

        const request = objectStore.index(orderBy).openCursor(null, direction);

        const results: any[] = [];
        request.onsuccess = (event: any) => {
          const cursor = event.target.result;
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            const objReturn: DTOResponseListPagination<T> = {
              items: results,
              total: results.length,
            };
            resolve(objReturn);
          }
        };

        request.onerror = (event: any) => reject(event.target.error);
      };

      requestDB.onerror = () => reject(requestDB.error);
    });
  }

  /**
   * Obtiene un elemento de una tabla
   * @param tableName Nombre de la tabla
   * @param id Id del elemento
   * @returns Promise<T>
   */
  public getItem<T>(tableName: string, id: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestDB = indexedDB.open(this.dbName);

      requestDB.onsuccess = (event: any) => {
        const db = event.target.result;
        const objectStore = db.transaction(tableName, 'readonly').objectStore(tableName);

        const request = objectStore.get(id);

        request.onsuccess = (event: any) => {
          const data = event.target.result;
          resolve(data);
        };

        request.onerror = (event: any) => reject(event.target.error);
      };

      requestDB.onerror = () => reject(requestDB.error);
    });
  }

  /**
   * Obtiene el total de registros de una tabla
   * @param tableName Nombre de la tabla
   * @returns Promise<number>
   */
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

  /**
   * Elimina un elemento de una tabla
   * @param tableName Nombre de la tabla
   * @param id Id del elemento
   * @returns Promise<void>
   */
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

  /**
   * Actualiza un elemento de una tabla
   * @param tableName Nombre de la tabla
   * @param id Id del elemento
   * @param data Elemento a actualizar
   * @returns Promise<void>
   */
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
