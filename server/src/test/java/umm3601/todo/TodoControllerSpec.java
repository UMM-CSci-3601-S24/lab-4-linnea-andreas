package umm3601.todo;

// import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
// import static org.junit.jupiter.api.Assertions.assertNotEquals;
// import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
// import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
// import static org.mockito.ArgumentMatchers.argThat;
// import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
// import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
// import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.bson.types.ObjectId;
// import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
// import org.mockito.ArgumentMatcher;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

// import com.fasterxml.jackson.core.JsonProcessingException;
// import com.fasterxml.jackson.databind.JsonMappingException;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import io.javalin.json.JavalinJackson;
// import io.javalin.validation.BodyValidator;
// import io.javalin.validation.ValidationException;
import io.javalin.validation.Validator;
import umm3601.user.UserController;


/**
 * Tests the logic of the TodoController
 *
 * @throws IOException
 */
@SuppressWarnings({ "MagicNumber" })
public class TodoControllerSpec {

  private TodoController todoController;

  private ObjectId samsId;

  // The client and database that will be used
  // for all the tests in this spec file.
  private static MongoClient mongoClient;
  private static MongoDatabase db;

    // Used to translate between JSON and POJOs.
    private static JavalinJackson javalinJackson = new JavalinJackson();

    @Mock
    private Context ctx;

    @Captor
    private ArgumentCaptor<ArrayList<Todo>> todoArrayListCaptor;

    @Captor
    private ArgumentCaptor<Todo> todoCaptor;

    @Captor
    private ArgumentCaptor<Map<String, String>> mapCaptor;

  /**
   * Sets up (the connection to the) DB once; that connection and DB will
   * then be (re)used for all the tests, and closed in the `teardown()`
   * method. It's somewhat expensive to establish a connection to the
   * database, and there are usually limits to how many connections
   * a database will support at once. Limiting ourselves to a single
   * connection that will be shared across all the tests in this spec
   * file helps both speed things up and reduce the load on the DB
   * engine.
   */

   @BeforeAll
   static void setupAll() {
     String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

     mongoClient = MongoClients.create(
         MongoClientSettings.builder()
             .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
             .build());
     db = mongoClient.getDatabase("test");
   }

   @BeforeEach
   void setupEach() throws IOException {
     // Reset our mock context and argument captor (declared with Mockito annotations
     // @Mock and @Captor)
     MockitoAnnotations.openMocks(this);

     // Setup database
     MongoCollection<Document> todoDocuments = db.getCollection("todos");
     todoDocuments.drop();
     List<Document> testTodos = new ArrayList<>();
     testTodos.add(
      new Document()
      .append("owner", "Chris")
      .append("status", true)
      .append("body", "this is the Test Body 1")
      .append("category", "homework")
      .append("avatar", "https://gravatar.com/avatar/8c9616d6cc5de638ea6920fb5d65fc6c?d=identicon"));
      testTodos.add(
        new Document()
        .append("owner", "Pat")
        .append("status", true)
        .append("body", "Hello body 2")
        .append("category", "video games")
        .append("avatar", "https://gravatar.com/avatar/b42a11826c3bde672bce7e06ad729d44?d=identicon"));
        testTodos.add(
          new Document()
          .append("owner", "Jamie")
          .append("status", false)
          .append("body", "I'm so sleepy")
          .append("category", "groceries")
          .append("avatar", "https://gravatar.com/avatar/d4a6c71dd9470ad4cf58f78c100258bf?d=identicon"));

      samsId = new ObjectId();
      Document sam = new Document()
      .append("_id", samsId)
      .append("owner", "sam")
      .append("status", false)
      .append("body", "sams body")
      .append("category", "video games")
      .append("avatar", "https://gravatar.com/avatar/08b7610b558a4cbbd20ae99072801f4d?d=identicon");
      todoDocuments.insertMany(testTodos);
      todoDocuments.insertOne(sam);

      todoController = new TodoController(db);
    }
    @Test
    public void canBuildController() throws IOException {
      Javalin mockServer = Mockito.mock(Javalin.class);
      todoController.addRoutes(mockServer);

      // Verify that calling `addRoutes()` above caused `get()` to be called
      // on the server at least twice. We use `any()` to say we don't care about
      // the arguments that were passed to `.get()`.
      verify(mockServer, Mockito.atLeast(2)).get(any(), any());
    }

  @Test
  void canGetAllTodos() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());

    todoController.getTodos(ctx);

        // Specifically, we want to pay attention to the ArrayList<User> that is passed
    // as input
    // when ctx.json is called --- what is the argument that was passed? We capture
    // it and can refer to it later
    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    // Check that the database collection holds the same number of documents as the
    // size of the captured List<User>
    assertEquals(db.getCollection("todos").countDocuments(), todoArrayListCaptor.getValue().size());
  }

  @Test
  void canGetTodosSortedByOwnerInDescOrder() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
    queryParams.put(TodoController.SORT_BY_KEY, Arrays.asList(new String[] {"owner"}));
    queryParams.put(TodoController.SORT_ORDER_KEY, Arrays.asList(new String[] {"desc"}));

    when(ctx.queryParamMap()).thenReturn(queryParams);
    when(ctx.queryParam(TodoController.SORT_BY_KEY)).thenReturn("owner");
    when(ctx.queryParam(TodoController.SORT_ORDER_KEY)).thenReturn("desc");

    todoController.getTodos(ctx);

    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    List<ArrayList<Todo>> todoList = todoArrayListCaptor.getAllValues();
    assertEquals(todoList.get(0).get(0).owner, "sam");
    assertEquals(todoList.get(0).get(3).owner, "Chris");
  }
  @Test
  void canGetTodosWithCategory() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
    queryParams.put(TodoController.CATEGORY_KEY, Arrays.asList(new String[] {"Homework"}));

    when(ctx.queryParamMap()).thenReturn(queryParams);
    when(ctx.queryParam(TodoController.CATEGORY_KEY)).thenReturn("homework");


    //.thenReturn(Validator.create(String.class, "homework", TodoController.CATEGORY_KEY));


    todoController.getTodos(ctx);

    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, todoArrayListCaptor.getValue().size());
  }

  @Test
  void getTodoWithExistentID() throws IOException {
    String id = samsId.toHexString();
    when(ctx.pathParam("id")).thenReturn(id);

    todoController.getTodo(ctx);

    verify(ctx).json(todoCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals("sam", todoCaptor.getValue().owner);
    assertEquals(samsId.toHexString(), todoCaptor.getValue()._id);
  }

  @Test
  void getTodoWithBadId() throws IOException {
    when(ctx.pathParam("id")).thenReturn("bad");

    Throwable exception = assertThrows(BadRequestResponse.class, () -> {
      todoController.getTodo(ctx);
    });

    assertEquals("The requested todo id wasn't a legal Mongo Object ID.", exception.getMessage());
}

@Test
void getTodoWithNonexistentId() throws IOException {
  String id = "588935f5c668650dc77df581";
  when(ctx.pathParam("id")).thenReturn(id);

  Throwable exception = assertThrows(NotFoundResponse.class, () -> {
    todoController.getTodo(ctx);
  });

  assertEquals("The requested todo was not found", exception.getMessage());
}


}
