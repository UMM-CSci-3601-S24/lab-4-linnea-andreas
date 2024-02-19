import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { Todo } from './todo';
import { TodoService } from './todo.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { TodoCardComponent } from './todo-card.component';

import { MatRadioModule } from '@angular/material/radio';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-todo-list-component',
  templateUrl: 'todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, FormsModule, MatSelectModule, MatOptionModule, MatRadioModule, TodoCardComponent, MatListModule, RouterLink, MatButtonModule, MatTooltipModule, MatIconModule]
})

export class TodoListComponent implements OnInit, OnDestroy {

  public serverFilteredTodos: Todo[];
  public filteredTodos: Todo[];
  public todoOwner: string;
  public todoStatus: boolean;
  public todoCategory: string;
  public todoBody: string;
  public limit: number;
  public viewType: 'card' | 'list' = 'card';

  errMsg = '';
  private ngUnsubscribe = new Subject<void>();

    /**
   * This constructor injects both an instance of `TodoService`
   * and an instance of `MatSnackBar` into this component.
   *
   * @param todoService the `TodoService` used to get todos from the server
   * @param snackBar the `MatSnackBar` used to display feedback
   */
    constructor(private todoService: TodoService, private snackBar: MatSnackBar) {
      // Nothing here – everything is in the injection parameters.
    }

    getTodosFromServer() {
      this.todoService.getTodos(
        // Filter the users by category
        //category: this.todoCategory
      ).pipe(
        takeUntil(this.ngUnsubscribe)
      ).subscribe({
        next: (returnedTodos) => {
          this.serverFilteredTodos = returnedTodos;
          this.updateFilter();
        },
        error: (err) => {
          if (err.error instanceof ErrorEvent) {
            this.errMsg = `Problem in the client – Error: ${err.error.message}`;
          } else {
            this.errMsg = `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`;
          }
          this.snackBar.open(
            this.errMsg,
            'OK',
            // The message will disappear after 6 seconds.
            { duration: 6000 });
        },
      })
    }

    public updateFilter() {
      this.filteredTodos = this.todoService.filterTodos(
        this.serverFilteredTodos, { body: this.todoBody, owner: this.todoOwner, status: this.todoStatus, limit: this.limit }
      )
    }

    ngOnInit(): void {
      this.getTodosFromServer();
    }

    /**
  * When this component is destroyed, we should unsubscribe to any
  * outstanding requests.
  */
    ngOnDestroy() {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }

}
