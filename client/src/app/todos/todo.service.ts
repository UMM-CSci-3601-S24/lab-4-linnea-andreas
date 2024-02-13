import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Todo } from './todo';
import { map } from 'rxjs/operators';
import { Company } from '../company-list/company';

@Injectable({
  providedIn: `root`
})
export class TodoService {
//the URL for the todos part of the server API.
readonly todoUrl: string = `${environment.apiUrl}todos`;
private readonly categoryKey = 'category'
private readonly ownerKey = 'owner'
private readonly bodyKey = 'body'

constructor(private httpClient: HttpClient) {
}

getTodos() : Observable<Todo[]> {
  let httpParams: HttpParams = new HttpParams();


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






}
