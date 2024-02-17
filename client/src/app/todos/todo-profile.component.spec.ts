import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { throwError } from 'rxjs';
import { ActivatedRouteStub } from '../../testing/activated-route-stub';
import { MockTodoService } from 'src/testing/todo.service.mock';
import { Todo } from './todo';
import { TodoService } from './todo.service';
import { TodoComponent } from './todo.component';
import { TodoProfileComponent } from './todo-profile.component';

describe('TodoProfileComponent', () => {
let component: TodoProfileComponent;
let fixture: ComponentFixture<TodoProfileComponent>;
const mockTodoService = new MockTodoService();
const chrisId = 'chris_id';
const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub({
  // Using the constructor here lets us try that branch in `activated-route-stub.ts`
  // and then we can choose a new parameter map in the tests if we choose
  id : chrisId
});

beforeEach(waitForAsync(() => {
  TestBed.configureTestingModule({
  imports: [
      RouterTestingModule,
      MatCardModule,
      TodoProfileComponent, TodoComponent
  ],
  providers: [
      { provide: TodoService, useValue: mockTodoService },
      { provide: ActivatedRoute, useValue: activatedRoute }
  ]
})
    .compileComponents();
}));

beforeEach(() => {
  fixture = TestBed.createComponent(TodoProfileComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
});

it('should create the component', () => {
  expect(component).toBeTruthy();
});


it('should navigate to a specific todo profile', () => {
  const expectedTodo: Todo = MockTodoService.testTodos[0];
  // Setting this should cause anyone subscribing to the paramMap
  // to update. Our `TodoProfileComponent` subscribes to that, so
  // it should update right away.
  activatedRoute.setParamMap({ id: expectedTodo._id });
  expect(component.todo).toEqual(expectedTodo);
});

it('should navigate to correct todo when the id parameter changes', () => {
  let expectedTodo: Todo = MockTodoService.testTodos[0];
  // Setting this should cause anyone subscribing to the paramMap
  // to update. Our `TodoProfileComponent` subscribes to that, so
  // it should update right away.
  activatedRoute.setParamMap({ id: expectedTodo._id });
  expect(component.todo).toEqual(expectedTodo);
  expectedTodo = MockTodoService.testTodos[1];
  activatedRoute.setParamMap({ id: expectedTodo._id });
  expect(component.todo).toEqual(expectedTodo);
});

it('should have `null` for the user for a bad ID', () => {
  activatedRoute.setParamMap({ id: 'badID' });

  // If the given ID doesn't map to a user, we expect the service
  // to return `null`, so we would expect the component's user
  // to also be `null`.
  expect(component.todo).toBeNull();
});

it('should set error data on observable error', () => {
  activatedRoute.setParamMap({ id: 'chris_id' });

  const mockError = { message: 'Test Error', error: { title: 'Error Title' } };

  const getTodoSpy = spyOn(mockTodoService, 'getTodoById')
  .and
  .returnValue(throwError(() => mockError));

  component.ngOnInit();

  expect(component.error).toEqual({
    help: 'There was a problem loading the todo – try again.',
    httpResponse: mockError.message,
    message: mockError.error.title
  });
  expect(getTodoSpy).toHaveBeenCalledWith(chrisId);
});

})
