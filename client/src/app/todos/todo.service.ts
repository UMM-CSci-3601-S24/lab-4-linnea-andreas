import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Todo } from './todo';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: `root`
})
export class TodoService {

//the URL for the todos part of the server API.
readonly todoUrl: string = `${environment.apiUrl}todos`;
private readonly categoryKey = 'category'
private readonly ownerKey = 'owner'
private readonly bodyKey = 'body'
private readonly statusKey = 'status'
private readonly sortByKey = 'sortby'


  constructor(private httpClient: HttpClient) {
  }


getTodos(filters?: {status?: boolean, category?: string, owner?: string, sortBy?: string, body?: string}) : Observable<Todo[]> {


  let httpParams: HttpParams = new HttpParams();
  if (filters) {
    if (filters.status != undefined){
      httpParams = httpParams.set(this.statusKey, filters.status);
    }
    if (filters.category){
      httpParams = httpParams.set(this.categoryKey, filters.category);
    }
    if (filters.owner){
      httpParams = httpParams.set(this.ownerKey, filters.owner);
    }
    if (filters.sortBy){
      httpParams = httpParams.set(this.sortByKey, filters.sortBy);
    }
    if (filters.body){
      httpParams = httpParams.set(this.bodyKey, filters.body);
    }
  }

    return this.httpClient.get<Todo[]>(this.todoUrl, {
      params: httpParams,
    });
  }

  /**
     * Get the `Todo` with the specified ID.
     *
     * @param id the ID of the desired todo
     * @returns an `Observable` containing the resulting todo.
     */
  getTodoById(id: string): Observable<Todo> {
    // The input to get could also be written as (this.todoUrl + '/' + id)
    return this.httpClient.get<Todo>(`${this.todoUrl}/${id}`);
  }

  addTodo(newTodo: Partial<Todo>): Observable<string> {
    // Send post request to add a new user with the user data as the body.
    return this.httpClient.post<{ id: string }>(this.todoUrl, newTodo).pipe(map(res => res.id));
  }



}
