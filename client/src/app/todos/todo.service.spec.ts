import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Todo } from './todo'
import { TodoService } from './todo.service';

describe('TodoService', () => {
  // A small collection of test todos
  const testTodos: Todo[] = [
    {
      _id: 'chris_id',
      owner: 'Chris',
      status: true,
      body: 'UMM',
      category: 'homework',
      avatar: 'https://gravatar.com/avatar/8c9616d6cc5de638ea6920fb5d65fc6c?d=identicon'
    },
    {
      _id: 'pat_id',
      owner: 'Pat',
      status: true,
      body: 'IBM',
      category: 'video games',
      avatar: 'https://gravatar.com/avatar/b42a11826c3bde672bce7e06ad729d44?d=identicon'
    },
    {
      _id: 'jamie_id',
      owner: 'Jamie',
      status: false,
      body: 'Frogs, Inc.',
      category: 'software design',
      avatar: 'https://gravatar.com/avatar/d4a6c71dd9470ad4cf58f78c100258bf?d=identicon'
    }
  ];
  let todoService: TodoService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    // Construct an instance of the service with the mock
    // HTTP client.
    todoService = new TodoService(httpClient);

  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('when getTodos() is called with no parameters', () => {
    it('calls `api/todos`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      todoService.getTodos().subscribe((todos) => {
        expect(todos)
        .withContext('returns the test todos')
        .toBe(testTodos);

        expect(mockedMethod)
        .withContext('one call')
        .toHaveBeenCalledTimes(1);

        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams() });
      });
    }));
  });

  describe('When getTodos() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {

    it('correctly calls api/todos with filter parameter \'status\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

        todoService.getTodos({ status: true }).subscribe(() => {
          expect(mockedMethod)
            .withContext('one call')
            .toHaveBeenCalledTimes(1);
          // The mocked method should have been called with two arguments:
          //   * the appropriate URL ('/api/todos' defined in the `todoService`)
          //   * An options object containing an `HttpParams` with the `role`:`admin`
          //     key-value pair.
          expect(mockedMethod)
            .withContext('talks to the correct endpoint')
            .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('status', true) });
    });
  });

  it('correctly calls api/todos with filter parameter \'category\'', () => {
    const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      todoService.getTodos({ category: 'video games' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        // The mocked method should have been called with two arguments:
        //   * the appropriate URL ('/api/todos' defined in the `todoService`)
        //   * An options object containing an `HttpParams` with the `role`:`admin`
        //     key-value pair.
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('category', 'video games') });
  });
});

it('correctly calls api/todos with filter parameter \'owner\'', () => {
  const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

    todoService.getTodos({ owner: 'a'}).subscribe(() => {
      expect(mockedMethod)
        .withContext('one call')
        .toHaveBeenCalledTimes(1);
      // The mocked method should have been called with two arguments:
      //   * the appropriate URL ('/api/todos' defined in the `todoService`)
      //   * An options object containing an `HttpParams` with the `role`:`admin`
      //     key-value pair.
      expect(mockedMethod)
        .withContext('talks to the correct endpoint')
        .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('owner', 'a') });
});
});

});

  describe('getTodoById()', () => {
    it('calls api/todos/id with the correct URL', () => {
      const targetTodo: Todo = testTodos[1];
      const targetId: string = targetTodo._id;

      // Mock the `httpClient.get()` method so that instead of making an HTTP request
      // it just returns one todo from our test data
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetTodo));

      todoService.getTodoById(targetId).subscribe((todo) => {
        expect(todo).withContext('returns the target todo').toBe(targetTodo);
      })
      expect(mockedMethod)
      .withContext('one call')
      .toHaveBeenCalledTimes(1);
       expect(mockedMethod)
      .withContext('talks to the correct endpoint')
      .toHaveBeenCalledWith(`${todoService.todoUrl}/${targetId}`);
    })
    })
});
