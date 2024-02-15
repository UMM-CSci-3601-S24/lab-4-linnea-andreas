import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Todo } from './todo';
import { TodoService } from './todo.service';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { TodoComponent } from './todo.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-todo-profile',
  templateUrl: './todo-profile.component.html',
  styleUrls: ['./todo-profile.component.scss'],
  standalone: true,
  imports: [TodoComponent, MatCardModule]
})
export class TodoProfileComponent implements OnInit, OnDestroy {
  todo: Todo;
  error: { help: string, httpResponse: string, message: string};

  // This `Subject` will only ever emit one (empty) value when
  // `ngOnDestroy()` is called, i.e., when this component is
  // destroyed. That can be used ot tell any subscriptions to
  // terminate, allowing the system to free up their resources (like memory).
  private ngUnsubscribe = new Subject<void>();

  constructor(private snackBar: MatSnackBar, private route: ActivatedRoute, private todoService: TodoService) { }

  ngOnInit(): void {
      this.route.paramMap.pipe(
        map((paramMap: ParamMap) => paramMap.get('id')),
        switchMap((id: string) => this.todoService.getTodoById(id)),

        takeUntil(this.ngUnsubscribe)
      ).subscribe({
        next: todo => {
          this.todo = todo;
          return todo;
        },
        error: _err => {
          this.error = {
          help: 'There was a problem loading the todo – try again.',
          httpResponse: _err.message,
          message: _err.error?.title,
        };
        }
      });
  }
  ngOnDestroy() {
    // When the component is destroyed, we'll emit an empty
    // value as a way of saying that any active subscriptions should
    // shut themselves down so the system can free up any associated
    // resources, like memory.
    this.ngUnsubscribe.next();
    // Calling `complete()` says that this `Subject` is done and will
    // never send any further values.
    this.ngUnsubscribe.complete();
  }
}
